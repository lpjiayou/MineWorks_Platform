import { Suspense } from "react";
import { Clock3 } from "lucide-react";
import { Badge, Breadcrumb, PublicHeader } from "@/components";
import { RecentToolTracker } from "@/features/tool-center/recent-tool-tracker";
import { TOOL_CATEGORY_LABELS, TOOL_DISCIPLINES } from "@/features/tool-center/tool-data";
import { ToolIcon } from "@/features/tool-center/tool-icon";
import type { ToolDefinition } from "@/features/tool-center/types";
import { DrySolidsCalculator } from "./dry-solids-calculator";
import styles from "./dry-solids-tool-page.module.css";

export function DrySolidsToolPage({ tool }: { tool: ToolDefinition }) {
  const discipline = TOOL_DISCIPLINES.find((item) => item.id === tool.discipline)?.label ?? tool.discipline;
  return (
    <>
      <PublicHeader />
      <RecentToolTracker toolId={tool.id} />
      <main id="main-content" className={styles.main}>
        <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "工具中心", href: "/tools" }, { label: tool.name }]} />
        <section className={styles.hero}>
          <div className={styles.icon}><ToolIcon name={tool.icon} size={30} /></div>
          <div className={styles.title}>
            <div className={styles.badges}><Badge tone="brand">免费</Badge><Badge tone="success">已验证</Badge><Badge tone="info">API已接入</Badge></div>
            <h1>{tool.name}</h1>
            <p>{tool.description}</p>
            <div className={styles.meta}><span>{discipline}</span><span>{TOOL_CATEGORY_LABELS[tool.category]}</span><span><Clock3 size={13} />更新 {tool.updatedAt}</span><span>公式版本 1.0.0</span></div>
          </div>
        </section>
        <Suspense fallback={<p>正在加载工具参数…</p>}><DrySolidsCalculator /></Suspense>
        <p className={styles.disclaimer}>本工具用于工程快速核算和数据一致性检查。正式设计成果仍需结合项目资料、测量质量和专业复核。</p>
      </main>
    </>
  );
}
