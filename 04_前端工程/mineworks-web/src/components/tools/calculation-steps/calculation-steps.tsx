"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { EngineeringValue } from "@/components/data-display/engineering-value/engineering-value";
import { Badge } from "@/components/feedback/badge/badge";
import { FormulaBlock, type FormulaBlockTone } from "@/components/tools/formula-block/formula-block";
import styles from "./calculation-steps.module.css";

export type CalculationStepResult = {
  label?: string;
  value: number | null | undefined;
  unit: string;
  precision?: number;
};

export type CalculationStep = {
  id: string;
  title: string;
  description?: string;
  formula: string;
  substitutedExpression?: string;
  result?: CalculationStepResult;
  note?: string;
  tone?: FormulaBlockTone;
};

export type CalculationStepsProps = {
  steps: CalculationStep[];
  defaultExpandedIds?: string[];
  title?: string;
  description?: string;
  className?: string;
};

const toneLabels: Partial<Record<FormulaBlockTone, string>> = {
  info: "提示",
  warning: "需复核",
  error: "失败",
};

export function CalculationSteps({
  steps,
  defaultExpandedIds,
  title = "计算过程",
  description = "公式、代入过程和中间结果",
  className,
}: CalculationStepsProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultExpandedIds ?? steps.map((step) => step.id)),
  );

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className={cn(styles.root, className)} aria-label={title}>
      <header className={styles.header}>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{steps.length} 个步骤</span>
      </header>
      <ol className={styles.list}>
        {steps.map((step, index) => {
          const isOpen = expanded.has(step.id);
          const contentId = `calculation-step-${step.id}`;
          const tone = step.tone ?? "default";
          return (
            <li key={step.id} className={cn(styles.step, styles[tone])}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggle(step.id)}
              >
                <span className={styles.index}>{index + 1}</span>
                <span className={styles.stepHeading}>
                  <strong>{step.title}</strong>
                  {step.description ? <small>{step.description}</small> : null}
                </span>
                {toneLabels[tone] ? <Badge tone={tone === "error" ? "danger" : tone === "warning" ? "warning" : "info"}>{toneLabels[tone]}</Badge> : null}
                <ChevronDown className={cn(styles.chevron, isOpen && styles.open)} size={18} aria-hidden="true" />
              </button>
              {isOpen ? (
                <div id={contentId} className={styles.content}>
                  <FormulaBlock formula={step.formula} tone={tone} copyable={false} />
                  {step.substitutedExpression ? (
                    <FormulaBlock title="代入计算" formula={step.substitutedExpression} tone={tone} />
                  ) : null}
                  {step.result ? (
                    <div className={styles.result}>
                      <span>{step.result.label ?? "步骤结果"}</span>
                      <EngineeringValue
                        value={step.result.value}
                        unit={step.result.unit}
                        precision={step.result.precision}
                        emphasize
                      />
                    </div>
                  ) : null}
                  {step.note ? <p className={styles.note}>{step.note}</p> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
