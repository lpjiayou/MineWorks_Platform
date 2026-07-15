"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./category-navigation.module.css";

export type CategoryNavigationItem = {
  id: string;
  label: string;
  description?: string;
  count?: number;
  icon?: ReactNode;
};

export type CategoryNavigationProps = {
  items: CategoryNavigationItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
};

export function CategoryNavigation({ items, selectedId, onSelect, className }: CategoryNavigationProps) {
  return (
    <nav className={cn(styles.root, className)} aria-label="工具专业分类">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={cn(styles.item, selectedId === item.id && styles.selected)}
          aria-current={selectedId === item.id ? "page" : undefined}
          onClick={() => onSelect(item.id)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.content}>
            <strong>{item.label}</strong>
            {item.description ? <small>{item.description}</small> : null}
          </span>
          {item.count !== undefined ? <span className={styles.count}>{item.count}</span> : null}
        </button>
      ))}
    </nav>
  );
}
