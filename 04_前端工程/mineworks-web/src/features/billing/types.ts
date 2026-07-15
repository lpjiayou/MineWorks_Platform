import type { AccessPlan } from "@/features/auth/types";

export type BillingCycle = "monthly" | "annual";
export type BillingSubject = "user" | "team";
export type BillingOrderStatus = "pending" | "paid" | "cancelled" | "failed";

export type PlanQuota = {
  metric: string;
  label: string;
  limit: number | null;
  period: "monthly" | "total";
};

export type PlanDefinition = {
  id: AccessPlan;
  name: string;
  tagline: string;
  description: string;
  monthly_price_fen: number | null;
  annual_price_fen: number | null;
  currency: "CNY";
  recommended: boolean;
  price_note: string;
  features: string[];
  quotas: PlanQuota[];
};

export type UsageQuota = {
  metric: string;
  label: string;
  period: "monthly" | "total";
  used: number;
  limit: number | null;
  remaining: number | null;
  percentage: number | null;
  period_start: string | null;
  period_end: string | null;
};

export type EntitlementSnapshot = {
  user_plan: AccessPlan;
  team_plan: AccessPlan | null;
  effective_plan: AccessPlan;
  plan_source: "user" | "team" | "free";
  active_team_id: string | null;
  features: string[];
  quotas: UsageQuota[];
  billing_mode: "local-development";
  commercial_ready: false;
};

export type BillingOrder = {
  id: string;
  user_id: string;
  team_id: string | null;
  subject_type: BillingSubject;
  subject_id: string;
  target_plan: AccessPlan;
  billing_cycle: BillingCycle;
  amount_fen: number | null;
  currency: string;
  status: BillingOrderStatus;
  provider: string;
  provider_reference: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  payment_action: string | null;
};

export type Subscription = {
  id: string;
  subject_type: BillingSubject;
  subject_id: string;
  plan: AccessPlan;
  status: "pending" | "active" | "cancelled" | "expired";
  billing_cycle: BillingCycle;
  starts_at: string;
  ends_at: string | null;
  auto_renew: boolean;
  provider: string;
  external_reference: string | null;
  created_at: string;
  updated_at: string;
};
