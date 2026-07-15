"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import styles from "./radio-group.module.css";

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type RadioGroupProps = {
  name?: string;
  label?: string;
  value?: string;
  defaultValue?: string;
  options: RadioOption[];
  orientation?: "vertical" | "horizontal";
  variant?: "standard" | "card";
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
};

export function RadioGroup({
  name,
  label,
  value,
  defaultValue,
  options,
  orientation = "vertical",
  variant = "standard",
  disabled = false,
  onValueChange,
  className,
}: RadioGroupProps) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (nextValue: string) => {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  return (
    <fieldset className={cn(styles.fieldset, className)} disabled={disabled}>
      {label ? <legend className={styles.legend}>{label}</legend> : null}
      <div className={cn(styles.options, styles[orientation], styles[variant])}>
        {options.map((option) => {
          const optionId = `${groupName}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                styles.option,
                currentValue === option.value && styles.selected,
                (disabled || option.disabled) && styles.disabled,
              )}
            >
              <input
                id={optionId}
                type="radio"
                name={groupName}
                value={option.value}
                checked={currentValue === option.value}
                disabled={disabled || option.disabled}
                onChange={() => handleChange(option.value)}
              />
              <span className={styles.radio} aria-hidden="true" />
              <span className={styles.content}>
                <span className={styles.label}>{option.label}</span>
                {option.description ? <span className={styles.description}>{option.description}</span> : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
