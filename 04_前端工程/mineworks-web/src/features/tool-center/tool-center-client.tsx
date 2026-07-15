"use client";

import { useMemo } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Bookmark, Crown, History, Layers3, SearchX, ShieldCheck, Sparkles } from "lucide-react";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  CategoryNavigation,
  EmptyState,
  FilterBar,
  Panel,
  ToolCard,
  useToast,
} from "@/components";
import { hasPlanAccess, maxPlan, planLabels } from "@/lib/permissions/plan";
import { useAuth } from "@/features/auth/auth-provider";
import type { AccessLevel, ToolStatus } from "@/types/status";
import { TOOL_CATALOG, TOOL_CATEGORY_LABELS, TOOL_DISCIPLINES, getToolById } from "./tool-data";
import { countByDiscipline, filterAndSortTools, parseToolQuery, serializeToolQuery } from "./tool-query";
import { useToolPreferences } from "./tool-preferences";
import { DisciplineIcon, ToolIcon } from "./tool-icon";
import type { ToolCategory, ToolCenterQueryState, ToolDiscipline } from "./types";
import styles from "./tool-center.module.css";

const accessLabels: Record<AccessLevel, string> = { free: "免费", professional: "专业会员", team: "团队", enterprise: "企业" };
const statusLabels: Record<ToolStatus, string> = { DRAFT: "草稿", REVIEWING: "技术审核中", VALIDATED: "已验证", TEACHING: "教学示例", DEPRECATED: "即将停用", DISABLED: "已停用" };

