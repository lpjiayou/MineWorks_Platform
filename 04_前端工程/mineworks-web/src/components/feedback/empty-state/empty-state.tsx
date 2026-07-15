import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./empty-state.module.css";

export type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  tone?: "neutral" | "brand" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  primaryAction,
  secondaryAction,
  tone = "brand",
  size = "md",
  className,
}: EmptyStateProps) {
  const titleId = useId();
  const descriptionId = useId();
  const resolvedPrimaryAction = primaryAction ?? action;
  return (
    <section
      className={cn(styles.state, styles[tone], styles[size], className)}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className={styles.icon} aria-hidden="true">{icon}</div>
      <h3 id={titleId}>{title}</h3>
      <p id={descriptionId}>{description}</p>
      {resolvedPrimaryAction || secondaryAction ? (
        <div className={styles.actions}>
          {resolvedPrimaryAction}
          {secondaryAction}
        </div>
      ) : null}
    </section>
  );
}
