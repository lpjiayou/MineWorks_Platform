from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.contracts.history import (
    CalculationRecordCreate,CalculationRecordListResponse,CalculationRecordResponse,CalculationRecordUpdate,
    ProjectCreate,ProjectListResponse,ProjectMemberAdd,ProjectMemberResponse,ProjectMemberRoleUpdate,ProjectResponse,ReusePackageResponse,
)
from app.security.dependencies import AuthContext, get_auth_context, require_active_team, require_team_permission
from app.services import entitlement_service, history_service
from app.services.authorization_service import has_project_role

router=APIRouter(tags=["projects-and-history"])


@router.post("/projects",response_model=ProjectResponse,status_code=status.HTTP_201_CREATED)
def create_project(payload:ProjectCreate,context:AuthContext=Depends(require_team_permission("project.create")))->ProjectResponse:
    try:
        entitlement_service.assert_feature(context.user.id,context.active_team.id,"project.workspace")  # type: ignore[union-attr]
        entitlement_service.assert_quota(context.user.id,context.active_team.id,"projects.total")  # type: ignore[union-attr]
        return history_service.create_project(payload,user_id=context.user.id,team_id=context.active_team.id)  # type: ignore[union-attr]
    except PermissionError as error: raise HTTPException(status_code=403,detail={"code":"FEATURE_NOT_ENTITLED","message":str(error)}) from error
    except OverflowError as error: raise HTTPException(status_code=429,detail={"code":"QUOTA_EXCEEDED","message":str(error),"metric":"projects.total"}) from error
    except ValueError as error: raise HTTPException(status_code=409,detail={"code":"PROJECT_CODE_EXISTS","message":str(error)}) from error


@router.get("/projects",response_model=ProjectListResponse)
def list_projects(include_archived:bool=False,context:AuthContext=Depends(require_active_team))->ProjectListResponse:
    items=history_service.list_projects(user_id=context.user.id,team_id=context.active_team.id,include_archived=include_archived)  # type: ignore[union-attr]
    return ProjectListResponse(items=items,total=len(items))


@router.get("/projects/{project_id}",response_model=ProjectResponse)
def get_project(project_id:str,context:AuthContext=Depends(get_auth_context))->ProjectResponse:
    project=history_service.get_project(project_id,user_id=context.user.id)
    if project is None: raise HTTPException(status_code=404,detail={"code":"PROJECT_NOT_FOUND","message":"项目不存在或无权访问。"})
    return project


@router.get("/projects/{project_id}/members",response_model=list[ProjectMemberResponse])
def list_project_members(project_id:str,context:AuthContext=Depends(get_auth_context))->list[ProjectMemberResponse]:
    if not has_project_role(context.user.id,project_id,"viewer"):
        raise HTTPException(status_code=404,detail={"code":"PROJECT_NOT_FOUND","message":"项目不存在或无权访问。"})
    return history_service.list_project_members(project_id)


@router.post("/projects/{project_id}/members",response_model=ProjectMemberResponse,status_code=status.HTTP_201_CREATED)
def add_project_member(project_id:str,payload:ProjectMemberAdd,context:AuthContext=Depends(get_auth_context))->ProjectMemberResponse:
    if not has_project_role(context.user.id,project_id,"manager"):
        raise HTTPException(status_code=403,detail={"code":"PERMISSION_DENIED","message":"当前项目角色无权管理成员。"})
    try: return history_service.add_project_member(project_id,payload.email,payload.role,context.user.id)
    except LookupError as error: raise HTTPException(status_code=404,detail={"code":"USER_NOT_FOUND","message":str(error)}) from error
    except ValueError as error: raise HTTPException(status_code=409,detail={"code":"TEAM_MEMBERSHIP_REQUIRED","message":str(error)}) from error


@router.patch("/projects/{project_id}/members/{user_id}",response_model=ProjectMemberResponse)
def update_project_member(project_id:str,user_id:str,payload:ProjectMemberRoleUpdate,context:AuthContext=Depends(get_auth_context))->ProjectMemberResponse:
    if not has_project_role(context.user.id,project_id,"manager"):
        raise HTTPException(status_code=403,detail={"code":"PERMISSION_DENIED","message":"当前项目角色无权管理成员。"})
    try: return history_service.update_project_member(project_id,user_id,payload.role,context.user.id)
    except LookupError as error: raise HTTPException(status_code=404,detail={"code":"MEMBER_NOT_FOUND","message":str(error)}) from error
    except ValueError as error: raise HTTPException(status_code=409,detail={"code":"PROJECT_OWNER_PROTECTED","message":str(error)}) from error


