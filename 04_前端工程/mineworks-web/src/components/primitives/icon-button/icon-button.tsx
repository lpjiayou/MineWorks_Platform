import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./icon-button.module.css";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: ReactNode;
  label: string;
  isSelected?: boolean;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, isSelected = false, className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(styles.button, isSelected && styles.selected, className)} aria-label={label} aria-pressed={isSelected || undefined} {...props}>{icon}</button>;
});
