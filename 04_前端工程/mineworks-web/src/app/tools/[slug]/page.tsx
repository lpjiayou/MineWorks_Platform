import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, Construction } from "lucide-react";
import { Alert, Badge, Breadcrumb, Button, Panel, PublicHeader } from "@/components";
import { getToolBySlug, TOOL_CATEGORY_LABELS, TOOL_DISCIPLINES } from "@/features/tool-center/tool-data";
import { ToolIcon } from "@/features/tool-center/tool-icon";
import { RecentToolTracker } from "@/features/tool-center/recent-tool-tracker";
import { DrySolidsToolPage } from "@/features/dry-solids/dry-solids-tool-page";
import { SlurryDensityToolPage } from "@/features/slurry-density/slurry-density-tool-page";
import type { AccessPlan } from "@/lib/permissions/plan";
import { ToolAccessGate } from "@/features/billing/tool-access-gate";
import styles from "./page.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  return tool ? { title: tool.name, description: tool.description } : { title: "工具不存在" };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  if (tool.id === "dry-solids-rate") return <DrySolidsToolPage tool={tool} />;
  if (tool.id === "slurry-density-conversion") return <SlurryDensityToolPage tool={tool} />;
  const requiredPlan = tool.accessLevel as AccessPlan;
  const discipline = TOOL_DISCIPLINES.find((item) => item.id === tool.discipline)?.label ?? tool.discipline;
  const isReady = ["dry-solids-rate", "slurry-density-conversion"].includes(tool.id);

  const content = (
    <Panel title={isReady ? "工具接入状态" : "功能建设状态"} subtitle="该页面用于验证工具中心到详情页的数据链和访问记录。">
      <div className={styles.statusCard}>
        <span className={styles.statusIcon}>{isReady ? <CheckCircle2 /> : <Construction />}</span>
        <div><strong>{isReady ? "前端交互原型已完成" : tool.availability === "planned" ? "已进入产品规划" : "功能预览已建立"}</strong><p>{isReady ? "下一阶段将把正式计算迁移到 FastAPI 与 mining_core，并接入保存、导出和项目记录。" : "当前提供工具用途、专业分类和会员权益说明，正式算法与报告将在对应开发阶段接入。"}</p></div>
      </div>
      <Alert tone="info" title="工程边界">工具中心中的状态、收藏和最近使用已真实联动；本页面不输出未经专业审核的正式计算结果。</Alert>
    </Panel>
  );

  return (
    <>
      <PublicHeader />
      <RecentToolTracker toolId={tool.id} />
      <main id="main-content" className={styles.main}>
        <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "工具中心", href: "/tools" }, { label: tool.name }]} />
        <section className={styles.hero}>
          <div className={styles.icon}><ToolIcon name={tool.icon} size={30} /></div>
          <div className={styles.title}><div className={styles.badges}><Badge tone={tool.accessLevel === "free" ? "brand" : "professional"}>{tool.accessLevel === "free" ? "免费" : tool.accessLevel === "professional" ? "专业会员" : "团队/企业"}</Badge><Badge tone={tool.status === "VALIDATED" ? "success" : tool.status === "REVIEWING" ? "warning" : "info"}>{tool.status === "VALIDATED" ? "已验证" : tool.status === "REVIEWING" ? "技术审核中" : tool.status === "DRAFT" ? "草稿" : "教学示例"}</Badge></div><h1>{tool.name}</h1><p>{tool.description}</p><div className={styles.meta}><span>{discipline}</span><span>{TOOL_CATEGORY_LABELS[tool.category]}</span><span><Clock3 size={13} />更新 {tool.updatedAt}</span><span>版本 {tool.version}</span></div></div>
        </section>

        {tool.accessLevel === "free" ? content : <ToolAccessGate feature={tool.name} requiredPlan={requiredPlan} preview={content}>{content}</ToolAccessGate>}

        <div className={styles.back}><Link href="/tools"><Button variant="secondary" leadingIcon={<ArrowLeft size={16} />}>返回工具中心</Button></Link></div>
      </main>
    </>
  );
}
