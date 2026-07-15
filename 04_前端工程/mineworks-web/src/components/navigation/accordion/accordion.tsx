"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./accordion.module.css";

export type AccordionItem = {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  meta?: ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  type?: "single" | "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  collapsible?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function Accordion({
  items,
  type = "single",
  value,
  defaultValue = [],
  onValueChange,
  collapsible = true,
  className,
  ariaLabel = "折叠内容",
}: AccordionProps) {
  const generatedId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const expandedValues = controlled ? value : internalValue;
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const setValues = (next: string[]) => {
    if (!controlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const toggle = (itemValue: string) => {
    const isOpen = expandedValues.includes(itemValue);
    if (type === "single") {
      if (isOpen && collapsible) setValues([]);
      else if (!isOpen) setValues([itemValue]);
      return;
    }
    setValues(isOpen ? expandedValues.filter((current) => current !== itemValue) : [...expandedValues, itemValue]);
  };

  const enabledIndexes = items.map((item, index) => (item.disabled ? -1 : index)).filter((index) => index >= 0);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabledPosition = enabledIndexes.indexOf(index);
    let nextIndex: number | undefined;
    if (event.key === "ArrowDown") nextIndex = enabledIndexes[(enabledPosition + 1) % enabledIndexes.length];
    if (event.key === "ArrowUp") nextIndex = enabledIndexes[(enabledPosition - 1 + enabledIndexes.length) % enabledIndexes.length];
    if (event.key === "Home") nextIndex = enabledIndexes[0];
    if (event.key === "End") nextIndex = enabledIndexes[enabledIndexes.length - 1];
    if (nextIndex === undefined) return;
    event.preventDefault();
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn(styles.root, className)} aria-label={ariaLabel}>
      {items.map((item, index) => {
        const open = expandedValues.includes(item.value);
        const triggerId = `${generatedId}-trigger-${item.value}`;
        const panelId = `${generatedId}-panel-${item.value}`;
        return (
          <section key={item.value} className={cn(styles.item, open && styles.open, item.disabled && styles.disabled)}>
            <h3 className={styles.heading}>
              <button
                ref={(node) => { buttonRefs.current[index] = node; }}
                id={triggerId}
                type="button"
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
              >
                <span className={styles.label}>{item.label}</span>
                <span className={styles.trailing}>
                  {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
                  <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!open}
              className={styles.panel}
            >
              <div className={styles.content}>{item.content}</div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
