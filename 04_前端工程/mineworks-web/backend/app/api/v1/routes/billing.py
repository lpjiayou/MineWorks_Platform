from fastapi import APIRouter, Depends, HTTPException, status

from app.contracts.billing import (
    BillingOrderResponse,
    CheckoutIntentCreate,
    EntitlementResponse,
    PlanResponse,
    SubscriptionResponse,
)
from app.security.dependencies import AuthContext, get_auth_context, require_active_team
from app.services import entitlement_service

router = APIRouter(tags=["plans-entitlements-and-billing"])


@router.get("/plans", response_model=list[PlanResponse])
def plans() -> list[PlanResponse]:
    return entitlement_service.list_plans()


@router.get("/billing/entitlements", response_model=EntitlementResponse)
def entitlements(context: AuthContext = Depends(get_auth_context)) -> EntitlementResponse:
    return entitlement_service.get_entitlement_snapshot(context.user.id, context.identity.active_team_id)


@router.get("/billing/orders", response_model=list[BillingOrderResponse])
def orders(context: AuthContext = Depends(get_auth_context)) -> list[BillingOrderResponse]:
    return entitlement_service.list_orders(context.user.id, context.identity.active_team_id)


@router.get("/billing/subscriptions", response_model=list[SubscriptionResponse])
def subscriptions(context: AuthContext = Depends(get_auth_context)) -> list[SubscriptionResponse]:
    return entitlement_service.list_subscriptions(context.user.id, context.identity.active_team_id)


@router.post("/billing/checkout-intents", response_model=BillingOrderResponse, status_code=status.HTTP_201_CREATED)
def create_checkout_intent(
    payload: CheckoutIntentCreate,
    context: AuthContext = Depends(get_auth_context),
) -> BillingOrderResponse:
    try:
        return entitlement_service.create_checkout_intent(
            payload,
            user_id=context.user.id,
            team_id=context.identity.active_team_id,
            team_role=context.active_team.role if context.active_team else None,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail={"code": "BILLING_INPUT_INVALID", "message": str(error)}) from error
    except PermissionError as error:
        raise HTTPException(status_code=403, detail={"code": "BILLING_PERMISSION_DENIED", "message": str(error)}) from error


@router.post("/billing/orders/{order_id}/simulate-paid", response_model=BillingOrderResponse)
def simulate_paid(
    order_id: str,
    context: AuthContext = Depends(get_auth_context),
) -> BillingOrderResponse:
    try:
        return entitlement_service.simulate_order_paid(
            order_id,
            user_id=context.user.id,
            team_id=context.identity.active_team_id,
            team_role=context.active_team.role if context.active_team else None,
        )
    except LookupError as error:
        raise HTTPException(status_code=404, detail={"code": "ORDER_NOT_FOUND", "message": str(error)}) from error
    except PermissionError as error:
        raise HTTPException(status_code=403, detail={"code": "BILLING_PERMISSION_DENIED", "message": str(error)}) from error
    except ValueError as error:
        raise HTTPException(status_code=409, detail={"code": "ORDER_STATE_INVALID", "message": str(error)}) from error
