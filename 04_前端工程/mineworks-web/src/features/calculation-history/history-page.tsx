"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, Database, FolderKanban, RefreshCw, Trash2 } from "lucide-react";
import { Alert, Badge, Button, EmptyState, EngineeringValue, LoadingSkeleton, Panel, SearchInput, Select, ValidityBadge, useToast } from "@/components";
import { createCalculationHistoryApi } from "./api";
import type { CalculationRecord, ProjectSummary } from "./types";
import styles from "./history-page.module.css";

const TOOL_OPTIONS = [
  { value: "", label: "全部工具" },
  { value: "dry-solids-rate", label: "干固体量计算" },
  { value: "slurry-density-conversion", label: "矿浆密度与浓度换算" },
];

const RESULT_LABELS: Record<string, string> = {
  slurry_mass_flow: "矿浆质量流量",
  dry_solids_rate: "干固体量",
  water_mass_flow: "水量",
  slurry_density: "矿浆密度",
  solids_mass_fraction: "固体质量浓度",
  solids_volume_fraction: "固体体积浓度",
  liquid_mass_fraction: "液相质量分数",
  liquid_volume_fraction: "液相体积分数",
};

function resultPreview(record: CalculationRecord) {
  const values = Object.entries(record.results).slice(0, 3) as Array<[string, { value?: number; unit?: string; precision?: number }]>;
  return values.filter(([, value]) => typeof value?.value === "number");
}

export function HistoryPage() {
  const api = useMemo(() => createCalculationHistoryApi(), []);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [records, setRecords] = useState<CalculationRecord[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [toolId, setToolId] = useState("");
  const [projectId, setProjectId] = useState(() => searchParams.get("project_id") ?? "");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [nextRecords, nextProjects] = await Promise.all([
        api.listRecords({ toolId: toolId || undefined, projectId: projectId || undefined, query: query || undefined }),
        api.listProjects(),
      ]);
      setRecords(nextRecords); setProjects(nextProjects);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "计算历史读取失败。");
    } finally { setLoading(false); }
  }, [api, projectId, query, toolId]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);


  const assignProject = async (record: CalculationRecord, nextProjectId: string) => {
    try {
      const updated = await api.updateRecord(record.id, nextProjectId ? { project_id: nextProjectId } : { clear_project: true });
      setRecords((items) => items.map((item) => item.id === updated.id ? updated : item));
      toast({ title: nextProjectId ? "已转入项目" : "已取消项目关联", description: updated.project?.name, tone: "success" });
    } catch (reason) {
      toast({ title: "项目关联更新失败", description: reason instanceof Error ? reason.message : "请重试。", tone: "error" });
    }
  };

  const deleteRecord = async (record: CalculationRecord) => {
    if (!window.confirm(`确认删除“${record.title}”吗？`)) return;
    try { await api.deleteRecord(record.id); setRecords((items) => items.filter((item) => item.id !== record.id)); toast({ title: "计算记录已删除", tone: "success" }); }
    catch (reason) { toast({ title: "删除失败", description: reason instanceof Error ? reason.message : "请重试。", tone: "error" }); }
  };

  return <div className={styles.root}>
    <section className={styles.hero}><div><span>UNIFIED CALCULATION HISTORY</span><h1>统一计算历史</h1><p>集中管理不同工程工具的输入、结果、有效性、公式版本和项目归属，并将可靠结果复用到其他工具。</p></div><div className={styles.heroActions}><Link href="/projects"><Button variant="secondary" leadingIcon={<FolderKanban size={16} />}>项目工作台</Button></Link><Button variant="primary" leadingIcon={<RefreshCw size={16} />} onClick={() => void load()}>刷新记录</Button></div></section>

    <Panel>
      <div className={styles.filters}>
        <SearchInput value={query} onValueChange={setQuery} onSearch={() => void load()} placeholder="搜索记录标题、工具或备注" />
        <Select aria-label="按工具筛选" value={toolId} onChange={(event) => setToolId(event.target.value)} options={TOOL_OPTIONS} />
        <Select aria-label="按项目筛选" value={projectId} onChange={(event) => setProjectId(event.target.value)} options={[{ value: "", label: "全部项目与独立记录" }, ...projects.map((project) => ({ value: project.id, label: project.name }))]} />
      </div>
      <div className={styles.summary}><strong>{records.length}</strong><span>条统一计算记录</span><span>·</span><span>{records.filter((item) => item.project_id).length}条已关联项目</span></div>
    </Panel>

    {error ? <Alert tone="error" title="历史服务不可用">{error} 请确认FastAPI服务已启动。</Alert> : null}
    {loading ? <div className={styles.grid}><LoadingSkeleton variant="card" /><LoadingSkeleton variant="card" /><LoadingSkeleton variant="card" /></div> : null}
    {!loading && records.length === 0 ? <Panel><EmptyState icon={<Database />} title="尚无统一计算记录" description="在正式工具中完成计算后，点击“保存”即可进入统一历史或指定项目。" primaryAction={<Link href="/tools"><Button variant="primary">打开工具中心</Button></Link>} /></Panel> : null}
    {!loading && records.length ? <div className={styles.grid}>{records.map((record) => <article key={record.id} className={styles.card}>
      <div className={styles.cardHeader}><div><div className={styles.badges}><Badge tone="brand">{record.tool_name}</Badge>{record.project ? <Badge tone="team">{record.project.name}</Badge> : <Badge tone="neutral">独立记录</Badge>}</div><h2>{record.title}</h2><p>{new Date(record.saved_at).toLocaleString("zh-CN")} · 公式 {record.formula_version}</p></div><ValidityBadge validity={record.validity as "VALID" | "CAUTION" | "INVALID" | "INCONSISTENT" | "STALE" | "MISSING" | "NOT_CALCULATED"} /></div>
      <div className={styles.metrics}>{resultPreview(record).map(([key, value]) => <div key={key}><span>{RESULT_LABELS[key] ?? key.replaceAll("_", " ")}</span><EngineeringValue value={value.value ?? null} unit={value.unit ?? ""} precision={value.precision ?? 2} emphasize /></div>)}</div>
      {record.note ? <p className={styles.note}>{record.note}</p> : null}
      <div className={styles.reuse}><strong>结果复用</strong><div>
        <Link href={{ pathname: "/tools/dry-solids-rate", query: { reuse_record: record.id } }}><Button size="sm" variant="secondary" leadingIcon={<ArrowRightLeft size={14} />}>载入干固体量</Button></Link>
        <Link href={{ pathname: "/tools/slurry-density-conversion", query: { reuse_record: record.id } }}><Button size="sm" variant="secondary" leadingIcon={<ArrowRightLeft size={14} />}>载入密度换算</Button></Link>
      </div></div>
      <div className={styles.projectAssign}><span>项目归属</span><Select aria-label={`设置${record.title}的项目归属`} value={record.project_id ?? ""} onChange={(event) => void assignProject(record, event.target.value)} options={[{ value: "", label: "独立记录" }, ...projects.map((project) => ({ value: project.id, label: project.name }))]} /></div>
      <div className={styles.cardFooter}><span>record_id：{record.id}</span><Button size="sm" variant="danger" leadingIcon={<Trash2 size={14} />} onClick={() => void deleteRecord(record)}>删除</Button></div>
    </article>)}</div> : null}
  </div>;
}
