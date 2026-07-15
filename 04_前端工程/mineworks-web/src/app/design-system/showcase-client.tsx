"use client";

import { useMemo, useState } from "react";
import { Calculator, FileSpreadsheet, Gauge, SearchX, Save, Workflow } from "lucide-react";
import {
  Accordion,
  Alert,
  Breadcrumb,
  Button,
  CalculationSteps,
  Card,
  Checkbox,
  EmptyState,
  EngineeringValue,
  ErrorState,
  ExportMenu,
  Field,
  FilterBar,
  FormulaBlock,
  LoadingSkeleton,
  Modal,
  Panel,
  PermissionGate,
  ProjectPicker,
  RadioGroup,
  SearchInput,
  Select,
  Switch,
  Tabs,
  ToolCard,
  UnitInput,
  ValidityBadge,
  useToast,
} from "@/components";
import type { UnitValue } from "@/lib/units/types";
import { normalizeUnit } from "@/lib/units/convert";
import styles from "./page.module.css";

const dataSourceOptions = [
  { value: "manual", label: "手动输入" },
  { value: "project", label: "当前项目参数" },
  { value: "live", label: "在线仪表数据" },
];

const demoProjects = [
  { id: "gold", name: "某金矿选矿自动化项目", description: "浸出、CIL与解吸电积", updatedAt: "2026-07-14", access: "owner" as const },
  { id: "copper", name: "铜矿磨浮扩建项目", description: "磨矿分级与浮选物料平衡", updatedAt: "2026-07-12", access: "team" as const },
  { id: "archive", name: "历史试验项目", status: "archived" as const },
];

const filterGroups = [
  { id: "discipline", label: "专业方向", options: [{ value: "mineral", label: "选矿", count: 26 }, { value: "mining", label: "采矿", count: 14 }, { value: "automation", label: "自动化", count: 19 }] },
  { id: "access", label: "使用权限", options: [{ value: "free", label: "免费", count: 18 }, { value: "professional", label: "专业会员", count: 12 }, { value: "team", label: "团队/企业", count: 7 }] },
];

