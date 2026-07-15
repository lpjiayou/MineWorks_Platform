import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicHeader } from "@/components";
import { AuthGuard } from "@/features/auth/auth-guard";
import { HistoryPage } from "@/features/calculation-history/history-page";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "统一计算历史",
  description: "统一管理矿业工程工具计算记录、项目归属和结果复用。",
};

export default function CalculationHistoryRoute() {
  return <><PublicHeader /><main id="main-content" className={styles.main}><AuthGuard><Suspense fallback={<p>正在加载计算历史…</p>}><HistoryPage /></Suspense></AuthGuard></main></>;
}
