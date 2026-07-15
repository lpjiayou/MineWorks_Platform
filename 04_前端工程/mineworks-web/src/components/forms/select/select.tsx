"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./select.module.css";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  options: SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  controlSize?: "sm" | "md" | "lg";
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    placeholder,
    invalid = false,
    controlSize = "md",
    className,
    "aria-invalid": ariaInvalid,
    ...props
  },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(styles.select, styles[controlSize], invalid && styles.invalid, className)}
      aria-invalid={ariaInvalid ?? (invalid || undefined)}
      {...props}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
});
