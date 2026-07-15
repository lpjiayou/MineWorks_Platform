"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button, PermissionGate } from "@/components";
import { useAuth } from "@/features/auth/auth-provider";
import { maxPlan, type AccessPlan } from "@/lib/permissions/plan";

export function ToolAccessGate({ feature, requiredPlan, preview, children }: {
  feature: string;
  requiredPlan: AccessPlan;
  preview: ReactNode;
  children: ReactNode;
}) {
  const { status, identity } = useAuth();
  const activeTeam = identity?.teams.find((team) => team.id === identity.active_team_id);
  const currentPlan = maxPlan(identity?.user.plan ?? "guest", activeTeam?.plan ?? "guest");
  return <PermissionGate
    feature={feature}
    requiredPlan={requiredPlan}
    currentPlan={currentPlan}
    mode="preview"
    description="当前可以查看工具用途和示例；获得对应套餐后可执行完整计算、保存项目并导出正式成果。"
    preview={preview}
    upgradeAction={<Link href={status === "authenticated" ? "/billing" : "/pricing"}><Button variant="primary">{status === "authenticated" ? "查看订阅与用量" : "查看升级方案"}</Button></Link>}
    alternativeAction={<Link href="/tools?access=free"><Button variant="secondary">浏览免费工具</Button></Link>}
  >{children}</PermissionGate>;
}
