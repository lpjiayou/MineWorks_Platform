export type AccessPlan = "guest" | "free" | "professional" | "team" | "enterprise";

const planRank: Record<AccessPlan, number> = {
  guest: 0,
  free: 1,
  professional: 2,
  team: 3,
  enterprise: 4,
};

export const planLabels: Record<AccessPlan, string> = {
  guest: "游客",
  free: "免费",
  professional: "专业会员",
  team: "团队",
  enterprise: "企业",
};

export function hasPlanAccess(currentPlan: AccessPlan, requiredPlan: AccessPlan): boolean {
  return planRank[currentPlan] >= planRank[requiredPlan];
}

export function maxPlan(...plans: AccessPlan[]): AccessPlan {
  return plans.reduce((best, plan) => planRank[plan] > planRank[best] ? plan : best, "guest");
}
