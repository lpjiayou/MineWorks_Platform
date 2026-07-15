from __future__ import annotations

from dataclasses import dataclass
from typing import Literal
import sqlite3

from app.database import connect

TeamRole = Literal["owner", "admin", "engineer", "viewer"]
ProjectRole = Literal["owner", "manager", "editor", "viewer"]

TEAM_ROLE_RANK: dict[str, int] = {"viewer": 10, "engineer": 20, "admin": 30, "owner": 40}
PROJECT_ROLE_RANK: dict[str, int] = {"viewer": 10, "editor": 20, "manager": 30, "owner": 40}

PERMISSIONS_BY_TEAM_ROLE: dict[str, set[str]] = {
    "viewer": {"team.read", "team.members.read", "project.read", "record.read", "record.reuse"},
    "engineer": {
        "team.read", "team.members.read", "project.read", "project.create", "record.read", "record.create",
        "record.update", "record.delete", "record.reuse"
    },
    "admin": {
        "team.read", "team.update", "team.members.read", "team.members.manage", "team.audit.read",
        "project.read", "project.create", "project.update", "project.archive", "project.members.manage",
        "record.read", "record.create", "record.update", "record.delete", "record.reuse"
    },
    "owner": {
        "team.read", "team.update", "team.delete", "team.members.read", "team.members.manage", "team.audit.read",
        "project.read", "project.create", "project.update", "project.archive", "project.members.manage",
        "record.read", "record.create", "record.update", "record.delete", "record.reuse"
    },
}


@dataclass(frozen=True)
class TeamMembership:
    team_id: str
    user_id: str
    role: TeamRole
    status: str


def permissions_for_role(role: str | None) -> list[str]:
    return sorted(PERMISSIONS_BY_TEAM_ROLE.get(role or "", set()))


def has_team_permission(role: str | None, permission: str) -> bool:
    return permission in PERMISSIONS_BY_TEAM_ROLE.get(role or "", set())


def get_team_membership(user_id: str, team_id: str) -> TeamMembership | None:
    with connect() as connection:
        row = connection.execute(
            "SELECT team_id,user_id,role,status FROM team_members WHERE team_id=? AND user_id=? AND status='active'",
            (team_id, user_id),
        ).fetchone()
    if row is None:
        return None
    return TeamMembership(team_id=row["team_id"], user_id=row["user_id"], role=row["role"], status=row["status"])


def project_role(user_id: str, project_id: str) -> ProjectRole | None:
    with connect() as connection:
        row = connection.execute(
            """
            SELECT p.owner_user_id,p.visibility,p.team_id,tm.role AS team_role,pm.role AS project_role
            FROM projects p
            LEFT JOIN team_members tm ON tm.team_id=p.team_id AND tm.user_id=? AND tm.status='active'
            LEFT JOIN project_members pm ON pm.project_id=p.id AND pm.user_id=? AND pm.status='active'
            WHERE p.id=?
            """,
            (user_id, user_id, project_id),
        ).fetchone()
    if row is None:
        return None
    if row["owner_user_id"] == user_id:
        return "owner"
    if row["team_role"] in {"owner", "admin"}:
        return "manager"
    if row["project_role"]:
        return row["project_role"]
    if row["visibility"] == "team" and row["team_role"] == "engineer":
        return "editor"
    if row["visibility"] == "team" and row["team_role"] == "viewer":
        return "viewer"
    return None


def has_project_role(user_id: str, project_id: str, minimum_role: str) -> bool:
    role = project_role(user_id, project_id)
    return role is not None and PROJECT_ROLE_RANK[role] >= PROJECT_ROLE_RANK[minimum_role]


def count_team_owners(connection: sqlite3.Connection, team_id: str) -> int:
    row = connection.execute(
        "SELECT COUNT(*) AS total FROM team_members WHERE team_id=? AND role='owner' AND status='active'",
        (team_id,),
    ).fetchone()
    return int(row["total"])
