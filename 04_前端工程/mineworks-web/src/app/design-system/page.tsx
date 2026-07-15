import { PublicHeader } from "@/components";
import { ShowcaseClient } from "./showcase-client";
import styles from "./page.module.css";

export default function DesignSystemPage() {
  return (
    <>
      <PublicHeader />
      <main id="main-content" className={styles.main}>
        <header className={styles.header}>
          <div>
            <span>MineWorks UI / P0 Batch 3</span>
            <h1>P0基础组件、领域组件与工程语义</h1>
            <p>本页用于验证P0前三批组件在真实Next.js页面中的输入、状态、公式、权限、项目、导出和工具中心筛选。</p>
          </div>
        </header>
        <ShowcaseClient />
      </main>
    </>
  );
}
