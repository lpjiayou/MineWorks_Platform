"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./tabs.module.css";

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "line" | "card" | "segmented";
  orientation?: "horizontal" | "vertical";
  className?: string;
  ariaLabel?: string;
};

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "line",
  orientation = "horizontal",
  className,
  ariaLabel = "选项卡",
}: TabsProps) {
  const generatedId = useId();
  const firstEnabled = items.find((item) => !item.disabled)?.value ?? "";
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled);
  const currentValue = isControlled ? value : internalValue;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectValue = (nextValue: string) => {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const enabledIndexes = items
    .map((item, index) => (!item.disabled ? index : -1))
    .filter((index) => index >= 0);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (enabledIndexes.length === 0) return;
    const currentEnabledPosition = enabledIndexes.indexOf(index);
    const previousKeys = orientation === "horizontal" ? ["ArrowLeft"] : ["ArrowUp"];
    const nextKeys = orientation === "horizontal" ? ["ArrowRight"] : ["ArrowDown"];
    let nextIndex: number | undefined;

    if (previousKeys.includes(event.key)) {
      nextIndex = enabledIndexes[(currentEnabledPosition - 1 + enabledIndexes.length) % enabledIndexes.length];
    } else if (nextKeys.includes(event.key)) {
      nextIndex = enabledIndexes[(currentEnabledPosition + 1) % enabledIndexes.length];
    } else if (event.key === "Home") {
      nextIndex = enabledIndexes[0];
    } else if (event.key === "End") {
      nextIndex = enabledIndexes[enabledIndexes.length - 1];
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextItem = items[nextIndex];
    if (!nextItem) return;
    selectValue(nextItem.value);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn(styles.root, styles[orientation], className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={cn(styles.tabList, styles[variant])}
      >
        {items.map((item, index) => {
          const selected = currentValue === item.value;
          const tabId = `${generatedId}-tab-${item.value}`;
          const panelId = `${generatedId}-panel-${item.value}`;
          return (
            <button
              key={item.value}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId}
              aria-controls={panelId}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              className={cn(styles.tab, selected && styles.selected)}
              onClick={() => selectValue(item.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const selected = currentValue === item.value;
        const tabId = `${generatedId}-tab-${item.value}`;
        const panelId = `${generatedId}-panel-${item.value}`;
        return (
          <div
            key={item.value}
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId}
            hidden={!selected}
            tabIndex={0}
            className={styles.panel}
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
}
