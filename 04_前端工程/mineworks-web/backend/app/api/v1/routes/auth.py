from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.contracts.auth import (
    AuditLogResponse, AuthSessionResponse, IdentityResponse, InvitationAcceptRequest, LoginRequest, RegisterRequest,
    TeamCreate, TeamInvitationCreate, TeamInvitationResponse, TeamMemberAdd, TeamMemberResponse,
    TeamMemberRoleUpdate, TeamResponse, SessionSummary,
)
from app.security.dependencies import AuthContext, get_auth_context, require_active_team, require_team_permission
from app.security.cookies import clear_auth_cookies, set_auth_cookies
from app.security.origin import validate_browser_origin
from app.settings import get_settings
from app.services import auth_service, entitlement_service, team_service
from app.services.audit_service import list_audit_logs

router = APIRouter(tags=["identity-and-authorization"])


def _request_context(request: Request) -> tuple[str, str]:
    return request.headers.get("user-agent", ""), request.client.host if request.client else ""


@router.post("/auth/register", response_model=AuthSessionResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, request: Request, response: Response) -> AuthSessionResponse:
    settings = get_settings()
    validate_browser_origin(request, settings)
    user_agent, ip_address = _request_context(request)
    try:
        grant = auth_service.register(payload, user_agent=user_agent, ip_address=ip_address)
    except ValueError as error:
        raise HTTPException(status_code=422, detail={"code":"PASSWORD_POLICY_FAILED","message":str(error)}) from error
    except PermissionError as error:
        raise HTTPException(status_code=403, detail={"code":"REGISTRATION_DISABLED","message":str(error)}) from error
    except Exception as error:
        if "EMAIL_EXISTS" in str(error):
            raise HTTPException(status_code=409, detail={"code":"EMAIL_EXISTS","message":"该邮箱已注册。"}) from error
        raise
    set_auth_cookies(response, settings, session_token=grant.session_token, csrf_token=grant.csrf_token, max_age=grant.max_age_seconds)
    return grant.response


@router.post("/auth/login", response_model=AuthSessionResponse)
def login(payload: LoginRequest, request: Request, response: Response) -> AuthSessionResponse:
    settings = get_settings()
    validate_browser_origin(request, settings)
    user_agent, ip_address = _request_context(request)
    try:
        grant = auth_service.authenticate(payload.email, payload.password, user_agent=user_agent, ip_address=ip_address)
    except OverflowError as error:
        raise HTTPException(status_code=429, detail={"code":"LOGIN_RATE_LIMITED","message":str(error)}) from error
    except LookupError as error:
        raise HTTPException(status_code=401, detail={"code":"INVALID_CREDENTIALS","message":str(error)}) from error
    set_auth_cookies(response, settings, session_token=grant.session_token, csrf_token=grant.csrf_token, max_age=grant.max_age_seconds)
    return grant.response


@router.get("/auth/me", response_model=IdentityResponse)
def me(context: AuthContext = Depends(get_auth_context)) -> IdentityResponse:
    return context.identity


@router.get("/auth/sessions", response_model=list[SessionSummary])
def sessions(context: AuthContext = Depends(get_auth_context)) -> list[SessionSummary]:
    return auth_service.list_sessions(context.user.id, context.session_id)


@router.post("/auth/sessions/revoke-others")
def revoke_other_sessions(context: AuthContext = Depends(get_auth_context)) -> dict[str, int]:
    return {"revoked": auth_service.revoke_other_sessions(context.session_id, context.user.id)}


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response, context: AuthContext = Depends(get_auth_context)) -> None:
    auth_service.revoke_session(context.session_id, context.user.id)
    clear_auth_cookies(response, get_settings())


