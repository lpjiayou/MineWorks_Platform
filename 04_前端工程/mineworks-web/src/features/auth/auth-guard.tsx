"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button, EmptyState, LoadingSkeleton, Panel } from "@/components";
import { useAuth } from "./auth-provider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") return <Panel><LoadingSkeleton variant="card" label="正在验证登录状态" /></Panel>;
  if (status === "guest") return <Panel><EmptyState icon={<LockKeyhole />} title="需要登录" description="项目、计算历史、团队成员和服务端保存功能需要用户身份。" primaryAction={<Link href="/login"><Button variant="primary">登录或注册</Button></Link>} /></Panel>;
  return <>{children}</>;
}
