export function formatPrice(amountFen: number | null, cycle: "monthly" | "annual"): string {
  if (amountFen === null) return "联系企业服务";
  if (amountFen === 0) return "免费";
  const amount = amountFen / 100;
  return `¥${amount.toLocaleString("zh-CN")}/${cycle === "monthly" ? "月" : "年"}`;
}

export function quotaText(used: number, limit: number | null): string {
  return limit === null ? `${used} / 不限` : `${used} / ${limit}`;
}
