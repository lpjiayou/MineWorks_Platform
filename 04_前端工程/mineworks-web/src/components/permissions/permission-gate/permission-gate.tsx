import type { ReactNode } from "react";
import { LockKeyhole, Sparkles } from "lucide-react";
import { Badge } from "@/components/feedback/badge/badge";
import { cn } from "@/lib/cn";
import { hasPlanAccess, planLabels, type AccessPlan } from "@/lib/permissions/plan";
import styles from "./permission-gate.module.css";

export type PermissionGateMode = "block" | "preview" | "hide";

export type PermissionGateProps = {
  feature: string;
  requiredPlan: AccessPlan;
  currentPlan: AccessPlan;
  mode?: PermissionGateMode;
  description?: string;
  preview?: ReactNode;
  upgradeAction?: ReactNode;
  alternativeAction?: ReactNode;
  fallback?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PermissionGate({
  feature,
  requiredPlan,
  currentPlan,
  mode = "preview",
  description,
  preview,
  upgradeAction,
  alternativeAction,
  fallback,
  children,
  className,
}: PermissionGateProps) {
  if (hasPlanAccess(currentPlan, requiredPlan)) return <>{children}</>;
  if (mode === "hide") return null;
  if (fallback) return <>{fallback}</>;

  return (
    <section className={cn(styles.root, styles[mode], className)} aria-label={`${feature}权限说明`}>
      {mode === "preview" && preview ? <div className={styles.preview}>{preview}</div> : null}
      <div className={styles.message}>
        <div className={styles.icon}><LockKeyhole size={22} aria-hidden="true" /></div>
        <div className={styles.content}>
          <div className={styles.badges}>
            <Badge tone="professional">需要{planLabels[requiredPlan]}</Badge>
            <Badge tone="neutral">当前：{planLabels[currentPlan]}</Badge>
          </div>
          <h3>{feature}</h3>
          <p>{description ?? `升级到${planLabels[requiredPlan]}后可使用此功能。`}</p>
          <div className={styles.note}><Sparkles size={15} aria-hidden="true" />前端仅展示权限状态，正式接口必须由后端再次校验。</div>
          {(upgradeAction || alternativeAction) ? <div className={styles.actions}>{upgradeAction}{alternativeAction}</div> : null}
        </div>
      </div>
    </section>
  );
}
