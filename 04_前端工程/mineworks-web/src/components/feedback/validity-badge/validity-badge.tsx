import { Badge, type BadgeTone } from "@/components/feedback/badge/badge";
import type { DataValidity } from "@/types/status";

const definitions: Record<DataValidity, { label: string; tone: BadgeTone }> = {
  NOT_CALCULATED: { label: "尚未计算", tone: "neutral" },
  VALID: { label: "数据有效", tone: "success" },
  CAUTION: { label: "结果需复核", tone: "warning" },
  INCONSISTENT: { label: "数据不一致", tone: "danger" },
  INVALID: { label: "数据无效", tone: "danger" },
  STALE: { label: "数据已过期", tone: "warning" },
  MISSING: { label: "数据缺失", tone: "neutral" },
};

export function ValidityBadge({ validity, showCode = true }: { validity: DataValidity; showCode?: boolean }) {
  const definition = definitions[validity];
  return <Badge tone={definition.tone}>{showCode ? `${validity} · ${definition.label}` : definition.label}</Badge>;
}
