import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingSkeleton, PublicHeader } from "@/components";
import { ToolCenterClient } from "@/features/tool-center/tool-center-client";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "工具中心",
  description: "选矿、采矿、自动化、电气、设备和土建工程在线工具中心。",
};

export default function ToolsPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className={styles.main}>
        <Suspense fallback={<LoadingSkeleton variant="card" label="正在加载工具中心" />}>
          <ToolCenterClient />
        </Suspense>
      </main>
    </>
  );
}
