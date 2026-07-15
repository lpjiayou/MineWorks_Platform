"use client";

import { useId, useMemo, useState } from "react";
import { Filter, LayoutGrid, List, X } from "lucide-react";
import { Button } from "@/components/primitives/button/button";
import { Checkbox } from "@/components/primitives/checkbox/checkbox";
import { SearchInput } from "@/components/forms/search-input/search-input";
import { Select, type SelectOption } from "@/components/forms/select/select";
import { cn } from "@/lib/cn";
import styles from "./filter-bar.module.css";

export type FilterBarOption = { value: string; label: string; count?: number; disabled?: boolean };
export type FilterBarGroup = { id: string; label: string; options: FilterBarOption[] };
export type FilterBarView = "card" | "list";

export type FilterBarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch?: (query: string) => void;
  groups: FilterBarGroup[];
  selected: Record<string, string[]>;
  onSelectedChange: (groupId: string, values: string[]) => void;
  sortOptions?: SelectOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  view?: FilterBarView;
  onViewChange?: (view: FilterBarView) => void;
  resultCount?: number;
  onClear?: () => void;
  searchPlaceholder?: string;
  className?: string;
};

export function FilterBar({
  query,
  onQueryChange,
  onSearch,
  groups,
  selected,
  onSelectedChange,
  sortOptions = [],
  sortValue = "",
  onSortChange,
  view = "card",
  onViewChange,
  resultCount,
  onClear,
  searchPlaceholder = "搜索工具、设备或资料",
  className,
}: FilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const id = useId();
  const activeItems = useMemo(() => groups.flatMap((group) => (selected[group.id] ?? []).map((value) => ({ group, value, option: group.options.find((option) => option.value === value) }))).filter((item) => item.option), [groups, selected]);

  const toggleValue = (groupId: string, value: string, checked: boolean) => {
    const current = selected[groupId] ?? [];
    const next = checked ? [...new Set([...current, value])] : current.filter((item) => item !== value);
    onSelectedChange(groupId, next);
  };

  const clearAll = () => {
    if (onClear) {
      onClear();
      return;
    }
    onQueryChange("");
    groups.forEach((group) => onSelectedChange(group.id, []));
  };

  return (
    <section className={cn(styles.root, className)} aria-label="筛选和排序">
      <div className={styles.toolbar}>
        <SearchInput value={query} onValueChange={onQueryChange} onSearch={onSearch} placeholder={searchPlaceholder} aria-label={searchPlaceholder} statusText={resultCount === undefined ? undefined : `找到${resultCount}项结果`} />
        {sortOptions.length > 0 ? <Select aria-label="排序方式" options={sortOptions} value={sortValue} onChange={(event) => onSortChange?.(event.target.value)} /> : null}
        <Button variant="tertiary" leadingIcon={<Filter size={16} />} aria-expanded={filtersOpen} aria-controls={`${id}-filters`} onClick={() => setFiltersOpen((value) => !value)}>筛选{activeItems.length ? ` (${activeItems.length})` : ""}</Button>
        {onViewChange ? <div className={styles.viewSwitch} aria-label="视图方式"><button type="button" aria-label="卡片视图" aria-pressed={view === "card"} onClick={() => onViewChange("card")}><LayoutGrid size={17} /></button><button type="button" aria-label="列表视图" aria-pressed={view === "list"} onClick={() => onViewChange("list")}><List size={17} /></button></div> : null}
      </div>

      <div id={`${id}-filters`} className={cn(styles.filters, filtersOpen && styles.open)}>
        {groups.map((group) => (
          <fieldset key={group.id}>
            <legend>{group.label}</legend>
            <div className={styles.options}>
              {group.options.map((option) => <Checkbox key={option.value} label={option.count === undefined ? option.label : `${option.label} (${option.count})`} checked={(selected[group.id] ?? []).includes(option.value)} disabled={option.disabled} onChange={(event) => toggleValue(group.id, option.value, event.target.checked)} />)}
            </div>
          </fieldset>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.chips} aria-label="已选筛选条件">
          {activeItems.map(({ group, value, option }) => <button key={`${group.id}-${value}`} type="button" className={styles.chip} onClick={() => toggleValue(group.id, value, false)}>{group.label}：{option?.label}<X size={13} aria-hidden="true" /></button>)}
          {activeItems.length === 0 && !query ? <span>未设置筛选条件</span> : null}
        </div>
        <div className={styles.footerActions}>{resultCount !== undefined ? <strong>{resultCount} 项结果</strong> : null}{(activeItems.length > 0 || query) ? <Button variant="link" size="sm" onClick={clearAll}>清除全部</Button> : null}</div>
      </div>
    </section>
  );
}
