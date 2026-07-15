from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.contracts.auth import TeamInvitationResponse, TeamMemberResponse, TeamResponse
from app.database import connect
from app.security.tokens import create_token, hash_token
from app.services import auth_service, entitlement_service
from app.services.audit_service import write_audit
from app.services.authorization_service import count_team_owners
from app.settings import get_settings


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_text(value: datetime | None = None) -> str:
    return (value or utc_now()).isoformat()


def create_team(user_id: str, name: str) -> TeamResponse:
    now = utc_text()
    with connect() as connection:
        team_id = auth_service._create_team(connection, user_id, name.strip(), now)
    write_audit(actor_user_id=user_id, team_id=team_id, action="team.create", resource_type="team", resource_id=team_id)
    return next(team for team in auth_service.list_user_teams(user_id) if team.id == team_id)


def list_members(team_id: str) -> list[TeamMemberResponse]:
    with connect() as connection:
        rows = connection.execute(
            """SELECT tm.user_id,u.email,u.display_name,tm.role,tm.status,tm.joined_at
            FROM team_members tm JOIN users u ON u.id=tm.user_id
            WHERE tm.team_id=? ORDER BY CASE tm.role WHEN 'owner' THEN 1 WHEN 'admin' THEN 2 WHEN 'engineer' THEN 3 ELSE 4 END,u.display_name""",
            (team_id,),
        ).fetchall()
    return [TeamMemberResponse(**dict(row)) for row in rows]


def add_existing_member(team_id: str, email: str, role: str, actor_user_id: str) -> TeamMemberResponse:
    user = auth_service.get_user_by_email(email)
    if user is None:
        raise LookupError("该邮箱尚未注册，请先创建邀请。")
    now = utc_text()
    with connect() as connection:
        existing = connection.execute("SELECT status FROM team_members WHERE team_id=? AND user_id=?", (team_id,user.id)).fetchone()
        if existing:
            connection.execute("UPDATE team_members SET role=?,status='active' WHERE team_id=? AND user_id=?", (role,team_id,user.id))
        else:
            connection.execute("INSERT INTO team_members(team_id,user_id,role,status,joined_at,invited_by) VALUES(?,?,?,?,?,?)",
                               (team_id,user.id,role,"active",now,actor_user_id))
        connection.execute("UPDATE teams SET updated_at=? WHERE id=?", (now,team_id))
    write_audit(actor_user_id=actor_user_id,team_id=team_id,action="team.member.add",resource_type="user",resource_id=user.id,metadata={"role":role})
    return next(item for item in list_members(team_id) if item.user_id==user.id)


def update_member_role(team_id: str, user_id: str, role: str, actor_user_id: str) -> TeamMemberResponse:
    with connect() as connection:
        current = connection.execute("SELECT role FROM team_members WHERE team_id=? AND user_id=? AND status='active'", (team_id,user_id)).fetchone()
        if current is None:
            raise LookupError("团队成员不存在。")
        if current["role"] == "owner" and role != "owner" and count_team_owners(connection, team_id) <= 1:
            raise ValueError("团队必须至少保留一名所有者。")
        connection.execute("UPDATE team_members SET role=? WHERE team_id=? AND user_id=?", (role,team_id,user_id))
    write_audit(actor_user_id=actor_user_id,team_id=team_id,action="team.member.role.update",resource_type="user",resource_id=user_id,
                metadata={"old_role":current["role"],"new_role":role})
    return next(item for item in list_members(team_id) if item.user_id==user_id)


def remove_member(team_id: str, user_id: str, actor_user_id: str) -> None:
    with connect() as connection:
        current = connection.execute("SELECT role FROM team_members WHERE team_id=? AND user_id=? AND status='active'", (team_id,user_id)).fetchone()
        if current is None:
            raise LookupError("团队成员不存在。")
        if current["role"] == "owner" and count_team_owners(connection, team_id) <= 1:
            raise ValueError("不能移除团队最后一名所有者。")
        connection.execute("UPDATE team_members SET status='suspended' WHERE team_id=? AND user_id=?", (team_id,user_id))
    write_audit(actor_user_id=actor_user_id,team_id=team_id,action="team.member.remove",resource_type="user",resource_id=user_id)


