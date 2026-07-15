import { authorizedFetch, expectApiJson } from "@/features/auth/api";
import type { BillingCycle, BillingOrder, BillingSubject, EntitlementSnapshot, PlanDefinition, Subscription } from "./types";
import type { AccessPlan } from "@/features/auth/types";

const DEFAULT_API_BASE = "/api/v1";

export function createBillingApi(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE) {
  return {
    async plans(): Promise<PlanDefinition[]> {
      return await expectApiJson<PlanDefinition[]>(await fetch(`${baseUrl}/plans`, { cache: "no-store" }));
    },
    async entitlements(): Promise<EntitlementSnapshot> {
      return await expectApiJson<EntitlementSnapshot>(await authorizedFetch(`${baseUrl}/billing/entitlements`, { cache: "no-store" }));
    },
    async orders(): Promise<BillingOrder[]> {
      return await expectApiJson<BillingOrder[]>(await authorizedFetch(`${baseUrl}/billing/orders`, { cache: "no-store" }));
    },
    async subscriptions(): Promise<Subscription[]> {
      return await expectApiJson<Subscription[]>(await authorizedFetch(`${baseUrl}/billing/subscriptions`, { cache: "no-store" }));
    },
    async createCheckoutIntent(input: { subject_type: BillingSubject; target_plan: AccessPlan; billing_cycle: BillingCycle }): Promise<BillingOrder> {
      return await expectApiJson<BillingOrder>(await authorizedFetch(`${baseUrl}/billing/checkout-intents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }));
    },
    async simulatePaid(orderId: string): Promise<BillingOrder> {
      return await expectApiJson<BillingOrder>(await authorizedFetch(`${baseUrl}/billing/orders/${orderId}/simulate-paid`, { method: "POST" }));
    },
  };
}
