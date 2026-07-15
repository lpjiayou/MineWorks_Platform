"use client";

import { forwardRef, type InputHTMLAttributes, type KeyboardEvent } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./search-input.module.css";

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  shortcutHint?: string;
  clearLabel?: string;
  searchLabel?: string;
  statusText?: string;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    onValueChange,
    onSearch,
    onClear,
    isLoading = false,
    shortcutHint,
    clearLabel = "清除搜索内容",
    searchLabel = "搜索",
    statusText,
    className,
    disabled,
    onKeyDown,
    ...props
  },
  ref,
) {
  const clear = () => {
    onValueChange("");
    onClear?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter") onSearch?.(value.trim());
    if (event.key === "Escape" && value) {
      event.preventDefault();
      clear();
    }
  };

  return (
    <div className={cn(styles.root, disabled && styles.disabled, className)}>
      <Search className={styles.searchIcon} size={18} aria-hidden="true" />
      <input
        ref={ref}
        type="search"
        value={value}
        disabled={disabled}
        aria-label={props["aria-label"] ?? searchLabel}
        aria-busy={isLoading || undefined}
        className={styles.input}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        {...props}
      />
      <div className={styles.actions}>
        {isLoading ? <LoaderCircle className={styles.spinner} size={17} aria-label="搜索中" /> : null}
        {!isLoading && value ? (
          <button type="button" className={styles.clear} aria-label={clearLabel} onClick={clear} disabled={disabled}>
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
        {shortcutHint && !value && !isLoading ? <kbd className={styles.shortcut}>{shortcutHint}</kbd> : null}
      </div>
      {statusText ? <span className="sr-only" aria-live="polite">{statusText}</span> : null}
    </div>
  );
});