@router.post("/teams", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(payload: TeamCreate, context: AuthContext = Depends(get_auth_context)) -> TeamResponse:
    try:
        entitlement_service.assert_quota(context.user.id, context.identity.active_team_id, "teams.total")
    except OverflowError as error:
        raise HTTPException(status_code=429, detail={"code":"QUOTA_EXCEEDED","message":str(error),"metric":"teams.total"}) from error
    return team_service.create_team(context.user.id, payload.name)


@router.get("/teams", response_model=list[TeamResponse])
def list_teams(context: AuthContext = Depends(get_auth_context)) -> list[TeamResponse]:
    return context.identity.teams


@router.get("/teams/{team_id}/members", response_model=list[TeamMemberResponse])
def list_members(team_id: str, context: AuthContext = Depends(require_active_team)) -> list[TeamMemberResponse]:
    if context.active_team is None or context.active_team.id != team_id:
        raise HTTPException(status_code=403, detail={"code":"TEAM_CONTEXT_MISMATCH","message":"请先切换到目标团队。"})
    return team_service.list_members(team_id)


@router.post("/teams/{team_id}/members", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(team_id: str, payload: TeamMemberAdd,
               context: AuthContext = Depends(require_team_permission("team.members.manage"))) -> TeamMemberResponse:
    if context.active_team is None or context.active_team.id != team_id:
        raise HTTPException(status_code=403, detail={"code":"TEAM_CONTEXT_MISMATCH","message":"请先切换到目标团队。"})
    if payload.role == "owner" and context.active_team.role != "owner":
        raise HTTPException(status_code=403, detail={"code":"OWNER_ROLE_REQUIRED","message":"只有团队所有者可以授予所有者角色。"})
    try:
        entitlement_service.assert_feature(context.user.id, team_id, "team.collaboration")
        entitlement_service.assert_quota(context.user.id, team_id, "team_members.total")
        return team_service.add_existing_member(team_id,payload.email,payload.role,context.user.id)
    except PermissionError as error:
        raise HTTPException(status_code=403, detail={"code":"FEATURE_NOT_ENTITLED","message":str(error)}) from error
    except OverflowError as error:
        raise HTTPException(status_code=429, detail={"code":"QUOTA_EXCEEDED","message":str(error),"metric":"team_members.total"}) from error
    except LookupError as error:
        raise HTTPException(status_code=404, detail={"code":"USER_NOT_FOUND","message":str(error)}) from error


@router.patch("/teams/{team_id}/members/{user_id}", response_model=TeamMemberResponse)
def update_member(team_id: str, user_id: str, payload: TeamMemberRoleUpdate,
                  context: AuthContext = Depends(require_team_permission("team.members.manage"))) -> TeamMemberResponse:
    if context.active_team is None or context.active_team.id != team_id:
        raise HTTPException(status_code=403, detail={"code":"TEAM_CONTEXT_MISMATCH","message":"请先切换到目标团队。"})
    if payload.role == "owner" and context.active_team.role != "owner":
        raise HTTPException(status_code=403, detail={"code":"OWNER_ROLE_REQUIRED","message":"只有团队所有者可以授予所有者角色。"})
    try:
        return team_service.update_member_role(team_id,user_id,payload.role,context.user.id)
    except LookupError as error:
        raise HTTPException(status_code=404, detail={"code":"MEMBER_NOT_FOUND","message":str(error)}) from error
    except ValueError as error:
        raise HTTPException(status_code=409, detail={"code":"LAST_OWNER_REQUIRED","message":str(error)}) from error


@router.delete("/teams/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(team_id: str, user_id: str,
                  context: AuthContext = Depends(require_team_permission("team.members.manage"))) -> None:
    if context.active_team is None or context.active_team.id != team_id:
        raise HTTPException(status_code=403, detail={"code":"TEAM_CONTEXT_MISMATCH","message":"请先切换到目标团队。"})
    try:
        team_service.remove_member(team_id,user_id,context.user.id)
    except LookupError as error:
        raise HTTPException(status_code=404, detail={"code":"MEMBER_NOT_FOUND","message":str(error)}) from error
    except ValueError as error:
        raise HTTPException(status_code=409, detail={"code":"LAST_OWNER_REQUIRED","message":str(error)}) from error


@router.post("/teams/{team_id}/invitations", response_model=TeamInvitationResponse, status_code=status.HTTP_201_CREATED)
def create_invitation(team_id: str, payload: TeamInvitationCreate,
                      context: AuthContext = Depends(require_team_permission("team.members.manage"))) -> TeamInvitationResponse:
    if context.active_team is None or context.active_team.id != team_id:
        raise HTTPException(status_code=403, detail={"code":"TEAM_CONTEXT_MISMATCH","message":"请先切换到目标团队。"})
    if payload.role == "owner" and context.active_team.role != "owner":
        raise HTTPException(status_code=403, detail={"code":"OWNER_ROLE_REQUIRED","message":"只有团队所有者可以邀请新的所有者。"})
    try:
        entitlement_service.assert_feature(context.user.id, team_id, "team.collaboration")
    except PermissionError as error:
        raise HTTPException(status_code=403, detail={"code":"FEATURE_NOT_ENTITLED","message":str(error)}) from error
    return team_service.create_invitation(team_id,payload.email,payload.role,context.user.id)


@router.get("/teams/{team_id}/invitations", response_model=list[TeamInvitationResponse])
def list_invitations(team_id: str,
                     context: AuthContext = Depends(require_team_permission("team.members.manage"))) -> list[TeamInvitationResponse]:
    if context.active_team is None or context.active_team.id != team_id:
        raise HTTPException(status_code=403, detail={"code":"TEAM_CONTEXT_MISMATCH","message":"请先切换到目标团队。"})
    return team_service.list_invitations(team_id)


@router.post("/team-invitations/accept", response_model=TeamResponse)
def accept_invitation(payload: InvitationAcceptRequest, context: AuthContext = Depends(get_auth_context)) -> TeamResponse:
    try:
        return team_service.accept_invitation(payload.token,context.user.id,context.user.email)
    except LookupError as error:
        raise HTTPException(status_code=404, detail={"code":"INVITATION_INVALID","message":str(error)}) from error
    except PermissionError as error:
        raise HTTPException(status_code=403, detail={"code":"INVITATION_NOT_ALLOWED","message":str(error)}) from error
    except OverflowError as error:
        raise HTTPException(status_code=429, detail={"code":"QUOTA_EXCEEDED","message":str(error),"metric":"team_members.total"}) from error


@router.get("/teams/{team_id}/audit-logs", response_model=list[AuditLogResponse])
def audit_logs(team_id: str, context: AuthContext = Depends(require_team_permission("team.audit.read"))) -> list[AuditLogResponse]:
    if context.active_team is None or context.active_team.id != team_id:
        raise HTTPException(status_code=403, detail={"code":"TEAM_CONTEXT_MISMATCH","message":"请先切换到目标团队。"})
    return [AuditLogResponse(**item) for item in list_audit_logs(team_id)]