export function ToolCenterClient() {
  const router = useRouter();
  const { status: authStatus, identity } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(() => parseToolQuery(searchParams), [searchParams]);
  const activeTeam = identity?.teams.find((team) => team.id === identity.active_team_id);
  const currentPlan = maxPlan(identity?.user.plan ?? "guest", activeTeam?.plan ?? "guest");
  const { favorites, recent, isReady, toggleFavorite, recordRecent } = useToolPreferences();
  const { toast } = useToast();
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const counts = useMemo(() => countByDiscipline(TOOL_CATALOG), []);
  const tools = useMemo(() => filterAndSortTools(TOOL_CATALOG, state, favoriteSet), [state, favoriteSet]);
  const recentTools = useMemo(() => recent.map(getToolById).filter((tool): tool is NonNullable<typeof tool> => Boolean(tool)).slice(0, 4), [recent]);

  const updateState = (patch: Partial<ToolCenterQueryState>) => {
    const query = serializeToolQuery({ ...state, ...patch });
    router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
  };

  const selected = {
    category: state.categories,
    access: state.accessLevels,
    status: state.statuses,
  };

  const openTool = (toolId: string, slug: string, availability: string) => {
    recordRecent(toolId);
    if (availability === "planned") {
      toast({ title: "该工具正在建设", description: "已打开功能说明页，可查看规划、权益和当前进度。", tone: "info" });
    }
    router.push(`/tools/${slug}` as Route);
  };

  const renderTool = (tool: (typeof TOOL_CATALOG)[number]) => {
    const locked = !hasPlanAccess(currentPlan, tool.accessLevel);
    return (
      <ToolCard
        key={tool.id}
        icon={<ToolIcon name={tool.icon} />}
        name={tool.name}
        description={tool.description}
        category={`${TOOL_DISCIPLINES.find((item) => item.id === tool.discipline)?.label ?? tool.discipline} / ${TOOL_CATEGORY_LABELS[tool.category]}`}
        accessLevel={tool.accessLevel}
        status={tool.status}
        isFavorite={favoriteSet.has(tool.id)}
        isLocked={locked}
        variant={state.view}
        version={tool.version}
        updatedAt={tool.updatedAt}
        availability={tool.availability}
        onFavoriteChange={() => {
          const active = toggleFavorite(tool.id);
          toast({ title: active ? "已收藏工具" : "已取消收藏", description: tool.name, tone: active ? "success" : "info" });
        }}
        onOpen={() => openTool(tool.id, tool.slug, tool.availability)}
      />
    );
  };

  const categoryItems = TOOL_DISCIPLINES.map((item) => ({
    ...item,
    count: counts[item.id],
    icon: <DisciplineIcon id={item.id} />,
  }));

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "工具中心" }]} />
          <div className={styles.eyebrow}>MINEWORKS TOOL CENTER</div>
          <h1>矿业工程在线工具中心</h1>
          <p>把选矿、采矿、自动化、电气、设备和土建的常用计算、分析与资料能力集中到一个可搜索、可收藏、可持续扩展的专业工作台。</p>
          <div className={styles.heroTags}><Badge tone="success">已验证工具 {TOOL_CATALOG.filter((tool) => tool.status === "VALIDATED").length}</Badge><Badge tone="brand">免费工具 {TOOL_CATALOG.filter((tool) => tool.accessLevel === "free").length}</Badge><Badge tone="professional">会员工具 {TOOL_CATALOG.filter((tool) => tool.accessLevel !== "free").length}</Badge></div>
        </div>
        <aside className={styles.planCard}>
          <span className={styles.planIcon}><Crown size={22} /></span>
          <div><small>当前访问身份</small><strong>{planLabels[currentPlan]}</strong><p>{authStatus === "authenticated" ? "当前权益由个人套餐与活动团队套餐共同决定。" : "基础计算可直接使用；登录后可查看用量、保存项目并开通高级能力。"}</p></div>
          <Button variant="secondary" size="sm" trailingIcon={<ArrowRight size={15} />} onClick={() => router.push((authStatus === "authenticated" ? "/billing" : "/pricing") as Route)}>{authStatus === "authenticated" ? "查看订阅与用量" : "查看会员权益"}</Button>
        </aside>
      </section>

      <section className={styles.metrics} aria-label="工具中心概览">
        <article><Layers3 /><div><strong>{TOOL_CATALOG.length}</strong><span>工具总数</span></div></article>
        <article><ShieldCheck /><div><strong>{TOOL_CATALOG.filter((tool) => tool.status === "VALIDATED").length}</strong><span>已验证</span></div></article>
        <article><Sparkles /><div><strong>{TOOL_CATALOG.filter((tool) => tool.featured).length}</strong><span>重点推荐</span></div></article>
        <article><Bookmark /><div><strong>{isReady ? favorites.length : "—"}</strong><span>我的收藏</span></div></article>
      </section>

      <Panel title="按专业浏览" subtitle="专业分类写入URL，可复制链接、前进后退并恢复当前选择。">
        <CategoryNavigation items={categoryItems} selectedId={state.discipline} onSelect={(id) => updateState({ discipline: id as ToolDiscipline })} />
      </Panel>

      <section className={styles.recentSection} aria-labelledby="recent-title">
        <div className={styles.sectionTitle}><div><History size={20} /><div><h2 id="recent-title">最近使用</h2><p>在本机浏览器保存最近8个工具，不上传项目参数。</p></div></div>{recentTools.length ? <Button variant="link" size="sm" onClick={() => updateState({ sort: "newest" })}>查看全部工具</Button> : null}</div>
        {recentTools.length ? <div className={styles.recentGrid}>{recentTools.map((tool) => <button key={tool.id} type="button" className={styles.recentItem} onClick={() => openTool(tool.id, tool.slug, tool.availability)}><span><ToolIcon name={tool.icon} size={18} /></span><div><strong>{tool.name}</strong><small>{TOOL_CATEGORY_LABELS[tool.category]} · {accessLabels[tool.accessLevel]}</small></div><ArrowRight size={16} /></button>)}</div> : <div className={styles.recentEmpty}>打开任一工具后，这里会显示最近使用记录。</div>}
      </section>

      <FilterBar
        query={state.query}
        onQueryChange={(query) => updateState({ query })}
        onSearch={(query) => updateState({ query })}
        searchPlaceholder="搜索工具名称、用途或关键词，例如：矿浆、PID、压降"
        groups={[
          { id: "category", label: "工具类型", options: Object.entries(TOOL_CATEGORY_LABELS).map(([value, label]) => ({ value, label, count: TOOL_CATALOG.filter((tool) => tool.category === value).length })) },
          { id: "access", label: "使用权益", options: Object.entries(accessLabels).map(([value, label]) => ({ value, label, count: TOOL_CATALOG.filter((tool) => tool.accessLevel === value).length })) },
          { id: "status", label: "工具状态", options: Object.entries(statusLabels).map(([value, label]) => ({ value, label, count: TOOL_CATALOG.filter((tool) => tool.status === value).length })) },
        ]}
        selected={selected}
        onSelectedChange={(groupId, values) => {
          if (groupId === "category") updateState({ categories: values as ToolCategory[] });
          if (groupId === "access") updateState({ accessLevels: values as AccessLevel[] });
          if (groupId === "status") updateState({ statuses: values as ToolStatus[] });
        }}
        sortOptions={[
          { value: "recommended", label: "推荐优先" },
          { value: "popular", label: "使用热度" },
          { value: "newest", label: "最近更新" },
          { value: "name", label: "名称排序" },
        ]}
        sortValue={state.sort}
        onSortChange={(sort) => updateState({ sort: sort as ToolCenterQueryState["sort"] })}
        view={state.view}
        onViewChange={(view) => updateState({ view })}
        resultCount={tools.length}
        onClear={() => updateState({ query: "", discipline: "all", categories: [], accessLevels: [], statuses: [], favoritesOnly: false })}
      />

      <div className={styles.resultHeader}>
        <div><h2>{state.discipline === "all" ? "全部工具" : TOOL_DISCIPLINES.find((item) => item.id === state.discipline)?.label}</h2><p>搜索、筛选、排序和视图均与URL同步。</p></div>
        <Button variant={state.favoritesOnly ? "secondary" : "tertiary"} size="sm" leadingIcon={<Bookmark size={15} />} onClick={() => updateState({ favoritesOnly: !state.favoritesOnly })}>仅看收藏{favorites.length ? ` (${favorites.length})` : ""}</Button>
      </div>

      {tools.length ? <div className={state.view === "card" ? styles.toolGrid : styles.toolList}>{tools.map(renderTool)}</div> : <EmptyState icon={<SearchX />} title="没有找到匹配工具" description="尝试清除部分筛选条件，或提交新的工具需求。" primaryAction={<Button variant="primary" onClick={() => router.replace(pathname as Route)}>清除全部筛选</Button>} secondaryAction={<Button variant="secondary">提交工具需求</Button>} />}

      <Alert tone="info" title="数据与权限边界" className={styles.boundary}>收藏和最近使用当前保存在浏览器本地；正式登录后将同步到用户账户。会员权限仍需由后端接口再次校验。</Alert>
    </>
  );
}
