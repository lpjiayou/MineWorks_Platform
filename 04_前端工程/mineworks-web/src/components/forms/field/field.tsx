import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import styles from "./field.module.css";

export type FieldState = "default" | "success" | "warning" | "error";

type FieldControlProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

export type FieldProps = {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  optionalText?: string;
  helpText?: ReactNode;
  successText?: ReactNode;
  warningText?: ReactNode;
  errorText?: ReactNode;
  labelAction?: ReactNode;
  children: ReactElement<FieldControlProps>;
  className?: string;
};

export function Field({
  label,
  htmlFor,
  required = false,
  optionalText = "选填",
  helpText,
  successText,
  warningText,
  errorText,
  labelAction,
  children,
  className,
}: FieldProps) {
  const generatedId = useId();
  const controlId = htmlFor ?? children.props.id ?? `mw-field-${generatedId}`;
  const state: FieldState = errorText
    ? "error"
    : warningText
      ? "warning"
      : successText
        ? "success"
        : "default";
  const message = errorText ?? warningText ?? successText ?? helpText;
  const messageId = message ? `${controlId}-message` : undefined;
  const existingDescription = children.props["aria-describedby"];
  const describedBy = [existingDescription, messageId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id ?? controlId,
        required: children.props.required ?? required,
        "aria-describedby": describedBy,
        "aria-invalid": children.props["aria-invalid"] ?? (state === "error" || undefined),
      })
    : children;

  return (
    <div className={cn(styles.field, styles[state], className)} data-state={state}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={controlId}>
          {label}
          {required ? <span className={styles.required} aria-hidden="true">*</span> : <span className={styles.optional} aria-hidden="true">{optionalText}</span>}
        </label>
        {labelAction ? <div className={styles.labelAction}>{labelAction}</div> : null}
      </div>
      {control}
      {message ? (
        <div id={messageId} className={styles.message} role={state === "error" ? "alert" : undefined}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
