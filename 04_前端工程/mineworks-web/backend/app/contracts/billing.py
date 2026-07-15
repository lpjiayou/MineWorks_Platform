from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field

AccessPlan = Literal["free", "professional", "team", "enterprise"]
BillingCycle = Literal["monthly", "annual"]
BillingSubject = Literal["user", "team"]
OrderStatus = Literal["pending", "paid", "cancelled", "failed"]
SubscriptionStatus = Literal["pending", "active", "cancelled", "expired"]


class PlanQuotaResponse(BaseModel):
    metric: str
    label: str
    limit: int | None
    period: Literal["monthly", "total"]


class PlanResponse(BaseModel):
    id: AccessPlan
    name: str
    tagline: str
    description: str
    monthly_price_fen: int | None
    annual_price_fen: int | None
    currency: Literal["CNY"] = "CNY"
    recommended: bool = False
    price_note: str
    features: list[str]
    quotas: list[PlanQuotaResponse]


class UsageQuotaResponse(BaseModel):
    metric: str
    label: str
    period: Literal["monthly", "total"]
    used: int
    limit: int | None
    remaining: int | None
    percentage: float | None
    period_start: str | None = None
    period_end: str | None = None


class EntitlementResponse(BaseModel):
    user_plan: AccessPlan
    team_plan: AccessPlan | None
    effective_plan: AccessPlan
    plan_source: Literal["user", "team", "free"]
    active_team_id: str | None
    features: list[str]
    quotas: list[UsageQuotaResponse]
    billing_mode: Literal["local-development"] = "local-development"
    commercial_ready: bool = False


class CheckoutIntentCreate(BaseModel):
    subject_type: BillingSubject
    target_plan: AccessPlan
    billing_cycle: BillingCycle = "monthly"


class BillingOrderResponse(BaseModel):
    id: str
    user_id: str
    team_id: str | None
    subject_type: BillingSubject
    subject_id: str
    target_plan: AccessPlan
    billing_cycle: BillingCycle
    amount_fen: int | None
    currency: str
    status: OrderStatus
    provider: str
    provider_reference: str | None
    created_at: str
    updated_at: str
    paid_at: str | None
    payment_action: str | None = None


class SubscriptionResponse(BaseModel):
    id: str
    subject_type: BillingSubject
    subject_id: str
    plan: AccessPlan
    status: SubscriptionStatus
    billing_cycle: BillingCycle
    starts_at: str
    ends_at: str | None
    auto_renew: bool
    provider: str
    external_reference: str | None
    created_at: str
    updated_at: str


class UsageConsumeRequest(BaseModel):
    metric: str = Field(min_length=1, max_length=100)
    quantity: int = Field(default=1, ge=1, le=10000)
    resource_type: str | None = Field(default=None, max_length=100)
    resource_id: str | None = Field(default=None, max_length=200)
    request_id: str | None = Field(default=None, max_length=200)
