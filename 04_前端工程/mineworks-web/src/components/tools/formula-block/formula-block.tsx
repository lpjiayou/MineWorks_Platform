"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./formula-block.module.css";

export type FormulaBlockTone = "default" | "info" | "warning" | "error";

export type FormulaBlockProps = {
  formula: string;
  title?: string;
  description?: string;
  version?: string;
  tone?: FormulaBlockTone;
  copyable?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  onCopy?: (formula: string) => void;
  className?: string;
};

export function FormulaBlock({
  formula,
  title,
  description,
  version,
  tone = "default",
  copyable = true,
  copyLabel = "复制公式",
  copiedLabel = "公式已复制",
  ariaLabel = "工程计算公式",
  onCopy,
  className,
}: FormulaBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyFormula = () => {
    onCopy?.(formula);
    setCopied(true);
    void navigator.clipboard?.writeText(formula).catch(() => {
      // Clipboard availability depends on browser permissions. The host callback still receives the formula.
    });
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className={cn(styles.root, styles[tone], className)} aria-label={ariaLabel}>
      {(title || description || version || copyable) ? (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title ? <strong>{title}</strong> : null}
            {description ? <span>{description}</span> : null}
          </div>
          <div className={styles.actions}>
            {version ? <span className={styles.version}>公式版本 {version}</span> : null}
            {copyable ? (
              <button type="button" className={styles.copy} onClick={copyFormula} aria-label={copied ? copiedLabel : copyLabel}>
                {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                <span>{copied ? "已复制" : "复制"}</span>
              </button>
            ) : null}
          </div>
        </header>
      ) : null}
      <pre className={styles.formula}><code>{formula}</code></pre>
      <span className="sr-only" aria-live="polite">{copied ? copiedLabel : ""}</span>
    </section>
  );
}
