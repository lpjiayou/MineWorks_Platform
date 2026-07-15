"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, Download, LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/primitives/button/button";
import { cn } from "@/lib/cn";
import { hasPlanAccess, planLabels, type AccessPlan } from "@/lib/permissions/plan";
import styles from "./export-menu.module.css";

export type ExportFormat = {
  id: string;
  label: string;
  description?: string;
  extension?: string;
  requiredPlan?: AccessPlan;
  disabled?: boolean;
  icon?: ReactNode;
};

export type ExportMenuProps = {
  formats: ExportFormat[];
  currentPlan: AccessPlan;
  onExport: (format: ExportFormat) => void | Promise<void>;
  onLockedFormat?: (format: ExportFormat) => void;
  label?: string;
  exportingFormatId?: string;
  disabled?: boolean;
  align?: "start" | "end";
  className?: string;
};

export function ExportMenu({
  formats,
  currentPlan,
  onExport,
  onLockedFormat,
  label = "导出",
  exportingFormatId,
  disabled = false,
  align = "end",
  className,
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter((item): item is HTMLButtonElement => Boolean(item));
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = index < 0 ? 0 : (index + direction + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      <Button
        variant="secondary"
        leadingIcon={<Download size={17} />}
        trailingIcon={<ChevronDown className={cn(styles.chevron, open && styles.open)} size={16} />}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
      </Button>
      {open ? (
        <div className={cn(styles.menu, styles[align])} role="menu" aria-label="导出格式" onKeyDown={handleMenuKeyDown}>
          {formats.map((format, index) => {
            const requiredPlan = format.requiredPlan ?? "free";
            const locked = !hasPlanAccess(currentPlan, requiredPlan);
            const exporting = exportingFormatId === format.id;
            return (
              <button
                key={format.id}
                ref={(node) => { itemRefs.current[index] = node; }}
                type="button"
                role="menuitem"
                className={cn(styles.item, locked && styles.locked)}
                disabled={format.disabled || exporting}
                onClick={() => {
                  if (locked) onLockedFormat?.(format);
                  else onExport(format);
                  setOpen(false);
                }}
              >
                <span className={styles.icon}>{exporting ? <LoaderCircle className={styles.spinner} size={17} /> : locked ? <LockKeyhole size={17} /> : format.icon ?? <Download size={17} />}</span>
                <span className={styles.content}><strong>{format.label}{format.extension ? ` (.${format.extension})` : ""}</strong>{format.description ? <small>{format.description}</small> : null}</span>
                {locked ? <span className={styles.plan}>{planLabels[requiredPlan]}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
