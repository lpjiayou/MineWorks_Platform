from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from uuid import uuid4

from app.contracts.history import (
    CalculationRecordCreate, CalculationRecordResponse, CalculationRecordUpdate,
    ProjectCreate, ProjectMemberResponse, ProjectResponse, ReusePackageResponse, ReuseValue,
)
from app.database import connect
from app.services import auth_service
from app.services.audit_service import write_audit
from app.services.authorization_service import PROJECT_ROLE_RANK, has_project_role, project_role


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _loads(value: str):
    return json.loads(value)


def _project_from_row(row: sqlite3.Row | None, user_id: str | None = None) -> ProjectResponse | None:
    if row is None:
        return None
    role = project_role(user_id, row["id"]) if user_id else None
    return ProjectResponse(
        id=row["id"], name=row["name"], code=row["code"], description=row["description"], status=row["status"],
        team_id=row["team_id"] if "team_id" in row.keys() else None,
        owner_user_id=row["owner_user_id"] if "owner_user_id" in row.keys() else None,
        created_by=row["created_by"] if "created_by" in row.keys() else None,
        visibility=(row["visibility"] if "visibility" in row.keys() and row["visibility"] else "team"),
        my_role=role,
        record_count=int(row["record_count"] if "record_count" in row.keys() else 0),
        member_count=int(row["member_count"] if "member_count" in row.keys() else 0),
        created_at=row["created_at"], updated_at=row["updated_at"],
    )


