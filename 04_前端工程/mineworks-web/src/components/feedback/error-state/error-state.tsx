import type { ReactNode } from "react";
import { Ban, Calculator, CloudOff, FileQuestion, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./error-state.module.css";

export type ErrorStateKind = "calculation" | "network" | "permission" | "notFound" | "disabled";

const icons = {
  calculation: Calculator,
  network: CloudOff,
  permission: ShieldAlert,
  notFound: FileQuestion,
  disabled: Ban,
};

export type ErrorStateProps = {
  kind?: ErrorStateKind;
  title: string;
  description: string;
  requestId?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function ErrorState({
  kind = "calculation",
  title,
  description,
  requestId,
  primaryAction,
  secondaryAction,
  compact = false,
  className,
}: ErrorStateProps) {
  const Icon = icons[kind];
  return (
    <section className={cn(styles.state, styles[kind], compact && styles.compact, className)} role="alert">
      <div className={styles.icon}><Icon size={26} aria-hidden="true" /></div>
      <div className={styles.content}>
        <h3>{title}</h3>
        <p>{description}</p>
        {requestId ? (
          <div className={styles.request}>
            <span>request_id</span>
            <code>{requestId}</code>
          </div>
        ) : null}
        {primaryAction || secondaryAction ? (
          <div className={styles.actions}>
            {primaryAction}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </section>
  );
}