def create_invitation(team_id: str, email: str, role: str, actor_user_id: str) -> TeamInvitationResponse:
    token = create_token()
    now = utc_now(); expires = now + timedelta(hours=get_settings().invitation_ttl_hours)
    invitation_id = f"inv_{uuid4().hex[:18]}"
    with connect() as connection:
        connection.execute("UPDATE team_invitations SET status='revoked' WHERE team_id=? AND email=? AND status='pending'", (team_id,email))
        connection.execute(
            "INSERT INTO team_invitations(id,team_id,email,role,token_hash,status,expires_at,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (invitation_id,team_id,email,role,hash_token(token),"pending",utc_text(expires),actor_user_id,utc_text(now)),
        )
    write_audit(actor_user_id=actor_user_id,team_id=team_id,action="team.invitation.create",resource_type="invitation",resource_id=invitation_id,
                metadata={"email":email,"role":role})
    return TeamInvitationResponse(id=invitation_id,team_id=team_id,email=email,role=role,status="pending",expires_at=utc_text(expires),created_at=utc_text(now),accept_token=token)


def list_invitations(team_id: str) -> list[TeamInvitationResponse]:
    now = utc_now()
    with connect() as connection:
        rows = connection.execute("SELECT * FROM team_invitations WHERE team_id=? ORDER BY created_at DESC", (team_id,)).fetchall()
    items=[]
    for row in rows:
        status=row["status"]
        if status=="pending" and datetime.fromisoformat(row["expires_at"])<=now:
            status="expired"
        items.append(TeamInvitationResponse(id=row["id"],team_id=row["team_id"],email=row["email"],role=row["role"],status=status,
                                            expires_at=row["expires_at"],created_at=row["created_at"],accept_token=None))
    return items


def accept_invitation(token: str, user_id: str, user_email: str) -> TeamResponse:
    digest=hash_token(token); now=utc_now()
    with connect() as connection:
        row=connection.execute("SELECT * FROM team_invitations WHERE token_hash=?", (digest,)).fetchone()
        if row is None or row["status"]!="pending":
            raise LookupError("邀请不存在或已经失效。")
        if datetime.fromisoformat(row["expires_at"])<=now:
            connection.execute("UPDATE team_invitations SET status='expired' WHERE id=?", (row["id"],))
            raise LookupError("邀请已过期。")
        if row["email"].lower()!=user_email.lower():
            raise PermissionError("当前登录邮箱与邀请邮箱不一致。")
        entitlement_service.assert_feature(user_id, row["team_id"], "team.collaboration")
        entitlement_service.assert_quota(user_id, row["team_id"], "team_members.total")
        existing=connection.execute("SELECT 1 FROM team_members WHERE team_id=? AND user_id=?", (row["team_id"],user_id)).fetchone()
        if existing:
            connection.execute("UPDATE team_members SET role=?,status='active' WHERE team_id=? AND user_id=?", (row["role"],row["team_id"],user_id))
        else:
            connection.execute("INSERT INTO team_members(team_id,user_id,role,status,joined_at,invited_by) VALUES(?,?,?,?,?,?)",
                               (row["team_id"],user_id,row["role"],"active",utc_text(now),row["created_by"]))
        connection.execute("UPDATE team_invitations SET status='accepted',accepted_at=?,accepted_by=? WHERE id=?",
                           (utc_text(now),user_id,row["id"]))
    write_audit(actor_user_id=user_id,team_id=row["team_id"],action="team.invitation.accept",resource_type="invitation",resource_id=row["id"])
    return next(team for team in auth_service.list_user_teams(user_id) if team.id==row["team_id"])
