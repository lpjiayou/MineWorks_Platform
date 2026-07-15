"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, LoadingSkeleton, PublicHeader } from "@/components";
import { useAuth } from "@/features/auth/auth-provider";
import { createBillingApi } from "./api";
import { formatPrice } from "./format";
import type { BillingCycle, PlanDefinition } from "./types";
import styles from "./pricing-page.module.css";

export function PricingPage() {
  const api = useMemo(() => createBillingApi(), []);
  const { status } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.plans().then((items) => { if (active) setPlans(items); }).catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "套餐加载失败。"); });
    return () => { active = false; };
  }, [api]);

  const actionHref = status === "authenticated" ? "/billing" : "/login";

  return <><PublicHeader /><main id="main-content" className={styles.root}><div className={styles.container}>
    <section className={styles.hero}><div className={styles.eyebrow}>MINEWORKS MEMBERSHIP</div><h1>按工程深度选择合适的能力</h1><p>免费版保障基础工具可用；专业版面向个人高阶分析；团队版用于项目协同；企业版面向系统集成和私有部署。</p></section>
    <div className={styles.cycle}><Button variant={cycle === "monthly" ? "primary" : "secondary"} onClick={() => setCycle("monthly")}>按月</Button><Button variant={cycle === "annual" ? "primary" : "secondary"} onClick={() => setCycle("annual")}>按年</Button></div>
    {error ? <Alert tone="error" title="套餐信息加载失败">{error}。请确认FastAPI服务已经启动。</Alert> : null}
    {!plans.length && !error ? <div className={styles.grid}>{[1,2,3,4].map((item) => <LoadingSkeleton key={item} variant="card" />)}</div> : <section className={styles.grid}>{plans.map((plan) => <article key={plan.id} className={`${styles.card} ${plan.recommended ? styles.recommended : ""}`}>
      {plan.recommended ? <Badge className={styles.recommendBadge} tone="professional">推荐</Badge> : null}
      <span className={styles.tagline}>{plan.tagline}</span><h2>{plan.name}</h2><p className={styles.description}>{plan.description}</p>
      <div className={styles.price}>{formatPrice(cycle === "monthly" ? plan.monthly_price_fen : plan.annual_price_fen, cycle)}</div><div className={styles.priceNote}>{plan.price_note}</div>
      <ul className={styles.featureList}>{plan.features.slice(0, 7).map((feature) => <li key={feature}>{feature}</li>)}</ul>
      <div className={styles.quota}><strong>主要容量</strong><ul>{plan.quotas.slice(0, 4).map((quota) => <li key={quota.metric}>{quota.label}：{quota.limit === null ? "不限" : quota.limit}</li>)}</ul></div>
      <div className={styles.action}>{plan.id === "free" ? <Link href="/tools"><Button fullWidth variant="secondary">使用免费工具</Button></Link> : plan.id === "enterprise" ? <Button fullWidth variant="secondary" disabled>企业方案洽谈入口待接入</Button> : <Link href={actionHref}><Button fullWidth variant={plan.recommended ? "primary" : "secondary"}>{status === "authenticated" ? "进入订阅中心" : "登录后开通"}</Button></Link>}</div>
    </article>)}</section>}
    <Alert className={styles.notice} tone="warning" title="商业化边界">当前价格和支付流程仅用于本地产品功能验证，不构成正式报价。公网收费前必须完成支付机构接入、订单签名、退款规则、发票、财务对账、用户协议和隐私政策。</Alert>
    <section className={styles.comparison}><h2>套餐定位</h2><div className={styles.comparisonGrid}><article><strong>个人专业版</strong><p>重点解决高级计算、批量分析和正式办公文档导出，不开放多人协作。</p></article><article><strong>团队版</strong><p>面向设计院、矿山项目组和自动化团队，包含成员、项目、共享模板与审计。</p></article><article><strong>企业版</strong><p>面向私有部署、开放API、统一身份认证和定制技术服务。</p></article></div></section>
  </div></main></>;
}
