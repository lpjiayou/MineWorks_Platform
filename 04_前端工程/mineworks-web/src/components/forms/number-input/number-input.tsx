import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import styles from "./number-input.module.css";

export type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  value: number | null;
  onValueChange: (value: number | null) => void;
  validationState?: "default" | "warning" | "error";
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { value, onValueChange, validationState = "default", className, ...props }, ref,
) {
  return (
    <input
      ref={ref}
      type="number"
      value={value ?? ""}
      className={cn(styles.input, styles[validationState], className)}
      onChange={(event) => onValueChange(event.target.value === "" ? null : event.target.valueAsNumber)}
      aria-invalid={validationState === "error" || undefined}
      {...props}
    />
  );
});
