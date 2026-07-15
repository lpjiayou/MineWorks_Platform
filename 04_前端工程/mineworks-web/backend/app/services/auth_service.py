from __future__ import annotations

import re
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Mapping
from uuid import uuid4

from app.contracts.auth import AuthSessionResponse, IdentityResponse, RegisterRequest, SessionSummary, TeamResponse, UserResponse
from app.database import CompatConnection, connect
from app.security.passwords import hash_password, password_needs_rehash, validate_password_strength, verify_password
from app.security.tokens import create_token, hash_token
from app.services.authorization_service import permissions_for_role
from app.services.audit_service import write_audit
from app.settings import get_settings


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_text(value: datetime | None = None) -> str:
    return (value or utc_now()).isoformat()


@dataclass(frozen=True)
class SessionGrant:
    response: AuthSessionResponse
    session_token: str
    csrf_token: str
    max_age_seconds: int


@dataclass(frozen=True)
class ResolvedSession:
    session_id: str
    identity: IdentityResponse
    csrf_token_hash: str | None
    auth_method: str


def _slugify(value: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return text or f"team-{uuid4().hex[:8]}"


def _user_from_row(row: Mapping[str, Any]) -> UserResponse:
    return UserResponse(
        id=row["id"], email=row["email"], display_name=row["display_name"], status=row["status"],
        plan=row["plan"], created_at=row["created_at"], last_login_at=row["last_login_at"],
    )


def get_user(user_id: str) -> UserResponse | None:
    with connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    return _user_from_row(row) if row else None


def get_user_by_email(email: str) -> UserResponse | None:
    with connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE email=?", (email.strip().lower(),)).fetchone()
    return _user_from_row(row) if row else None


def list_user_teams(user_id: str) -> list[TeamResponse]:
    with connect() as connection:
        rows = connection.execute(
            """
            SELECT t.*,tm.role,COUNT(all_members.user_id) AS member_count
            FROM teams t
            JOIN team_members tm ON tm.team_id=t.id AND tm.user_id=? AND tm.status='active'
            LEFT JOIN team_members all_members ON all_members.team_id=t.id AND all_members.status='active'
            WHERE t.status='active'
            GROUP BY t.id,tm.role
            ORDER BY t.updated_at DESC
            """, (user_id,)
        ).fetchall()
    return [TeamResponse(id=row["id"],name=row["name"],slug=row["slug"],plan=row["plan"],status=row["status"],
                         role=row["role"],member_count=int(row["member_count"]),created_at=row["created_at"],updated_at=row["updated_at"])
            for row in rows]


def _unique_slug(connection: CompatConnection, name: str) -> str:
    base = _slugify(name)
    slug = base
    index = 2
    while connection.execute("SELECT 1 FROM teams WHERE slug=?", (slug,)).fetchone():
        slug = f"{base}-{index}"
        index += 1
    return slug


def _create_team(connection: CompatConnection, user_id: str, name: str, now: str) -> str:
    team_id = f"team_{uuid4().hex[:16]}"
    connection.execute(
        "INSERT INTO teams(id,name,slug,plan,status,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",
        (team_id, name, _unique_slug(connection, name), "free", "active", user_id, now, now),
    )
    connection.execute(
        "INSERT INTO team_members(team_id,user_id,role,status,joined_at,invited_by) VALUES(?,?,?,?,?,?)",
        (team_id, user_id, "owner", "active", now, user_id),
    )
    return team_id


def _claim_orphaned_data(connection: CompatConnection, user_id: str, team_id: str) -> None:
    connection.execute(
        "UPDATE projects SET team_id=?,owner_user_id=?,created_by=COALESCE(created_by,?) WHERE team_id IS NULL",
        (team_id, user_id, user_id),
    )
    connection.execute(
        "UPDATE calculation_records SET team_id=?,owner_user_id=?,created_by=COALESCE(created_by,?) WHERE owner_user_id IS NULL",
        (team_id, user_id, user_id),
    )


def _purge_old_login_attempts(connection: CompatConnection, cutoff: str) -> None:
    connection.execute("DELETE FROM auth_login_attempts WHERE created_at<?", (cutoff,))


def assert_login_allowed(email: str, ip_address: str) -> None:
    settings = get_settings()
    now = utc_now()
    window_start = utc_text(now - timedelta(minutes=settings.login_rate_limit_window_minutes))
    with connect() as connection:
        _purge_old_login_attempts(connection, utc_text(now - timedelta(days=2)))
        row = connection.execute(
            """SELECT COUNT(*) AS total FROM auth_login_attempts
            WHERE email=? AND ip_address=? AND succeeded=0 AND created_at>=?""",
            (email.strip().lower(), ip_address[:128], window_start),
        ).fetchone()
    if row and int(row["total"]) >= settings.login_rate_limit_attempts:
        raise OverflowError("登录失败次数过多，请稍后再试。")


def record_login_attempt(email: str, ip_address: str, *, succeeded: bool) -> None:
    with connect() as connection:
        connection.execute(
            "INSERT INTO auth_login_attempts(id,email,ip_address,succeeded,created_at) VALUES(?,?,?,?,?)",
            (f"lat_{uuid4().hex[:18]}", email.strip().lower(), ip_address[:128], 1 if succeeded else 0, utc_text()),
        )


def register(payload: RegisterRequest, *, user_agent: str = "", ip_address: str = "") -> SessionGrant:
    settings = get_settings()
    if not settings.allow_self_registration:
        raise PermissionError("当前环境未开放自主注册。")
    errors = validate_password_strength(payload.password)
    if errors:
        raise ValueError(" ".join(errors))
    now = utc_text()
    user_id = f"usr_{uuid4().hex[:16]}"
    with connect() as connection:
        if connection.execute("SELECT 1 FROM users WHERE email=?", (payload.email,)).fetchone():
            raise sqlite3.IntegrityError("EMAIL_EXISTS")
        first_user = int(connection.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]) == 0
        connection.execute(
            "INSERT INTO users(id,email,display_name,password_hash,status,plan,created_at,updated_at,last_login_at) VALUES(?,?,?,?,?,?,?,?,?)",
            (user_id, payload.email, payload.display_name.strip(), hash_password(payload.password), "active", "free", now, now, now),
        )
        team_name = payload.team_name.strip() if payload.team_name else ("矿业智工平台初始团队" if first_user else f"{payload.display_name.strip()}的工作区")
        team_id = _create_team(connection, user_id, team_name, now)
        if first_user:
            _claim_orphaned_data(connection, user_id, team_id)
    write_audit(actor_user_id=user_id, team_id=team_id, action="auth.register", resource_type="user", resource_id=user_id,
                metadata={"first_user": first_user})
    return create_session(user_id, active_team_id=team_id, user_agent=user_agent, ip_address=ip_address)


