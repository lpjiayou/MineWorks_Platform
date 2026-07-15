from uuid import uuid4
from fastapi import APIRouter, Depends, Header, HTTPException

from app.contracts.dry_solids import DrySolidsCalculateRequest, DrySolidsCalculateResponse
from app.security.dependencies import AuthContext, get_optional_auth_context
from app.services import entitlement_service
from app.services.dry_solids_service import calculate

router = APIRouter(prefix="/tools/dry-solids-rate", tags=["dry-solids-rate"])


@router.post("/calculate", response_model=DrySolidsCalculateResponse)
def calculate_endpoint(
    payload: DrySolidsCalculateRequest,
    x_request_id: str | None = Header(default=None),
    context: AuthContext | None = Depends(get_optional_auth_context),
) -> DrySolidsCalculateResponse:
    request_id = x_request_id or f"req_{uuid4().hex[:16]}"
    if context is not None:
        try:
            entitlement_service.assert_feature(context.user.id, context.identity.active_team_id, "tool.basic.calculate")
            entitlement_service.assert_quota(context.user.id, context.identity.active_team_id, "calculations.monthly")
        except PermissionError as exc:
            raise HTTPException(status_code=403, detail={"code": "FEATURE_NOT_ENTITLED", "message": str(exc)}) from exc
        except OverflowError as exc:
            raise HTTPException(status_code=429, detail={"code": "QUOTA_EXCEEDED", "message": str(exc), "metric": "calculations.monthly"}) from exc
    try:
        result = calculate(payload, request_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail={"code": "VALIDATION_ERROR", "message": str(exc), "request_id": request_id},
        ) from exc
    if context is not None:
        entitlement_service.consume_usage(
            context.user.id,
            context.identity.active_team_id,
            "calculations.monthly",
            resource_type="tool",
            resource_id="dry-solids-rate",
            request_id=request_id,
        )
    return result
