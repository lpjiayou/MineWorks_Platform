"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { convertUnit } from "@/lib/units/convert";
import { findUnit, unitRegistry } from "@/lib/units/registry";
import type { UnitQuantity, UnitValue } from "@/lib/units/types";
import styles from "./unit-input.module.css";

export type UnitInputProps = {
  label: string;
  quantity: UnitQuantity;
  value: UnitValue;
  onChange: (next: UnitValue) => void;
  required?: boolean;
  helpText?: string;
  warningText?: string;
  errorText?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function UnitInput({ label, quantity, value, onChange, required = false, helpText, warningText, errorText, min, max, disabled = false }: UnitInputProps) {
  const id = useId();
  const validationState = errorText ? "error" : warningText ? "warning" : "default";
  const units = unitRegistry[quantity];
  const currentUnit = findUnit(quantity, value.unit);

  const changeUnit = (nextUnit: string) => {
    const converted = value.value === null ? null : convertUnit(value.value, quantity, value.unit, nextUnit);
    const precision = findUnit(quantity, nextUnit).precision;
    onChange({ value: converted === null ? null : Number(converted.toFixed(precision)), unit: nextUnit });
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</label>
      <div className={cn(styles.shell, styles[validationState])}>
        <input
          id={id}
          type="number"
          value={value.value ?? ""}
          min={min}
          max={max}
          step="any"
          disabled={disabled}
          aria-invalid={Boolean(errorText) || undefined}
          aria-describedby={`${id}-description`}
          onChange={(event) => onChange({ value: event.target.value === "" ? null : event.target.valueAsNumber, unit: value.unit })}
        />
        <select aria-label={`${label}单位`} value={value.unit} disabled={disabled} onChange={(event) => changeUnit(event.target.value)}>
          {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.symbol}</option>)}
        </select>
      </div>
      <div id={`${id}-description`} className={errorText ? styles.errorText : warningText ? styles.warningText : styles.helpText}>
        {errorText ?? warningText ?? helpText ?? `标准单位：${currentUnit.baseUnit}`}
      </div>
    </div>
  );
}
