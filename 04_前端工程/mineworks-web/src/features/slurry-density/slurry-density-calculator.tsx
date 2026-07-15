"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calculator, Copy, Database, FlaskConical, RotateCcw, Save } from "lucide-react";
import {
  Alert, Button, CalculationSteps, EmptyState, EngineeringValue, ErrorState, ExportMenu,
  LoadingSkeleton, Panel, RadioGroup, Tabs, UnitInput, ValidityBadge, useToast,
} from "@/components";
import { createSlurryDensityApiClient, SlurryDensityApiError, type SlurryDensityApiClient } from "./api";
import { downloadTextFile, formatSlurryDensityMarkdown, formatSlurryDensityText } from "./export";
import { initialSlurryDensityState, slurryDensityReducer } from "./state-machine";
import type { SlurryDensityField, SlurryDensityMode, SlurryDensityResponse } from "./types";
import { validateSlurryDensityInputs } from "./validation";
import { CalculationSaveModal } from "@/features/calculation-history/calculation-save-modal";
import { createCalculationHistoryApi } from "@/features/calculation-history/api";
import { buildSlurryDensityRecord } from "@/features/calculation-history/record-builders";
import { applyReuseToSlurryDensity } from "@/features/calculation-history/reuse";
import styles from "./slurry-density-calculator.module.css";

export type SlurryDensityCalculatorProps = { apiClient?: SlurryDensityApiClient; checkHealth?: boolean };

const modeOptions = [
  { value: "from_mass_concentration", label: "已知质量浓度", description: "由Cw、固体密度和液相密度计算矿浆密度与体积浓度" },
  { value: "from_slurry_density", label: "已知矿浆密度", description: "由矿浆密度反算固体质量浓度和体积浓度" },
  { value: "from_volume_concentration", label: "已知体积浓度", description: "由Cv、固体密度和液相密度计算矿浆密度与质量浓度" },
];

function knownLabel(mode: SlurryDensityMode): string {
  return mode === "from_slurry_density" ? "已知矿浆密度" : mode === "from_mass_concentration" ? "已知固体质量浓度" : "已知固体体积浓度";
}
function contractPreview(): string {
  return JSON.stringify({ request: { tool_id: "slurry-density-conversion", formula_version: "1.0.0", mode: "from_mass_concentration", inputs: { solids_density: { value: 2.7, unit: "t/m3" }, liquid_density: { value: 1, unit: "t/m3" }, known_value: { value: 42, unit: "%" } } }, response: { request_id: "req_...", validity: "VALID | CAUTION | INVALID", results: { slurry_density: {}, solids_mass_fraction: {}, solids_volume_fraction: {} }, steps: [], warnings: [] } }, null, 2);
}

