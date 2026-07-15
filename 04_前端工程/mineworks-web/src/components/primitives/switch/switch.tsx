"use client";

import { useState, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./switch.module.css";

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> & {
  checked?: boolean;
  defaultChecked?: boolean;
  label: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
};

export function Switch({
  checked,
  defaultChecked = false,
  label,
  description,
  onCheckedChange,
  className,
  disabled,
  onClick,
  ...props
}: SwitchProps) {
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const currentChecked = isControlled ? checked : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !currentChecked;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <div className={cn(styles.root, disabled && styles.disabled, className)}>
      <button
        type="button"
        role="switch"
        aria-checked={currentChecked}
        aria-label={label}
        className={cn(styles.switch, currentChecked && styles.on)}
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle();
        }}
        {...props}
      >
        <span className={styles.thumb} />
      </button>
      <span className={styles.content}>
        <span className={styles.label}>{label}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
    </div>
  );
}