def create_project(payload: ProjectCreate, *, user_id: str, team_id: str) -> ProjectResponse:
    now = utc_now(); project_id = f"prj_{uuid4().hex[:16]}"
    try:
        with connect() as connection:
            connection.execute(
                """INSERT INTO projects(id,name,code,description,status,created_at,updated_at,team_id,owner_user_id,created_by,visibility)
                VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
                (project_id,payload.name.strip(),payload.code.strip() if payload.code else None,payload.description.strip(),
                 "active",now,now,team_id,user_id,user_id,payload.visibility),
            )
            connection.execute(
                "INSERT INTO project_members(project_id,user_id,role,status,added_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
                (project_id,user_id,"owner","active",user_id,now,now),
            )
    except sqlite3.IntegrityError as error:
        raise ValueError("项目编号已存在。") from error
    write_audit(actor_user_id=user_id,team_id=team_id,project_id=project_id,action="project.create",resource_type="project",resource_id=project_id,
                metadata={"visibility":payload.visibility})
    project = get_project(project_id,user_id=user_id)
    if project is None:
        raise RuntimeError("项目创建后无法读取。")
    return project


def list_projects(*, user_id: str, team_id: str, include_archived: bool = False) -> list[ProjectResponse]:
    status_clause = "" if include_archived else "AND p.status='active'"
    with connect() as connection:
        rows = connection.execute(
            f"""
            SELECT p.*,COUNT(DISTINCT r.id) AS record_count,COUNT(DISTINCT pm_all.user_id) AS member_count
            FROM projects p
            JOIN team_members tm ON tm.team_id=p.team_id AND tm.user_id=? AND tm.status='active'
            LEFT JOIN project_members pm ON pm.project_id=p.id AND pm.user_id=? AND pm.status='active'
            LEFT JOIN project_members pm_all ON pm_all.project_id=p.id AND pm_all.status='active'
            LEFT JOIN calculation_records r ON r.project_id=p.id
            WHERE p.team_id=? {status_clause}
              AND (p.visibility='team' OR p.owner_user_id=? OR pm.user_id IS NOT NULL OR tm.role IN ('owner','admin'))
            GROUP BY p.id ORDER BY p.updated_at DESC
            """, (user_id,user_id,team_id,user_id)
        ).fetchall()
    return [_project_from_row(row,user_id) for row in rows if row is not None]


def get_project(project_id: str, *, user_id: str | None = None) -> ProjectResponse | None:
    if user_id and project_role(user_id,project_id) is None:
        return None
    with connect() as connection:
        row=connection.execute(
            """SELECT p.*,COUNT(DISTINCT r.id) AS record_count,COUNT(DISTINCT pm.user_id) AS member_count
            FROM projects p LEFT JOIN calculation_records r ON r.project_id=p.id
            LEFT JOIN project_members pm ON pm.project_id=p.id AND pm.status='active'
            WHERE p.id=? GROUP BY p.id""", (project_id,)
        ).fetchone()
    return _project_from_row(row,user_id)


def list_project_members(project_id: str) -> list[ProjectMemberResponse]:
    with connect() as connection:
        rows=connection.execute(
            """SELECT pm.user_id,u.email,u.display_name,pm.role,pm.status,pm.created_at,pm.updated_at
            FROM project_members pm JOIN users u ON u.id=pm.user_id
            WHERE pm.project_id=? ORDER BY CASE pm.role WHEN 'owner' THEN 1 WHEN 'manager' THEN 2 WHEN 'editor' THEN 3 ELSE 4 END,u.display_name""",
            (project_id,)
        ).fetchall()
    return [ProjectMemberResponse(**dict(row)) for row in rows]


def add_project_member(project_id: str,email: str,role: str,actor_user_id: str) -> ProjectMemberResponse:
    user=auth_service.get_user_by_email(email)
    if user is None:
        raise LookupError("该邮箱尚未注册。")
    project=get_project(project_id,user_id=actor_user_id)
    if project is None:
        raise PermissionError("无权访问该项目。")
    team_ids={team.id for team in auth_service.list_user_teams(user.id)}
    if project.team_id not in team_ids:
        raise ValueError("该用户尚未加入项目所属团队。")
    now=utc_now()
    with connect() as connection:
        existing=connection.execute("SELECT 1 FROM project_members WHERE project_id=? AND user_id=?", (project_id,user.id)).fetchone()
        if existing:
            connection.execute("UPDATE project_members SET role=?,status='active',updated_at=? WHERE project_id=? AND user_id=?",
                               (role,now,project_id,user.id))
        else:
            connection.execute("INSERT INTO project_members(project_id,user_id,role,status,added_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",
                               (project_id,user.id,role,"active",actor_user_id,now,now))
    write_audit(actor_user_id=actor_user_id,team_id=project.team_id,project_id=project_id,action="project.member.add",resource_type="user",resource_id=user.id,
                metadata={"role":role})
    return next(item for item in list_project_members(project_id) if item.user_id==user.id)


def update_project_member(project_id:str,user_id:str,role:str,actor_user_id:str)->ProjectMemberResponse:
    project=get_project(project_id,user_id=actor_user_id)
    if project is None: raise PermissionError("无权访问该项目。")
    with connect() as connection:
        row=connection.execute("SELECT role FROM project_members WHERE project_id=? AND user_id=? AND status='active'",(project_id,user_id)).fetchone()
        if row is None: raise LookupError("项目成员不存在。")
        if row["role"]=="owner": raise ValueError("项目所有者角色不能在成员列表中修改。")
        connection.execute("UPDATE project_members SET role=?,updated_at=? WHERE project_id=? AND user_id=?",(role,utc_now(),project_id,user_id))
    write_audit(actor_user_id=actor_user_id,team_id=project.team_id,project_id=project_id,action="project.member.role.update",resource_type="user",resource_id=user_id,
                metadata={"old_role":row["role"],"new_role":role})
    return next(item for item in list_project_members(project_id) if item.user_id==user_id)


def remove_project_member(project_id:str,user_id:str,actor_user_id:str)->None:
    project=get_project(project_id,user_id=actor_user_id)
    if project is None: raise PermissionError("无权访问该项目。")
    with connect() as connection:
        row=connection.execute("SELECT role FROM project_members WHERE project_id=? AND user_id=? AND status='active'",(project_id,user_id)).fetchone()
        if row is None: raise LookupError("项目成员不存在。")
        if row["role"]=="owner": raise ValueError("不能移除项目所有者。")
        connection.execute("UPDATE project_members SET status='suspended',updated_at=? WHERE project_id=? AND user_id=?",(utc_now(),project_id,user_id))
    write_audit(actor_user_id=actor_user_id,team_id=project.team_id,project_id=project_id,action="project.member.remove",resource_type="user",resource_id=user_id)


def _record_from_row(row: sqlite3.Row,user_id:str|None=None) -> CalculationRecordResponse:
    project=get_project(row["project_id"],user_id=user_id) if row["project_id"] else None
    return CalculationRecordResponse(
        id=row["id"],source_request_id=row["source_request_id"],tool_id=row["tool_id"],tool_name=row["tool_name"],
        tool_version=row["tool_version"],formula_version=row["formula_version"],title=row["title"],project_id=row["project_id"],
        team_id=row["team_id"] if "team_id" in row.keys() else None,owner_user_id=row["owner_user_id"] if "owner_user_id" in row.keys() else None,
        created_by=row["created_by"] if "created_by" in row.keys() else None,data_source=row["data_source"],validity=row["validity"],
        computed_at=row["computed_at"],saved_at=row["saved_at"],updated_at=row["updated_at"],inputs=_loads(row["inputs_json"]),
        normalized_inputs=_loads(row["normalized_inputs_json"]),results=_loads(row["results_json"]),steps=_loads(row["steps_json"]),
        warnings=_loads(row["warnings_json"]),assumptions=_loads(row["assumptions_json"]),reusable_outputs=_loads(row["reusable_outputs_json"]),
        tags=_loads(row["tags_json"]),note=row["note"],project=project,
    )


def _record_accessible(row:sqlite3.Row,user_id:str)->bool:
    if row["owner_user_id"]==user_id: return True
    return bool(row["project_id"] and project_role(user_id,row["project_id"]) is not None)


def _record_writable(row:sqlite3.Row,user_id:str)->bool:
    if row["owner_user_id"]==user_id: return True
    return bool(row["project_id"] and has_project_role(user_id,row["project_id"],"editor"))


def create_calculation_record(payload:CalculationRecordCreate,*,user_id:str,team_id:str)->CalculationRecordResponse:
    if payload.project_id:
        project=get_project(payload.project_id,user_id=user_id)
        if project is None: raise LookupError("指定项目不存在或无权访问。")
        if not has_project_role(user_id,payload.project_id,"editor"): raise PermissionError("当前项目角色无权保存计算记录。")
        if project.team_id!=team_id: raise PermissionError("项目不属于当前团队。")
    now=utc_now(); record_id=f"calc_{uuid4().hex[:18]}"
    values=(record_id,payload.source_request_id,payload.tool_id,payload.tool_name,payload.tool_version,payload.formula_version,
            payload.title.strip(),payload.project_id,payload.data_source,payload.validity,payload.computed_at,now,now,
            json.dumps(payload.inputs,ensure_ascii=False),json.dumps(payload.normalized_inputs,ensure_ascii=False),
            json.dumps(payload.results,ensure_ascii=False),json.dumps(payload.steps,ensure_ascii=False),json.dumps(payload.warnings,ensure_ascii=False),
            json.dumps(payload.assumptions,ensure_ascii=False),json.dumps([item.model_dump() for item in payload.reusable_outputs],ensure_ascii=False),
            json.dumps(payload.tags,ensure_ascii=False),payload.note.strip(),team_id,user_id,user_id)
    with connect() as connection:
        connection.execute(
            """INSERT INTO calculation_records(id,source_request_id,tool_id,tool_name,tool_version,formula_version,title,project_id,
            data_source,validity,computed_at,saved_at,updated_at,inputs_json,normalized_inputs_json,results_json,steps_json,warnings_json,
            assumptions_json,reusable_outputs_json,tags_json,note,team_id,owner_user_id,created_by)
            VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",values)
        if payload.project_id: connection.execute("UPDATE projects SET updated_at=? WHERE id=?",(now,payload.project_id))
    write_audit(actor_user_id=user_id,team_id=team_id,project_id=payload.project_id,action="record.create",resource_type="calculation_record",resource_id=record_id,
                metadata={"tool_id":payload.tool_id,"validity":payload.validity})
    record=get_calculation_record(record_id,user_id=user_id)
    if record is None: raise RuntimeError("计算记录保存后无法读取。")
    return record


def get_calculation_record(record_id:str,*,user_id:str)->CalculationRecordResponse|None:
    with connect() as connection: row=connection.execute("SELECT * FROM calculation_records WHERE id=?",(record_id,)).fetchone()
    if row is None or not _record_accessible(row,user_id): return None
    return _record_from_row(row,user_id)


def list_calculation_records(*,user_id:str,team_id:str,tool_id:str|None=None,project_id:str|None=None,query:str|None=None,limit:int=100)->list[CalculationRecordResponse]:
    clauses=["team_id=?"]; parameters:list[object]=[team_id]
    if tool_id: clauses.append("tool_id=?"); parameters.append(tool_id)
    if project_id: clauses.append("project_id=?"); parameters.append(project_id)
    if query:
        clauses.append("(title LIKE ? OR tool_name LIKE ? OR note LIKE ?)"); pattern=f"%{query}%"; parameters.extend([pattern,pattern,pattern])
    parameters.append(max(1,min(limit,200)))
    with connect() as connection:
        rows=connection.execute(f"SELECT * FROM calculation_records WHERE {' AND '.join(clauses)} ORDER BY saved_at DESC LIMIT ?",parameters).fetchall()
    return [_record_from_row(row,user_id) for row in rows if _record_accessible(row,user_id)]


def update_calculation_record(record_id:str,payload:CalculationRecordUpdate,*,user_id:str,team_id:str)->CalculationRecordResponse|None:
    with connect() as connection: row=connection.execute("SELECT * FROM calculation_records WHERE id=?",(record_id,)).fetchone()
    if row is None or not _record_accessible(row,user_id): return None
    if not _record_writable(row,user_id): raise PermissionError("当前角色无权修改该记录。")
    current=_record_from_row(row,user_id)
    project_id=None if payload.clear_project else (payload.project_id if payload.project_id is not None else current.project_id)
    if project_id:
        project=get_project(project_id,user_id=user_id)
        if project is None or project.team_id!=team_id: raise LookupError("指定项目不存在或无权访问。")
        if not has_project_role(user_id,project_id,"editor"): raise PermissionError("当前项目角色无权写入记录。")
    now=utc_now(); title=payload.title if payload.title is not None else current.title
    tags=payload.tags if payload.tags is not None else current.tags; note=payload.note if payload.note is not None else current.note
    with connect() as connection:
        connection.execute("UPDATE calculation_records SET title=?,project_id=?,tags_json=?,note=?,updated_at=? WHERE id=?",
                           (title,project_id,json.dumps(tags,ensure_ascii=False),note,now,record_id))
    write_audit(actor_user_id=user_id,team_id=team_id,project_id=project_id,action="record.update",resource_type="calculation_record",resource_id=record_id)
    return get_calculation_record(record_id,user_id=user_id)


def delete_calculation_record(record_id:str,*,user_id:str,team_id:str)->bool:
    with connect() as connection: row=connection.execute("SELECT * FROM calculation_records WHERE id=?",(record_id,)).fetchone()
    if row is None or not _record_accessible(row,user_id): return False
    if not _record_writable(row,user_id): raise PermissionError("当前角色无权删除该记录。")
    with connect() as connection: cursor=connection.execute("DELETE FROM calculation_records WHERE id=?",(record_id,))
    write_audit(actor_user_id=user_id,team_id=team_id,project_id=row["project_id"],action="record.delete",resource_type="calculation_record",resource_id=record_id)
    return cursor.rowcount>0


def build_reuse_package(record_id:str,target_tool_id:str,*,user_id:str)->ReusePackageResponse|None:
    record=get_calculation_record(record_id,user_id=user_id)
    if record is None: return None
    values:list[ReuseValue]=[]
    for output in record.reusable_outputs:
        output_data=output.model_dump() if hasattr(output,"model_dump") else output
        for mapping in output_data.get("mappings",[]):
            if mapping.get("target_tool_id")!=target_tool_id: continue
            values.append(ReuseValue(source_key=output_data["key"],source_label=output_data["label"],target_field=mapping["target_field"],
                                     value=float(output_data["value"]),unit=mapping["target_unit"],target_mode=mapping.get("target_mode")))
    warnings=[]
    if not values: warnings.append("该记录没有可直接映射到目标工具的字段。")
    if record.validity!="VALID": warnings.append(f"来源记录状态为 {record.validity}，复用前应重新核对。")
    return ReusePackageResponse(record_id=record.id,source_tool_id=record.tool_id,source_tool_name=record.tool_name,
                                target_tool_id=target_tool_id,values=values,warnings=warnings)