def authenticate(email: str, password: str, *, user_agent: str = "", ip_address: str = "") -> SessionGrant:
    normalized_email = email.strip().lower()
    assert_login_allowed(normalized_email, ip_address)
    with connect() as connection:
        row = connection.execute("SELECT * FROM users WHERE email=?", (normalized_email,)).fetchone()
    if row is None or row["status"] != "active" or not verify_password(password, row["password_hash"]):
        record_login_attempt(normalized_email, ip_address, succeeded=False)
        raise LookupError("邮箱或密码不正确。")
    now = utc_text()
    replacement_hash = hash_password(password) if password_needs_rehash(row["password_hash"]) else row["password_hash"]
    with connect() as connection:
        connection.execute("UPDATE users SET last_login_at=?,updated_at=?,password_hash=? WHERE id=?", (now, now, replacement_hash, row["id"]))
    record_login_attempt(normalized_email, ip_address, succeeded=True)
    teams = list_user_teams(row["id"])
    active_team_id = teams[0].id if teams else None
    write_audit(actor_user_id=row["id"], team_id=active_team_id, action="auth.login", resource_type="session")
    return create_session(row["id"], active_team_id=active_team_id, user_agent=user_agent, ip_address=ip_address)


def create_session(user_id: str, *, active_team_id: str | None, user_agent: str = "", ip_address: str = "", rotated_from: str | None = None) -> SessionGrant:
    settings = get_settings()
    token = create_token()
    csrf_token = create_token()
    now = utc_now()
    expires = now + timedelta(hours=settings.session_ttl_hours)
    idle_expires = min(expires, now + timedelta(minutes=settings.session_idle_minutes))
    session_id = f"ses_{uuid4().hex[:18]}"
    with connect() as connection:
        connection.execute(
            """INSERT INTO auth_sessions(
            id,user_id,token_hash,csrf_token_hash,created_at,expires_at,idle_expires_at,last_seen_at,rotated_from,user_agent,ip_address
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
            (session_id, user_id, hash_token(token), hash_token(csrf_token), utc_text(now), utc_text(expires),
             utc_text(idle_expires), utc_text(now), rotated_from, user_agent[:500], ip_address[:128]),
        )
    identity = get_identity(user_id, active_team_id)
    response = AuthSessionResponse(**identity.model_dump(), expires_at=utc_text(expires), token_type="cookie")
    if settings.allow_bearer_tokens:
        response.access_token = token
        response.token_type = "bearer"
    return SessionGrant(response=response, session_token=token, csrf_token=csrf_token, max_age_seconds=max(1, int((expires-now).total_seconds())))


def resolve_session(token: str, requested_team_id: str | None = None, *, auth_method: str = "cookie") -> ResolvedSession | None:
    token_digest = hash_token(token)
    now = utc_now()
    with connect() as connection:
        row = connection.execute(
            """SELECT s.id AS session_id,s.user_id,s.expires_at,s.idle_expires_at,s.csrf_token_hash,u.status AS user_status
            FROM auth_sessions s JOIN users u ON u.id=s.user_id
            WHERE s.token_hash=? AND s.revoked_at IS NULL""", (token_digest,)
        ).fetchone()
        if row is None or row["user_status"] != "active":
            return None
        absolute_expiry = datetime.fromisoformat(row["expires_at"])
        idle_expiry = datetime.fromisoformat(row["idle_expires_at"] or row["expires_at"])
        if absolute_expiry <= now or idle_expiry <= now:
            connection.execute("UPDATE auth_sessions SET revoked_at=? WHERE id=?", (utc_text(now), row["session_id"]))
            return None
        next_idle = min(absolute_expiry, now + timedelta(minutes=get_settings().session_idle_minutes))
        connection.execute("UPDATE auth_sessions SET last_seen_at=?,idle_expires_at=? WHERE id=?", (utc_text(now), utc_text(next_idle), row["session_id"]))
    return ResolvedSession(
        session_id=row["session_id"], identity=get_identity(row["user_id"], requested_team_id),
        csrf_token_hash=row["csrf_token_hash"], auth_method=auth_method,
    )


def get_identity(user_id: str, requested_team_id: str | None = None) -> IdentityResponse:
    user = get_user(user_id)
    if user is None:
        raise LookupError("用户不存在。")
    teams = list_user_teams(user_id)
    selected = next((team for team in teams if team.id == requested_team_id), None)
    if selected is None and teams:
        selected = teams[0]
    return IdentityResponse(user=user, teams=teams, active_team_id=selected.id if selected else None,
                            permissions=permissions_for_role(selected.role if selected else None))


def revoke_session(session_id: str, user_id: str) -> None:
    with connect() as connection:
        connection.execute("UPDATE auth_sessions SET revoked_at=? WHERE id=? AND user_id=?", (utc_text(), session_id, user_id))
    write_audit(actor_user_id=user_id, action="auth.logout", resource_type="session", resource_id=session_id)


def revoke_other_sessions(current_session_id: str, user_id: str) -> int:
    with connect() as connection:
        result = connection.execute(
            "UPDATE auth_sessions SET revoked_at=? WHERE user_id=? AND id<>? AND revoked_at IS NULL",
            (utc_text(), user_id, current_session_id),
        )
    write_audit(actor_user_id=user_id, action="auth.sessions.revoke_others", resource_type="session")
    return result.rowcount


def list_sessions(user_id: str, current_session_id: str) -> list[SessionSummary]:
    with connect() as connection:
        rows = connection.execute(
            """SELECT id,created_at,expires_at,idle_expires_at,last_seen_at,user_agent,ip_address
            FROM auth_sessions WHERE user_id=? AND revoked_at IS NULL ORDER BY last_seen_at DESC""", (user_id,)
        ).fetchall()
    return [SessionSummary(
        id=row["id"], created_at=row["created_at"], expires_at=row["expires_at"], idle_expires_at=row["idle_expires_at"],
        last_seen_at=row["last_seen_at"], current=row["id"] == current_session_id,
        user_agent=row["user_agent"], ip_address=row["ip_address"],
    ) for row in rows]
