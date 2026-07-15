from __future__ import annotations

import hmac
from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.contracts.auth import IdentityResponse, TeamResponse, UserResponse
from app.security.tokens import hash_token
from app.security.origin import validate_browser_origin
from app.services import auth_service, entitlement_service
from app.services.authorization_service import has_team_permission
from app.settings import get_settings

_bearer = HTTPBearer(auto_error=False)
_PLAN_RANK = {"free": 10, "professional": 20, "team": 30, "enterprise": 40}
_SAFE_METHODS = {"GET", "HEAD", "OPTIONS", "TRACE"}


@dataclass(frozen=True)
class AuthContext:
    session_id: str
    identity: IdentityResponse
    auth_method: str

    @property
    def user(self) -> UserResponse:
        return self.identity.user

    @property
    def active_team(self) -> TeamResponse | None:
        if self.identity.active_team_id is None:
            return None
        return next((item for item in self.identity.teams if item.id == self.identity.active_team_id), None)


def _extract_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> tuple[str | None, str]:
    settings = get_settings()
    if credentials and credentials.scheme.lower() == "bearer":
        if not settings.allow_bearer_tokens:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail={"code":"BEARER_DISABLED","message":"当前环境不接受Bearer会话。"})
        return credentials.credentials, "bearer"
    cookie_token = request.cookies.get(settings.session_cookie_name)
    if cookie_token:
        return cookie_token, "cookie"
    return None, "none"


def _validate_csrf(request: Request, resolved: auth_service.ResolvedSession) -> None:
    settings = get_settings()
    if request.method.upper() in _SAFE_METHODS or resolved.auth_method != "cookie":
        return
    validate_browser_origin(request, settings)
    if not settings.csrf_enabled:
        return
    csrf_cookie = request.cookies.get(settings.csrf_cookie_name)
    csrf_header = request.headers.get("x-csrf-token")
    if not csrf_cookie or not csrf_header or not hmac.compare_digest(csrf_cookie, csrf_header):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail={"code":"CSRF_FAILED","message":"安全校验失败，请刷新页面后重试。"})
    if not resolved.csrf_token_hash or not hmac.compare_digest(hash_token(csrf_header), resolved.csrf_token_hash):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail={"code":"CSRF_SESSION_MISMATCH","message":"安全令牌与当前会话不匹配。"})


def _resolve_context(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
    x_team_id: str | None,
    *,
    required: bool,
) -> AuthContext | None:
    token, auth_method = _extract_token(request, credentials)
    if not token:
        if required:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail={"code":"AUTH_REQUIRED","message":"请先登录。"})
        return None
    resolved = auth_service.resolve_session(token, x_team_id, auth_method=auth_method)
    if resolved is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail={"code":"SESSION_INVALID","message":"登录状态已失效，请重新登录。"})
    _validate_csrf(request, resolved)
    return AuthContext(session_id=resolved.session_id, identity=resolved.identity, auth_method=resolved.auth_method)


def get_optional_auth_context(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    x_team_id: str | None = Header(default=None, alias="X-Team-Id"),
) -> AuthContext | None:
    return _resolve_context(request, credentials, x_team_id, required=False)


def get_auth_context(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    x_team_id: str | None = Header(default=None, alias="X-Team-Id"),
) -> AuthContext:
    context = _resolve_context(request, credentials, x_team_id, required=True)
    assert context is not None
    return context


def require_active_team(context: AuthContext = Depends(get_auth_context)) -> AuthContext:
    if context.active_team is None:
        raise HTTPException(status_code=409, detail={"code":"TEAM_CONTEXT_REQUIRED","message":"当前账户没有可用团队。"})
    return context


def require_team_permission(permission: str):
    def dependency(context: AuthContext = Depends(require_active_team)) -> AuthContext:
        team = context.active_team
        if team is None or not has_team_permission(team.role, permission):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail={"code":"PERMISSION_DENIED","message":f"当前角色无权执行：{permission}"})
        return context
    return dependency


def require_plan(required_plan: str):
    def dependency(context: AuthContext = Depends(get_auth_context)) -> AuthContext:
        plan = entitlement_service.resolve_plan_context(context.user.id, context.identity.active_team_id)
        if _PLAN_RANK.get(plan.effective_plan, 0) < _PLAN_RANK.get(required_plan, 999):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail={"code":"FEATURE_NOT_ENTITLED","message":f"该功能需要 {required_plan} 或更高套餐。"})
        return context
    return dependency


def require_feature(feature_code: str):
    def dependency(context: AuthContext = Depends(get_auth_context)) -> AuthContext:
        try:
            entitlement_service.assert_feature(context.user.id, context.identity.active_team_id, feature_code)
        except PermissionError as error:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail={"code":"FEATURE_NOT_ENTITLED","message":str(error),"feature":feature_code}) from error
        return context
    return dependency
