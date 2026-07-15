import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./badge.module.css";

export type BadgeTone = "brand" | "success" | "info" | "warning" | "danger" | "professional" | "team" | "neutral";
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cn(styles.badge, styles[tone], className)} {...props} />;
}
