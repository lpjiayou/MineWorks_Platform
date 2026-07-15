import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./panel.module.css";
export type PanelProps = HTMLAttributes<HTMLElement> & { title?: string; subtitle?: string; action?: ReactNode; as?: "section" | "aside" | "div" };
export function Panel({ title, subtitle, action, as: Tag = "section", className, children, ...props }: PanelProps) {
  return <Tag className={cn(styles.panel, className)} {...props}>{(title || action) && <div className={styles.header}><div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>{action}</div>}<div className={styles.body}>{children}</div></Tag>;
}
