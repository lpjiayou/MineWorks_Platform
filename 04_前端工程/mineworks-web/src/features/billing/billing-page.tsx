"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Field, LoadingSkeleton, PublicHeader, useToast } from "@/components";
import { AuthGuard } from "@/features/auth/auth-guard";
import { useAuth } from "@/features/auth/auth-provider";
import type { AccessPlan } from "@/features/auth/types";
import { createBillingApi } from "./api";
import { formatPrice, quotaText } from "./format";
import type { BillingCycle, BillingOrder, BillingSubject, EntitlementSnapshot, PlanDefinition, Subscription } from "./types";
import styles from "./billing-page.module.css";

const PLAN_LABEL: Record<AccessPlan, string> = { free: "免费版", professional: "专业版", team: "团队版", enterprise: "企业版" };
const ORDER_LABEL: Record<BillingOrder["status"], string> = { pending: "待支付", paid: "已支付", cancelled: "已取消", failed: "失败" };

function BillingContent() {
  const api = useMemo(() => createBillingApi(), []);
  const { identity, refresh: refreshIdentity } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [snapshot, setSnapshot] = useState<EntitlementSnapshot | null>(null);
  const [orders, setOrders] = useState<BillingOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subjectType, setSubjectType] = useState<BillingSubject>("user");
  const [targetPlan, setTargetPlan] = useState<AccessPlan>("professional");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const activeTeam = identity?.teams.find((team) => team.id === identity.active_team_id);
  const canManageTeamBilling = activeTeam?.role === "owner" || activeTeam?.role === "admin";

  const load = useCallback(async () => {
    setError("");
    try {
      const [nextPlans, nextSnapshot, nextOrders, nextSubscriptions] = await Promise.all([
        api.plans(), api.entitlements(), api.orders(), api.subscriptions(),
      ]);
      setPlans(nextPlans); setSnapshot(nextSnapshot); setOrders(nextOrders); setSubscriptions(nextSubscriptions);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "订阅数据加载失败。");
    }
  }, [api]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const changeSubjectType = (next: BillingSubject) => {
    setSubjectType(next);
    setTargetPlan(next === "team" ? "team" : "professional");
  };

  const createOrder = async () => {
    setBusy(true); setError("");
    try {
      const order = await api.createCheckoutIntent({ subject_type: subjectType, target_plan: targetPlan, billing_cycle: cycle });
      setOrders((current) => [order, ...current]);
      toast({ title: "本地演示订单已创建", description: `订单 ${order.id}`, tone: "success" });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "订单创建失败。"); }
    finally { setBusy(false); }
  };

  const simulatePaid = async (orderId: string) => {
    setBusy(true); setError("");
    try {
      await api.simulatePaid(orderId);
      await refreshIdentity();
      await load();
      toast({ title: "本地支付模拟完成", description: "套餐和服务端权益已经更新。", tone: "success" });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "支付模拟失败。"); }
    finally { setBusy(false); }
  };

  const selectedPlan = plans.find((item) => item.id === targetPlan);
  return <><PublicHeader /><main id="main-content" className={styles.root}><div className={styles.container}>
    <section className={styles.hero}><div><span>ENTITLEMENTS & BILLING</span><h1>订阅、权益与使用配额</h1><p>服务端统一判断当前套餐、可用功能和容量，不依赖前端按钮是否显示。</p></div><aside className={styles.planBadge}><small>当前有效套餐</small><strong>{snapshot ? PLAN_LABEL[snapshot.effective_plan] : "加载中"}</strong><Badge tone={snapshot?.plan_source === "team" ? "team" : snapshot?.effective_plan === "professional" ? "professional" : "brand"}>{snapshot?.plan_source === "team" ? "团队权益" : snapshot?.plan_source === "user" ? "个人权益" : "基础权益"}</Badge></aside></section>
    {error ? <Alert className={styles.notice} tone="error" title="订阅操作失败">{error}</Alert> : null}
    <div className={styles.grid}>
      <section className={styles.section}><h2>用量与容量</h2><p>月度配额按UTC自然月统计；项目、记录和成员为当前总量。</p>{!snapshot ? <LoadingSkeleton variant="table" /> : <div className={styles.quotaList}>{snapshot.quotas.map((quota) => <article key={quota.metric} className={styles.quota}><div className={styles.quotaHead}><strong>{quota.label}</strong><span>{quotaText(quota.used, quota.limit)}</span></div><div className={styles.bar}><i style={{ width: `${quota.percentage ?? Math.min(quota.used > 0 ? 18 : 0, 100)}%` }} /></div></article>)}</div>}</section>
      <section className={styles.section}><h2>当前功能权益</h2><p>以下为服务端返回的功能代码，后续高阶工具将直接使用这些代码进行授权。</p>{!snapshot ? <LoadingSkeleton variant="card" /> : <div className={styles.featureGrid}>{snapshot.features.map((feature) => <Badge key={feature} tone="brand">{feature}</Badge>)}</div>}</section>
      <section className={styles.section}><h2>创建本地演示订单</h2><p>该流程仅验证订单、订阅、套餐升级和权限刷新，不连接真实支付机构。</p><div className={styles.form}>
        <div className={styles.choice}><button type="button" className={subjectType === "user" ? styles.active : ""} onClick={() => changeSubjectType("user")}><strong>个人订阅</strong><small>开通专业版</small></button><button type="button" disabled={!canManageTeamBilling} className={subjectType === "team" ? styles.active : ""} onClick={() => changeSubjectType("team")}><strong>团队订阅</strong><small>{canManageTeamBilling ? "开通团队版" : "仅所有者/管理员可操作"}</small></button></div>
        <Field label="目标套餐"><select className={styles.select} value={targetPlan} onChange={(event) => setTargetPlan(event.target.value as AccessPlan)}>{subjectType === "user" ? <option value="professional">专业版</option> : <><option value="team">团队版</option><option value="enterprise">企业版（需人工报价）</option></>}</select></Field>
        <Field label="计费周期"><select className={styles.select} value={cycle} onChange={(event) => setCycle(event.target.value as BillingCycle)}><option value="monthly">按月</option><option value="annual">按年</option></select></Field>
        <Alert tone="info" title="演示金额">{selectedPlan ? formatPrice(cycle === "monthly" ? selectedPlan.monthly_price_fen : selectedPlan.annual_price_fen, cycle) : "—"}。正式上线前必须重新确认定价。</Alert>
        <Button variant="primary" isLoading={busy} disabled={targetPlan === "enterprise"} onClick={() => void createOrder()}>创建演示订单</Button>
      </div></section>
      <section className={styles.section}><h2>有效订阅</h2><p>支付模拟完成后生成订阅记录，并同步更新用户或团队套餐。</p><div className={styles.subscriptionList}>{subscriptions.length ? subscriptions.map((item) => <article key={item.id} className={styles.subscription}><div><strong>{PLAN_LABEL[item.plan]} · {item.subject_type === "team" ? "团队" : "个人"}</strong><small>{item.billing_cycle === "monthly" ? "按月" : "按年"} · {item.provider}</small></div><Badge tone={item.status === "active" ? "success" : "neutral"}>{item.status}</Badge></article>) : <div className={styles.empty}>暂无订阅记录</div>}</div></section>
      <section className={`${styles.section} ${styles.full}`}><h2>订单记录</h2><p>本地开发环境可对待支付订单执行“模拟支付成功”。企业版订单必须进入人工报价流程。</p><div className={styles.orderList}>{orders.length ? orders.map((order) => <article key={order.id} className={styles.order}><div><strong>{PLAN_LABEL[order.target_plan]} · {order.subject_type === "team" ? "团队" : "个人"}</strong><small>{order.id} · {new Date(order.created_at).toLocaleString("zh-CN")}</small></div><div className={styles.orderMeta}><Badge tone={order.status === "paid" ? "success" : order.status === "pending" ? "warning" : "neutral"}>{ORDER_LABEL[order.status]}</Badge><small>{formatPrice(order.amount_fen, order.billing_cycle)}</small>{order.status === "pending" && order.target_plan !== "enterprise" ? <Button size="sm" variant="secondary" isLoading={busy} onClick={() => void simulatePaid(order.id)}>模拟支付成功</Button> : null}</div></article>) : <div className={styles.empty}>暂无订单</div>}</div></section>
    </div>
    <Alert className={styles.notice} tone="warning" title="尚未接入真实支付">当前版本不处理银行卡、微信支付、支付宝、退款、发票和自动续费。任何公网收费前都必须接入受监管支付服务，并完成签名校验、回调幂等、财务对账和合同条款。</Alert>
  </div></main></>;
}

export function BillingPage() { return <AuthGuard><BillingContent /></AuthGuard>; }