export function ShowcaseClient() {
  const [flow, setFlow] = useState<UnitValue>({ value: 118.37, unit: "m3/h" });
  const [density, setDensity] = useState<UnitValue>({ value: 1.38, unit: "t/m3" });
  const [concentration, setConcentration] = useState<UnitValue>({ value: 42, unit: "%" });
  const [dataSource, setDataSource] = useState("manual");
  const [showSteps, setShowSteps] = useState(true);
  const [autoCalculate, setAutoCalculate] = useState(false);
  const [saveMode, setSaveMode] = useState("current");
  const [modalOpen, setModalOpen] = useState(false);
  const [toolQuery, setToolQuery] = useState("");
  const [showBoundaryAlert, setShowBoundaryAlert] = useState(true);
  const [selectedProject, setSelectedProject] = useState("gold");
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({ discipline: ["mineral"], access: [] });
  const [sortValue, setSortValue] = useState("recommended");
  const [filterView, setFilterView] = useState<"card" | "list">("card");
  const { toast } = useToast();

  const result = useMemo(() => {
    if (flow.value === null || density.value === null || concentration.value === null) return null;
    const q = normalizeUnit(flow.value, "volumeFlow", flow.unit);
    const rho = normalizeUnit(density.value, "density", density.unit);
    const cw = normalizeUnit(concentration.value, "concentration", concentration.unit);
    return { mass: q * rho, dry: q * rho * cw, water: q * rho * (1 - cw) };
  }, [flow, density, concentration]);

  const tabItems = [
    {
      value: "steps",
      label: "计算过程",
      content: showSteps
        ? "Qm = Qv × ρm；Qs = Qm × Cw。正式版本由后端返回公式版本、代入值和中间结果。"
        : "计算过程显示已关闭。",
    },
    {
      value: "warnings",
      label: "诊断与警告",
      content: density.value !== null && normalizeUnit(density.value, "density", density.unit) > 3.5
        ? "矿浆密度超出典型工程范围，请确认介质和单位。"
        : "当前没有需要提示的工程异常。",
    },
    {
      value: "json",
      label: "结构化结果",
      content: <code>{JSON.stringify({ validity: result ? "VALID" : "NOT_CALCULATED", dataSource })}</code>,
    },
  ];

  const stateItems = [
    {
      value: "empty",
      label: "空状态",
      content: (
        <EmptyState
          size="sm"
          icon={<SearchX />}
          title={toolQuery ? "没有找到匹配工具" : "等待搜索工具"}
          description={toolQuery ? `没有找到“${toolQuery}”，请修改关键词。` : "输入工具、设备或资料名称。"}
          primaryAction={toolQuery ? <Button onClick={() => setToolQuery("")}>清除搜索</Button> : undefined}
        />
      ),
    },
    {
      value: "loading",
      label: "加载状态",
      content: <LoadingSkeleton variant="table" rows={3} label="工具检索结果加载中" />,
    },
    {
      value: "error",
      label: "错误恢复",
      content: (
        <ErrorState
          compact
          kind="network"
          title="计算服务暂时不可用"
          description="输入、单位和上一次结果均已保留。请稍后重试。"
          requestId="req_demo_20260714"
          primaryAction={<Button variant="danger" onClick={() => toast({ title: "正在重新连接", tone: "info" })}>重新尝试</Button>}
        />
      ),
    },
  ];

  const calculationSteps = [
    {
      id: "mass",
      title: "计算矿浆质量流量",
      description: "体积流量换算为质量流量",
      formula: "Qm = Qv × ρm",
      substitutedExpression: `Qm = ${(result?.mass ?? 0) === 0 ? "0.00" : "118.37 × 1.38"} = ${(result?.mass ?? 0).toFixed(2)} t/h`,
      result: { label: "矿浆质量流量", value: result?.mass ?? null, unit: "t/h", precision: 2 },
    },
    {
      id: "dry",
      title: "计算干固体量",
      description: "按固体质量分数计算",
      formula: "Qs = Qm × Cw",
      substitutedExpression: `Qs = ${(result?.mass ?? 0).toFixed(2)} × 0.42 = ${(result?.dry ?? 0).toFixed(2)} t/h`,
      result: { label: "干固体量", value: result?.dry ?? null, unit: "t/h", precision: 2 },
    },
    {
      id: "closure",
      title: "质量闭合检查",
      formula: "Qm = Qs + Qw",
      substitutedExpression: `${(result?.mass ?? 0).toFixed(2)} = ${(result?.dry ?? 0).toFixed(2)} + ${(result?.water ?? 0).toFixed(2)}`,
      note: "本示例闭合误差仅由显示小数位产生。正式版本应由mining_core返回校验结果。",
      tone: "info" as const,
    },
  ];

  const exportFormats = [
    { id: "copy", label: "复制文本", description: "复制核心结果和单位" },
    { id: "markdown", label: "Markdown", extension: "md", description: "基础可追溯报告" },
    { id: "excel", label: "Excel", extension: "xlsx", description: "结构化工程数据", requiredPlan: "professional" as const, icon: <FileSpreadsheet size={17} /> },
    { id: "word", label: "Word正式报告", extension: "docx", requiredPlan: "team" as const },
  ];

  return (
    <div className={styles.grid}>
      <div className={styles.sticky}>
        <Panel title="UnitInput 骨架" subtitle="前端演示计算，仅用于验证组件联动。">
          <div className={styles.stack}>
            <Field label="数据来源" htmlFor="data-source" required helpText="示例数据、项目数据和在线数据必须明确区分。">
              <Select id="data-source" options={dataSourceOptions} value={dataSource} onChange={(event) => setDataSource(event.target.value)} />
            </Field>
            <UnitInput label="矿浆体积流量" quantity="volumeFlow" value={flow} onChange={setFlow} required helpText="0为有效值；可切换m³/h和L/s。" />
            <UnitInput label="矿浆密度" quantity="density" value={density} onChange={setDensity} required warningText={density.value !== null && normalizeUnit(density.value, "density", density.unit) > 3.5 ? "超出典型工程范围，请复核。" : undefined} />
            <UnitInput label="固体质量浓度" quantity="concentration" value={concentration} onChange={setConcentration} required min={0} max={concentration.unit === "%" ? 100 : 1} />
            <div className={styles.selectionList}>
              <Checkbox label="显示计算过程" description="在结果区展开公式和中间值。" checked={showSteps} onChange={(event) => setShowSteps(event.target.checked)} />
              <Switch label="实时计算" description="当前只演示开关状态，不自动请求后端。" checked={autoCalculate} onCheckedChange={setAutoCalculate} />
            </div>
            <div className={styles.buttons}>
              <Button variant="primary" onClick={() => toast({ title: "计算完成", description: "当前结果由前端演示逻辑生成。", tone: "success" })}>开始计算</Button>
              <Button onClick={() => { setFlow({ value: 0, unit: "m3/h" }); setDensity({ value: 1.38, unit: "t/m3" }); setConcentration({ value: 42, unit: "%" }); }}>验证0值</Button>
            </div>
          </div>
        </Panel>
      </div>

      <div className={styles.stack}>
        <Breadcrumb items={[{ label: "工程首页", href: "/" }, { label: "设计系统", href: "/design-system" }, { label: "P0领域组件第三批" }]} />

        <Panel title="EngineeringValue 与 ValidityBadge" subtitle="0、null、单位和有效性使用统一组件。">
          <div className={styles.metrics}>
            <div className={styles.result}><label>干固体量</label><EngineeringValue value={result?.dry ?? null} unit="t/h" emphasize /><p>核心结果</p></div>
            <div className={styles.metric}><label>矿浆质量流量</label><EngineeringValue value={result?.mass ?? null} unit="t/h" /></div>
            <div className={styles.metric}><label>水量</label><EngineeringValue value={result?.water ?? null} unit="t/h" /></div>
          </div>
          <div style={{ marginTop: 14 }}><ValidityBadge validity={result ? "VALID" : "NOT_CALCULATED"} /></div>
        </Panel>

        {showBoundaryAlert ? <Alert tone="info" title="工程边界" onDismiss={() => setShowBoundaryAlert(false)}>当前页面的简易计算仅用来验证UI骨架。生产版本必须把公式迁移到 FastAPI 与 mining_core。</Alert> : null}

        <Panel title="P0 交互组件第一批" subtitle="Select、Checkbox、RadioGroup、Switch、Tabs、Modal和Toast已经接入真实页面。">
          <div className={styles.interactionGrid}>
            <Card>
              <RadioGroup label="保存位置" value={saveMode} onValueChange={setSaveMode} variant="card" options={[{ value: "current", label: "当前项目", description: "保存到某金矿选矿改造项目。" }, { value: "standalone", label: "独立记录", description: "暂不关联项目。" }]} />
              <div className={styles.cardActions}><Button variant="secondary" leadingIcon={<Save size={17} />} onClick={() => setModalOpen(true)}>打开保存Modal</Button><Button onClick={() => toast({ title: "结果已复制", tone: "success" })}>触发Toast</Button></div>
            </Card>
            <Card><Tabs items={tabItems} defaultValue="steps" variant="card" /></Card>
          </div>
        </Panel>

        <Panel title="P0 页面状态组件第二批" subtitle="Field、SearchInput、Alert、Accordion、EmptyState、LoadingSkeleton和ErrorState。">
          <div className={styles.batchTwoGrid}>
            <Card>
              <Field label="工具搜索" htmlFor="tool-search" helpText="支持Enter搜索、Esc清空和可访问状态播报。">
                <SearchInput id="tool-search" value={toolQuery} onValueChange={setToolQuery} onSearch={(query) => toast({ title: query ? `正在搜索：${query}` : "请输入搜索关键词", tone: query ? "info" : "warning" })} placeholder="搜索工具、设备或资料" shortcutHint="Ctrl K" statusText={toolQuery ? `当前关键词：${toolQuery}` : "尚未输入关键词"} />
              </Field>
              <div className={styles.accordionWrap}><Accordion defaultValue={["scope"]} items={[{ value: "scope", label: "适用范围", content: "适用于磨矿、浮选、浓密和浸出等连续矿浆物流。" }, { value: "source", label: "数据来源", content: "支持手动、项目、导入和在线数据，并保留来源状态。" }, { value: "version", label: "组件版本", content: "MineWorks UI P0 Batch 3 / V0.4。" }]} /></div>
            </Card>
            <Card><Tabs items={stateItems} defaultValue="empty" variant="segmented" /></Card>
          </div>
        </Panel>

        <Panel title="P0 领域组件第三批" subtitle="公式、步骤、权限、项目、导出、面包屑和工具中心筛选形成完整领域交互。">
          <div className={styles.batchThreeStack}>
            <FilterBar
              query={filterQuery}
              onQueryChange={setFilterQuery}
              onSearch={(query) => toast({ title: query ? `筛选关键词：${query}` : "请输入筛选关键词", tone: "info" })}
              groups={filterGroups}
              selected={selectedFilters}
              onSelectedChange={(groupId, values) => setSelectedFilters((current) => ({ ...current, [groupId]: values }))}
              sortOptions={[{ value: "recommended", label: "推荐排序" }, { value: "updated", label: "最近更新" }, { value: "popular", label: "使用最多" }]}
              sortValue={sortValue}
              onSortChange={setSortValue}
              view={filterView}
              onViewChange={setFilterView}
              resultCount={26}
              onClear={() => toast({ title: "筛选条件已清除", tone: "success" })}
            />

            <div className={styles.batchThreeGrid}>
              <CalculationSteps steps={calculationSteps} />
              <Card>
                <ProjectPicker projects={demoProjects} value={selectedProject} onValueChange={setSelectedProject} onCreateProject={() => toast({ title: "新建项目入口", description: "正式版本将打开项目创建流程。", tone: "info" })} />
                <div className={styles.cardActions}>
                  <ExportMenu
                    formats={exportFormats}
                    currentPlan="free"
                    onExport={(format) => { toast({ title: `正在生成${format.label}`, description: "原型仅验证导出状态。", tone: "success" }); }}
                    onLockedFormat={(format) => toast({ title: `${format.label}需要升级套餐`, tone: "warning" })}
                    align="start"
                  />
                </div>
              </Card>
            </div>

            <div className={styles.batchThreeGrid}>
              <FormulaBlock title="干固体量核心公式" description="安全纯文本渲染，可复制并记录公式版本。" version="1.0.0" formula={"Qm = Qv × ρm\nQs = Qm × Cw\nQw = Qm × (1 - Cw)"} onCopy={() => toast({ title: "公式已复制", tone: "success" })} />
              <PermissionGate
                feature="批量物料平衡与正式Excel报告"
                requiredPlan="professional"
                currentPlan="free"
                description="专业会员可运行多工况计算、闭合误差诊断和正式报告导出。"
                preview={<div className={styles.permissionPreview}><strong>6个工况</strong><span>平均闭合误差 0.42%</span></div>}
                upgradeAction={<Button variant="primary" size="sm" onClick={() => toast({ title: "打开会员升级说明", tone: "info" })}>查看专业会员</Button>}
                alternativeAction={<Button size="sm">使用单工况免费版</Button>}
              >
                <div>已获得批量平衡权限。</div>
              </PermissionGate>
            </div>
          </div>
        </Panel>

        <Panel title="ToolCard 骨架" subtitle="免费、专业和审核状态采用同一数据结构。">
          <div className={styles.tools}>
            <ToolCard icon={<Calculator />} name="干固体量计算" description="基础浆体物流计算和工程快速复核。" category="选矿 / 浆体" accessLevel="free" status="VALIDATED" isFavorite />
            <ToolCard icon={<Workflow />} name="全流程物料与金属平衡" description="多节点固体、水量和金属闭合误差分析。" category="选矿 / 高级分析" accessLevel="professional" status="REVIEWING" />
          </div>
        </Panel>

        <Card><div className={styles.buttons}><Button variant="primary" leadingIcon={<Gauge size={17} />}>主按钮</Button><Button variant="secondary">次按钮</Button><Button variant="danger">危险按钮</Button><Button variant="link">文字按钮</Button></div></Card>
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="保存计算结果到项目" description="保存输入、结果、数据有效性、工具版本和数据来源。" footer={<><Button onClick={() => setModalOpen(false)}>取消</Button><Button variant="primary" onClick={() => { setModalOpen(false); toast({ title: "计算记录已保存", description: saveMode === "current" ? "已保存到当前项目。" : "已保存为独立记录。", tone: "success" }); }}>确认保存</Button></>}>
        <RadioGroup label="保存位置" value={saveMode} onValueChange={setSaveMode} options={[{ value: "current", label: "当前项目", description: "某金矿选矿改造项目" }, { value: "standalone", label: "独立记录", description: "不关联现有项目" }]} />
      </Modal>
    </div>
  );
}