export function SlurryDensityCalculator({ apiClient, checkHealth = true }: SlurryDensityCalculatorProps) {
  const client = useMemo(() => apiClient ?? createSlurryDensityApiClient(), [apiClient]);
  const historyApi = useMemo(() => createCalculationHistoryApi(), []);
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(slurryDensityReducer, initialSlurryDensityState);
  const [serviceStatus, setServiceStatus] = useState<"checking" | "online" | "offline">(checkHealth ? "checking" : "online");
  const controllerRef = useRef<AbortController | null>(null);
  const reuseLoadedRef = useRef<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!checkHealth) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 3500);
    void client.health(controller.signal).then((online) => setServiceStatus(online ? "online" : "offline"));
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [checkHealth, client]);

  useEffect(() => {
    const recordId = searchParams.get("reuse_record");
    if (!recordId || reuseLoadedRef.current === recordId) return;
    reuseLoadedRef.current = recordId;
    void historyApi.getReusePackage(recordId, "slurry-density-conversion").then((pkg) => {
      const reused = applyReuseToSlurryDensity(initialSlurryDensityState.mode, initialSlurryDensityState.inputs, pkg);
      dispatch({ type: "LOAD_REUSE", mode: reused.mode, inputs: reused.inputs });
      toast({ title: "已载入历史结果", description: `来源：${pkg.source_tool_name}`, tone: pkg.warnings.length ? "warning" : "success" });
    }).catch((reason: unknown) => {
      toast({ title: "历史结果载入失败", description: reason instanceof Error ? reason.message : "请重试。", tone: "error" });
    });
  }, [historyApi, searchParams, toast]);

  const edit = (field: SlurryDensityField, value: { value: number | null; unit: string }) => dispatch({ type: "EDIT_INPUT", field, value });
  const calculate = async () => {
    dispatch({ type: "VALIDATING" });
    const validation = validateSlurryDensityInputs(state.mode, state.inputs);
    if (!validation.valid) { dispatch({ type: "VALIDATION_FAILED", errors: validation.errors, warnings: validation.warnings }); return; }
    dispatch({ type: "CALCULATING", warnings: validation.warnings });
    controllerRef.current?.abort();
    const controller = new AbortController(); controllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const result = await client.calculate(state.mode, state.inputs, controller.signal);
      dispatch({ type: "CALCULATED", result });
      setServiceStatus("online");
    } catch (error) {
      if (error instanceof SlurryDensityApiError) {
        dispatch({ type: "FAILED", failure: error.failure });
        if (error.failure.fieldErrors) dispatch({ type: "VALIDATION_FAILED", errors: error.failure.fieldErrors, warnings: [] });
        if (error.failure.code === "SERVICE_UNAVAILABLE") setServiceStatus("offline");
      } else dispatch({ type: "FAILED", failure: { code: "UNKNOWN_ERROR", message: "计算过程中发生未知错误。" } });
    } finally { window.clearTimeout(timeout); }
  };

  const copy = async () => {
    if (!state.result) return;
    await navigator.clipboard.writeText(formatSlurryDensityText(state.mode, state.result));
    toast({ title: "结果已复制", tone: "success" });
  };
  const save = () => {
    if (!state.result) return;
    setSaveOpen(true);
  };
  const exportResult = async (format: { id: string }) => {
    if (!state.result) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    if (format.id === "markdown") downloadTextFile(`矿浆密度与浓度换算_${stamp}.md`, formatSlurryDensityMarkdown(state.mode, state.inputs, state.result), "text/markdown;charset=utf-8");
    else if (format.id === "json") downloadTextFile(`矿浆密度与浓度换算_${stamp}.json`, JSON.stringify({ mode: state.mode, inputs: state.inputs, ...state.result }, null, 2), "application/json;charset=utf-8");
    else await copy();
    toast({ title: "导出已完成", description: format.id.toUpperCase(), tone: "success" });
  };

  const renderResult = (result: SlurryDensityResponse) => {
    const steps = result.steps.map((step) => ({ id: step.id, title: step.title, description: step.description, formula: step.formula, substitutedExpression: step.substituted_expression, result: { label: "步骤结果", ...step.result }, note: step.note, tone: "default" as const }));
    const primaryKey = state.mode === "from_mass_concentration" ? "slurry" : "mass";
    return <>
      <Panel>
        <div className={styles.resultHeader}><div><h3>换算结果</h3><p>{result.summary}</p></div><div className={styles.resultActions}><Button variant="secondary" size="sm" leadingIcon={<Copy size={15} />} onClick={() => void copy()}>复制</Button><Button variant="secondary" size="sm" leadingIcon={<Save size={15} />} onClick={save}>保存</Button><ExportMenu currentPlan="free" label="导出" formats={[{ id: "copy", label: "复制文本", description: "复制核心结果" }, { id: "markdown", label: "Markdown", description: "包含输入、结果和警告", extension: "md" }, { id: "json", label: "JSON数据", description: "结构化API结果", extension: "json" }]} onExport={exportResult} /></div></div>
        <div className={styles.metricGrid}>
          <div className={`${styles.metric} ${primaryKey === "slurry" ? styles.primary : ""}`}><span className={styles.metricLabel}>矿浆密度</span><div className={styles.metricValue}><EngineeringValue {...result.results.slurry_density} emphasize /></div><p className={styles.metricNote}>两相混合密度</p></div>
          <div className={`${styles.metric} ${primaryKey === "mass" ? styles.primary : ""}`}><span className={styles.metricLabel}>固体质量浓度</span><div className={styles.metricValue}><EngineeringValue {...result.results.solids_mass_fraction} emphasize /></div><p className={styles.metricNote}>固体质量 / 矿浆总质量</p></div>
          <div className={styles.metric}><span className={styles.metricLabel}>固体体积浓度</span><div className={styles.metricValue}><EngineeringValue {...result.results.solids_volume_fraction} emphasize /></div><p className={styles.metricNote}>固体体积 / 矿浆总体积</p></div>
        </div>
        <div className={styles.secondaryGrid}><div className={styles.secondaryMetric}><span>液相质量分数</span><EngineeringValue {...result.results.liquid_mass_fraction} emphasize /></div><div className={styles.secondaryMetric}><span>液相体积分数</span><EngineeringValue {...result.results.liquid_volume_fraction} emphasize /></div></div>
        <div className={styles.validityRow}><div><ValidityBadge validity={result.validity} /><small> request_id：{result.request_id}</small></div><span className={styles.phaseText}>公式 {result.formula_version} · {new Date(result.computed_at).toLocaleString("zh-CN")}</span></div>
      </Panel>
      {result.warnings.length ? <div className={styles.warningList}>{result.warnings.map((warning) => <Alert key={warning.code} tone="warning" title={warning.title}>{warning.message}</Alert>)}</div> : null}
      <Panel><Tabs variant="card" defaultValue="steps" items={[{ value: "steps", label: "计算过程", content: <CalculationSteps steps={steps} /> }, { value: "assumptions", label: "假设与边界", content: <ul className={styles.assumptions}>{result.assumptions.map((item) => <li key={item}>{item}</li>)}</ul> }, { value: "contract", label: "API数据", content: <pre className={styles.apiContract}>{JSON.stringify(result, null, 2)}</pre> }]} /></Panel>
    </>;
  };

  return <div className={styles.root}>
    <div className={styles.serviceBar}><div className={styles.serviceInfo}><span className={`${styles.serviceDot} ${styles[serviceStatus]}`} /><div><strong>FastAPI计算服务：{serviceStatus === "checking" ? "检查中" : serviceStatus === "online" ? "在线" : "离线"}</strong><small>Next.js → FastAPI → mining_core，前端不执行正式公式。</small></div></div><span className={styles.phaseText}>页面状态：{state.phase.toUpperCase()}</span></div>
    {serviceStatus === "offline" ? <Alert tone="warning" title="后端服务未连接">请运行工程根目录的 <code>11_START_FASTAPI.cmd</code>，然后重新计算。你的输入不会丢失。</Alert> : null}
    <div className={styles.layout}>
      <Panel className={styles.inputPanel} title="输入参数" subtitle="选择一种已知量，API将计算完整的密度与浓度关系。">
        <div className={styles.inputStack}>
          <div className={styles.sourceRow}><span>数据来源</span><strong>{state.inputSource === "example" ? "教学示例" : state.inputSource === "reused" ? "历史结果复用" : "手动输入"}</strong></div>
          {state.inputSource === "example" ? <Alert tone="info" title="教学示例数据">当前参数仅用于演示换算流程，不代表实际项目工况。</Alert> : null}{state.inputSource === "reused" ? <Alert tone="info" title="已复用统一历史记录">请核对固体密度和液相密度，再执行换算。</Alert> : null}
          <div className={styles.modeBlock}><RadioGroup label="计算模式" value={state.mode} options={modeOptions} orientation="vertical" variant="card" onValueChange={(value) => dispatch({ type: "CHANGE_MODE", mode: value as SlurryDensityMode })} /></div>
          <UnitInput label="固体密度" quantity="density" value={state.inputs.solidsDensity} onChange={(value) => edit("solidsDensity", value)} required min={0} helpText="建议采用试验或可靠矿物组成数据。" errorText={state.fieldErrors.solidsDensity} />
          <UnitInput label="液相密度" quantity="density" value={state.inputs.liquidDensity} onChange={(value) => edit("liquidDensity", value)} required min={0} helpText="清水可近似取1.0 t/m³；溶液应采用实际密度。" errorText={state.fieldErrors.liquidDensity} />
          <UnitInput key={state.mode} label={knownLabel(state.mode)} quantity={state.mode === "from_slurry_density" ? "density" : "concentration"} value={state.inputs.knownValue} onChange={(value) => edit("knownValue", value)} required min={0} helpText={state.mode === "from_slurry_density" ? "矿浆密度必须位于液相密度和固体密度之间。" : "支持%和fraction；0是有效输入。"} errorText={state.fieldErrors.knownValue} />
          {state.localWarnings.map((warning) => <Alert key={warning.code} tone="warning" title={warning.title} compact>{warning.message}</Alert>)}
          <div className={styles.buttonRow}><Button variant="primary" leadingIcon={<Calculator size={17} />} isLoading={state.phase === "calculating" || state.phase === "validating"} onClick={() => void calculate()}>开始换算</Button><Button variant="secondary" leadingIcon={<FlaskConical size={16} />} onClick={() => dispatch({ type: "LOAD_EXAMPLE" })}>载入示例</Button><Button variant="ghost" leadingIcon={<RotateCcw size={16} />} onClick={() => dispatch({ type: "RESET" })}>重置</Button></div>
        </div>
      </Panel>
      <div className={styles.resultColumn} aria-live="polite">
        {state.dirty && state.result ? <div className={styles.dirtyBanner}>输入或计算模式已修改，当前显示的仍是上一次结果。请重新计算。</div> : null}
        {(state.phase === "initial" || (state.phase === "editing" && !state.result)) ? <Panel><div className={styles.placeholder}><EmptyState title="选择模式并输入参数" description="系统将返回矿浆密度、质量浓度、体积浓度、两相闭合、工程提示和request_id。" icon={<Database />} primaryAction={<Button variant="primary" onClick={() => dispatch({ type: "LOAD_EXAMPLE" })}>载入教学示例</Button>} /></div></Panel> : null}
        {(state.phase === "validating" || state.phase === "calculating") ? <Panel title={state.phase === "validating" ? "正在校验输入" : "正在调用换算服务"} subtitle="旧结果会保留，计算完成后再替换。"><div className={styles.skeletonStack}><div className={styles.skeletonGrid}><LoadingSkeleton variant="metric" /><LoadingSkeleton variant="metric" /><LoadingSkeleton variant="metric" /></div><LoadingSkeleton variant="text" lines={4} /></div></Panel> : null}
        {state.phase === "failed" && state.failure ? <ErrorState kind={state.failure.code === "SERVICE_UNAVAILABLE" ? "network" : "calculation"} title="换算未完成" description={state.failure.message} requestId={state.failure.requestId} primaryAction={<Button variant="primary" onClick={() => void calculate()}>重新计算</Button>} secondaryAction={<Button variant="secondary" onClick={() => dispatch({ type: "RESET" })}>重置输入</Button>} /> : null}
        {state.result ? renderResult(state.result) : null}
        {!state.result ? <Panel title="API数据契约" subtitle="三种计算模式共享同一请求与响应结构。"><pre className={styles.apiContract}>{contractPreview()}</pre></Panel> : null}
      </div>
    </div>
    {state.result ? <CalculationSaveModal key={state.result.request_id} open={saveOpen} onOpenChange={setSaveOpen} record={buildSlurryDensityRecord(state.mode, state.inputs, state.result)} onSaved={(saved) => toast({ title: "已保存到统一计算历史", description: saved.project ? `项目：${saved.project.name}` : `记录编号：${saved.id}`, tone: "success" })} /> : null}
  </div>;
}
