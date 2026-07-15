"use client";

import { useId, useMemo, useState } from "react";
import { FolderKanban, Plus, SearchX } from "lucide-react";
import { Badge } from "@/components/feedback/badge/badge";
import { Button } from "@/components/primitives/button/button";
import { SearchInput } from "@/components/forms/search-input/search-input";
import { cn } from "@/lib/cn";
import styles from "./project-picker.module.css";

export type ProjectPickerItem = {
  id: string;
  name: string;
  description?: string;
  updatedAt?: string;
  status?: "active" | "archived";
  access?: "owner" | "team";
};

export type ProjectPickerProps = {
  projects: ProjectPickerItem[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  description?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allowStandalone?: boolean;
  standaloneValue?: string;
  standaloneLabel?: string;
  onCreateProject?: () => void;
  disabled?: boolean;
  className?: string;
};

export function ProjectPicker({
  projects,
  value,
  onValueChange,
  label = "选择保存项目",
  description = "计算记录将保存输入、结果、有效性和工具版本。",
  searchPlaceholder = "搜索项目",
  emptyText = "没有找到匹配项目",
  allowStandalone = true,
  standaloneValue = "__standalone__",
  standaloneLabel = "保存为独立记录",
  onCreateProject,
  disabled = false,
  className,
}: ProjectPickerProps) {
  const [query, setQuery] = useState("");
  const groupName = useId();
  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("zh-CN");
    if (!keyword) return projects;
    return projects.filter((project) => `${project.name} ${project.description ?? ""}`.toLocaleLowerCase("zh-CN").includes(keyword));
  }, [projects, query]);

  return (
    <fieldset className={cn(styles.root, className)} disabled={disabled}>
      <legend>{label}</legend>
      <p className={styles.description}>{description}</p>
      <SearchInput value={query} onValueChange={setQuery} placeholder={searchPlaceholder} aria-label={searchPlaceholder} statusText={`找到${filtered.length}个项目`} />
      <div className={styles.summary} aria-live="polite">{filtered.length} 个项目</div>
      <div className={styles.list} role="radiogroup" aria-label={label}>
        {filtered.map((project) => {
          const id = `${groupName}-${project.id}`;
          const isSelected = value === project.id;
          const isDisabled = project.status === "archived";
          return (
            <label key={project.id} htmlFor={id} className={cn(styles.option, isSelected && styles.selected, isDisabled && styles.disabled)}>
              <input id={id} type="radio" name={groupName} value={project.id} checked={isSelected} disabled={isDisabled} onChange={() => onValueChange(project.id)} />
              <span className={styles.radio} aria-hidden="true" />
              <span className={styles.projectIcon}><FolderKanban size={18} aria-hidden="true" /></span>
              <span className={styles.content}>
                <span className={styles.titleRow}><strong>{project.name}</strong>{project.access === "team" ? <Badge tone="team">团队</Badge> : null}{isDisabled ? <Badge tone="neutral">已归档</Badge> : null}</span>
                {project.description ? <small>{project.description}</small> : null}
                {project.updatedAt ? <small>最近更新：{project.updatedAt}</small> : null}
              </span>
            </label>
          );
        })}
        {allowStandalone ? (
          <label className={cn(styles.option, value === standaloneValue && styles.selected)}>
            <input type="radio" name={groupName} value={standaloneValue} checked={value === standaloneValue} onChange={() => onValueChange(standaloneValue)} />
            <span className={styles.radio} aria-hidden="true" />
            <span className={styles.projectIcon}>∞</span>
            <span className={styles.content}><span className={styles.titleRow}><strong>{standaloneLabel}</strong></span><small>不关联现有项目，后续仍可转入项目。</small></span>
          </label>
        ) : null}
        {filtered.length === 0 ? <div className={styles.empty}><SearchX size={24} aria-hidden="true" /><span>{emptyText}</span></div> : null}
      </div>
      {onCreateProject ? <Button variant="secondary" size="sm" leadingIcon={<Plus size={16} />} onClick={onCreateProject}>新建项目</Button> : null}
    </fieldset>
  );
}
