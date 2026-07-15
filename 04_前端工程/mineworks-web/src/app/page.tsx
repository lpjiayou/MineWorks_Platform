import Link from "next/link";
import { ArrowRight, Boxes, CheckCircle2, Component, FileCode2, FlaskConical, Layers3, ShieldCheck } from "lucide-react";
import { Alert, Badge, Button, Card, EngineeringValue, Panel, PublicHeader, ToolCard, ValidityBadge } from "@/components";
import styles from "./page.module.css";

const milestones = [
  ["M0", "工程初始化", "Next.js、TypeScript、ESLint、Vitest与Storybook配置"],
  ["M1", "设计令牌", "浅色、深色、间距、圆角、状态与工程数值规则"],
  ["M2", "P0第一批", "Select、Checkbox、RadioGroup、Switch、Tabs、Modal与Toast"],
  ["M3", "P0第三批", "公式、计算步骤、权限、项目与筛选组件"],
  ["M4", "工具中心", "数据模型、分类导航、URL状态、收藏与最近使用"],
];

export default function Home() {
  return <><PublicHeader /><main id="main-content" className={styles.main}><section className={styles.hero}><div><Badge tone="success">工程骨架已建立</Badge><h1>Next.js 前端工程<br />与 MineWorks UI 组件库</h1><p>本阶段已建立严格TypeScript工程、主题令牌、单位系统、首批工程组件、P0交互组件、Storybook和自动测试入口，并已建立工具中心真实页面模式，为后续基础工具和高级分析正式开发提供统一底座。</p><div className={styles.heroActions}><Link href="/tools"><Button variant="primary" size="lg" trailingIcon={<ArrowRight size={18} />}>进入工具中心</Button></Link><Button variant="secondary" size="lg">启动 Storybook</Button></div></div><div className={styles.heroPanel}><div className={styles.heroPanelTop}><span>MineWorks UI</span><Badge tone="brand">V0.5</Badge></div><div className={styles.metric}><strong>30+</strong><span>组件与页面模块</span></div><div className={styles.metric}><strong>4</strong><span>已配置质量脚本</span></div><div className={styles.code}>npm run verify</div></div></section>

<section className={styles.summary} id="components"><Card><Component size={22} /><strong>组件优先</strong><span>页面不重复造控件</span></Card><Card><Layers3 size={22} /><strong>令牌驱动</strong><span>主题与状态统一</span></Card><Card><ShieldCheck size={22} /><strong>严格类型</strong><span>禁止隐式 any</span></Card><Card><FlaskConical size={22} /><strong>工程语义</strong><span>0、null与单位清晰</span></Card></section>

<section className={styles.grid}><Panel title="工程组件预览" subtitle="页面已经使用真实组件骨架，而不是静态截图。"><div className={styles.resultGrid}><Card><div className={styles.label}>干固体量</div><EngineeringValue value={68.61} unit="t/h" emphasize /><p>核心结果｜质量流量 × 固体质量分数</p></Card><Card><div className={styles.label}>数据状态</div><ValidityBadge validity="VALID" /><p>输入与基础一致性检查通过。</p></Card></div><Alert tone="warning" title="当前边界">公式仍未接入 FastAPI 与 mining_core；现阶段仅搭建前端组件和工程结构。</Alert></Panel>
<Panel title="工具卡片骨架" subtitle="权益、审核状态、用途和操作统一表达。"><ToolCard icon={<Boxes />} name="干固体量计算" description="根据矿浆体积流量、矿浆密度和固体质量分数计算干固体处理量。" category="选矿工具 / 浆体计算" accessLevel="free" status="VALIDATED" isFavorite /></Panel></section>

<section id="milestones"><Panel title="当前实施里程碑" subtitle="按组件库开发任务清单逐步完成。"><div className={styles.timeline}>{milestones.map(([code,title,desc]) => <article key={code}><span>{code}</span><div><strong>{title}</strong><p>{desc}</p></div><CheckCircle2 size={18} /></article>)}</div></Panel></section>

<section className={styles.next}><FileCode2 size={30} /><div><h2>真实工具页面入口</h2><p>工具中心已经支持专业分类、URL筛选、收藏、最近使用和免费/会员工具展示。</p></div><Link href="/tools"><Button variant="primary" trailingIcon={<ArrowRight size={17} />}>浏览全部工具</Button></Link></section></main></>;
}
