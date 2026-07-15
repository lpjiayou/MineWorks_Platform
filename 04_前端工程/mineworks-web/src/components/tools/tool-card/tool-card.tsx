"use client";

import type { ReactNode } from "react";
import { ArrowRight, Clock3, LockKeyhole, Star } from "lucide-react";
import { Badge } from "@/components/feedback/badge/badge";
import { Button } from "@/components/primitives/button/button";
import { IconButton } from "@/components/primitives/icon-button/icon-button";
import { cn } from "@/lib/cn";
import type { AccessLevel, ToolStatus } from "@/types/status";
import styles from "./tool-card.module.css";

const accessMap: Record<AccessLevel, { label: string; tone: "brand" | "professional" | "team" }> = {
  free: { label: "免费", tone: "brand" },
  professional: { label: "专业会员", tone: "professional" },
  team: { label: "团队", tone: "team" },
  enterprise: { label: "企业", tone: "team" },
};
const statusMap: Record<ToolStatus, { label: string; tone: "success" | "warning" | "info" | "neutral" }> = {
  DRAFT: { label: "草稿", tone: "neutral" },
  REVIEWING: { label: "技术审核中", tone: "warning" },
  VALIDATED: { label: "已验证", tone: "success" },
  TEACHING: { label: "教学示例", tone: "info" },
  DEPRECATED: { label: "即将停用", tone: "warning" },
  DISABLED: { label: "已停用", tone: "neutral" },
};

export type ToolCardProps = {
  icon: ReactNode;
  name: string;
  description: string;
  category: string;
  accessLevel: AccessLevel;
  status: ToolStatus;
  isFavorite?: boolean;
  isLocked?: boolean;
  variant?: "card" | "list";
  version?: string;
  updatedAt?: string;
  availability?: "available" | "preview" | "planned";
  onFavoriteChange?: (nextFavorite: boolean) => void;
  onOpen?: () => void;
  className?: string;
};

export function ToolCard({
  icon,
  name,
  description,
  category,
  accessLevel,
  status,
  isFavorite = false,
  isLocked = false,
  variant = "card",
  version,
  updatedAt,
  availability = "available",
  onFavoriteChange,
  onOpen,
  className,
}: ToolCardProps) {
  const access = accessMap[accessLevel];
  const state = statusMap[status];
  const disabled = status === "DISABLED";
  const actionLabel = disabled ? "查看说明" : isLocked ? "查看权益" : availability === "planned" ? "查看规划" : "立即使用";
  return (
    <article className={cn(styles.card, variant === "list" && styles.list, disabled && styles.disabled, className)}>
      <div className={styles.top}>
        <div className={styles.icon}>{icon}</div>
        <div className={styles.badges}><Badge tone={access.tone}>{access.label}</Badge><Badge tone={state.tone}>{state.label}</Badge>{availability === "planned" ? <Badge tone="neutral">规划中</Badge> : null}</div>
      </div>
      <div className={styles.body}><h3>{name}</h3><p>{description}</p><div className={styles.meta}><span>{category}</span>{version ? <span>V{version}</span> : null}{updatedAt ? <span><Clock3 size={12} aria-hidden="true" />{updatedAt}</span> : null}</div></div>
      <div className={styles.footer}>
        <IconButton label={isFavorite ? "取消收藏" : "收藏工具"} icon={<Star size={17} />} isSelected={isFavorite} onClick={() => onFavoriteChange?.(!isFavorite)} />
        <Button variant="link" trailingIcon={isLocked ? <LockKeyhole size={14} /> : <ArrowRight size={15} />} onClick={onOpen}>{actionLabel}</Button>
      </div>
    </article>
  );
}
