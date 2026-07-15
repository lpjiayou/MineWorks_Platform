from __future__ import annotations

import re
from typing import Literal
from pydantic import BaseModel, Field, field_validator

TeamRole = Literal["owner", "admin", "engineer", "viewer"]
ProjectRole = Literal["owner", "manager", "editor", "viewer"]
AccessPlan = Literal["free", "professional", "team", "enterprise"]

_EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=128)
    display_name: str = Field(min_length=1, max_length=80)
    team_name: str | None = Field(default=None, max_length=120)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not _EMAIL_PATTERN.match(normalized):
            raise ValueError("邮箱格式不正确。")
        return normalized


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    status: Literal["active", "disabled"]
    plan: AccessPlan
    created_at: str
    last_login_at: str | None = None


class TeamResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: AccessPlan
    status: Literal["active", "archived"]
    role: TeamRole
    member_count: int = 0
    created_at: str
    updated_at: str


class IdentityResponse(BaseModel):
    user: UserResponse
    teams: list[TeamResponse]
    active_team_id: str | None
    permissions: list[str]


class AuthSessionResponse(IdentityResponse):
    expires_at: str
    access_token: str | None = None
    token_type: Literal["bearer", "cookie"] = "cookie"


class SessionSummary(BaseModel):
    id: str
    created_at: str
    expires_at: str
    idle_expires_at: str | None = None
    last_seen_at: str
    current: bool = False
    user_agent: str = ""
    ip_address: str = ""


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class TeamMemberResponse(BaseModel):
    user_id: str
    email: str
    display_name: str
    role: TeamRole
    status: Literal["active", "suspended"]
    joined_at: str


class TeamMemberAdd(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    role: TeamRole = "engineer"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class TeamMemberRoleUpdate(BaseModel):
    role: TeamRole


class TeamInvitationCreate(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    role: TeamRole = "engineer"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class TeamInvitationResponse(BaseModel):
    id: str
    team_id: str
    email: str
    role: TeamRole
    status: Literal["pending", "accepted", "revoked", "expired"]
    expires_at: str
    created_at: str
    accept_token: str | None = None


class InvitationAcceptRequest(BaseModel):
    token: str = Field(min_length=20, max_length=300)


class AuditLogResponse(BaseModel):
    id: str
    actor_user_id: str | None
    actor_display_name: str | None = None
    team_id: str | None
    project_id: str | None
    action: str
    resource_type: str
    resource_id: str | None
    metadata: dict[str, object]
    created_at: str
