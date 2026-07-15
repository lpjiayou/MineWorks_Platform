import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./alert.module.css";

export type AlertTone = "info" | "success" | "warning" | "error";

const icons = {
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
  error: CircleX,
};

export type AlertProps = {
  tone?: AlertTone;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  compact?: boolean;
  className?: string;
};

export function Alert({
  tone = "info",
  title,
  children,
  action,
  onDismiss,
  dismissLabel = "关闭提示",
  compact = false,
  className,
}: AlertProps) {
  const Icon = icons[tone];
  return (
    <div
      className={cn(styles.alert, styles[tone], compact && styles.compact, className)}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className={styles.icon} size={19} aria-hidden="true" />
      <div className={styles.content}>
        <strong>{title}</strong>
        <div className={styles.description}>{children}</div>
        {action ? <div className={styles.action}>{action}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className={styles.dismiss} aria-label={dismissLabel} onClick={onDismiss}>
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
