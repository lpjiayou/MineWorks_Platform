"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  type ForwardedRef,
  type InputHTMLAttributes,
  type MutableRefObject,
} from "react";
import { cn } from "@/lib/cn";
import styles from "./checkbox.module.css";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  description?: string;
  indeterminate?: boolean;
};

function assignRef<T>(ref: ForwardedRef<T>, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as MutableRefObject<T | null>).current = value;
  }
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, className, disabled, id, ...props },
  forwardedRef,
) {
  const localRef = useRef<HTMLInputElement | null>(null);
  const descriptionId = description ? `${id ?? "checkbox"}-description` : undefined;

  useEffect(() => {
    if (localRef.current) localRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={cn(styles.root, disabled && styles.disabled, className)}>
      <input
        ref={(node) => {
          localRef.current = node;
          assignRef(forwardedRef, node);
        }}
        id={id}
        type="checkbox"
        className={styles.input}
        disabled={disabled}
        aria-describedby={descriptionId}
        {...props}
      />
      <span className={styles.control} aria-hidden="true">
        <span className={styles.checkmark}>✓</span>
        <span className={styles.mixed}>—</span>
      </span>
      <span className={styles.content}>
        <span className={styles.label}>{label}</span>
        {description ? (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
});