@router.delete("/projects/{project_id}/members/{user_id}",status_code=status.HTTP_204_NO_CONTENT)
def remove_project_member(project_id:str,user_id:str,context:AuthContext=Depends(get_auth_context))->None:
    if not has_project_role(context.user.id,project_id,"manager"):
        raise HTTPException(status_code=403,detail={"code":"PERMISSION_DENIED","message":"当前项目角色无权管理成员。"})
    try: history_service.remove_project_member(project_id,user_id,context.user.id)
    except LookupError as error: raise HTTPException(status_code=404,detail={"code":"MEMBER_NOT_FOUND","message":str(error)}) from error
    except ValueError as error: raise HTTPException(status_code=409,detail={"code":"PROJECT_OWNER_PROTECTED","message":str(error)}) from error


@router.post("/calculation-records",response_model=CalculationRecordResponse,status_code=status.HTTP_201_CREATED)
def create_record(payload:CalculationRecordCreate,context:AuthContext=Depends(require_team_permission("record.create")))->CalculationRecordResponse:
    try:
        entitlement_service.assert_feature(context.user.id,context.active_team.id,"history.save")  # type: ignore[union-attr]
        entitlement_service.assert_quota(context.user.id,context.active_team.id,"records.total")  # type: ignore[union-attr]
        return history_service.create_calculation_record(payload,user_id=context.user.id,team_id=context.active_team.id)  # type: ignore[union-attr]
    except OverflowError as error: raise HTTPException(status_code=429,detail={"code":"QUOTA_EXCEEDED","message":str(error),"metric":"records.total"}) from error
    except LookupError as error: raise HTTPException(status_code=404,detail={"code":"PROJECT_NOT_FOUND","message":str(error)}) from error
    except PermissionError as error: raise HTTPException(status_code=403,detail={"code":"PERMISSION_DENIED","message":str(error)}) from error


@router.get("/calculation-records",response_model=CalculationRecordListResponse)
def list_records(tool_id:str|None=None,project_id:str|None=None,q:str|None=None,limit:int=Query(default=100,ge=1,le=200),
                 context:AuthContext=Depends(require_active_team))->CalculationRecordListResponse:
    items=history_service.list_calculation_records(user_id=context.user.id,team_id=context.active_team.id,tool_id=tool_id,project_id=project_id,query=q,limit=limit)  # type: ignore[union-attr]
    return CalculationRecordListResponse(items=items,total=len(items))


@router.get("/calculation-records/{record_id}",response_model=CalculationRecordResponse)
def get_record(record_id:str,context:AuthContext=Depends(get_auth_context))->CalculationRecordResponse:
    record=history_service.get_calculation_record(record_id,user_id=context.user.id)
    if record is None: raise HTTPException(status_code=404,detail={"code":"RECORD_NOT_FOUND","message":"计算记录不存在或无权访问。"})
    return record


@router.patch("/calculation-records/{record_id}",response_model=CalculationRecordResponse)
def update_record(record_id:str,payload:CalculationRecordUpdate,context:AuthContext=Depends(require_active_team))->CalculationRecordResponse:
    try: record=history_service.update_calculation_record(record_id,payload,user_id=context.user.id,team_id=context.active_team.id)  # type: ignore[union-attr]
    except LookupError as error: raise HTTPException(status_code=404,detail={"code":"PROJECT_NOT_FOUND","message":str(error)}) from error
    except PermissionError as error: raise HTTPException(status_code=403,detail={"code":"PERMISSION_DENIED","message":str(error)}) from error
    if record is None: raise HTTPException(status_code=404,detail={"code":"RECORD_NOT_FOUND","message":"计算记录不存在或无权访问。"})
    return record


@router.delete("/calculation-records/{record_id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_record(record_id:str,context:AuthContext=Depends(require_active_team))->None:
    try: deleted=history_service.delete_calculation_record(record_id,user_id=context.user.id,team_id=context.active_team.id)  # type: ignore[union-attr]
    except PermissionError as error: raise HTTPException(status_code=403,detail={"code":"PERMISSION_DENIED","message":str(error)}) from error
    if not deleted: raise HTTPException(status_code=404,detail={"code":"RECORD_NOT_FOUND","message":"计算记录不存在或无权访问。"})


@router.get("/calculation-records/{record_id}/reuse",response_model=ReusePackageResponse)
def reuse_record(record_id:str,target_tool_id:str,context:AuthContext=Depends(get_auth_context))->ReusePackageResponse:
    package=history_service.build_reuse_package(record_id,target_tool_id,user_id=context.user.id)
    if package is None: raise HTTPException(status_code=404,detail={"code":"RECORD_NOT_FOUND","message":"计算记录不存在或无权访问。"})
    return package
