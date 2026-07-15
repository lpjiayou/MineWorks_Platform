import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./card.module.css";
export type CardProps = HTMLAttributes<HTMLDivElement> & { interactive?: boolean };
export function Card({ interactive = false, className, ...props }: CardProps) { return <div className={cn(styles.card, interactive && styles.interactive, className)} {...props} />; }
