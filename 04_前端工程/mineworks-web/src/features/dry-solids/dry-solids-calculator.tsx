"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Calculator, Copy, Database, FlaskConical, RotateCcw, Save } from "lucide-react";
import {
  Alert,
  Button,
  CalculationSteps,
  EmptyState,
  EngineeringValue,
  ErrorState,
  ExportMenu,
  LoadingSkeleton,
  Panel,
  Tabs,
  UnitInput,
  ValidityBadge,
  useToast,
} from "@/components";
import { createDrySolidsApiClient, DrySolidsApiError, type DrySolidsApiClient } from "./api";
import { downloadTextFile, formatDrySolidsMarkdown, formatDrySolidsText } from "./export";
import { drySolidsReducer, initialDrySolidsState } from "./state-machine";
import type { DrySolidsField, DrySolidsResponse } from "./types";
import { validateDrySolidsInputs } from "./validation";
import { CalculationSaveModal } from "@/features/calculation-history/calculation-save-modal";
import { createCalculationHistoryApi } from "@/features/calculation-history/api";
import { buildDrySolidsRecord } from "@/features/calculation-history/record-builders";
import { applyReuseToDrySolids } from "@/features/calculation-history/reuse";
import styles from "./dry-solids-calculator.module.css";

export type DrySolidsCalculatorProps = {
  apiClient?: DrySolidsApiClient;
  checkHealth?: boolean;
};

function contractPreview(): string {
  return JSON.stringify({
    request: {
      tool_id: "dry-solids-rate",
      formula_version: "1.0.0",
      inputs: {
        slurry_volume_flow: { value: 118.37, unit: "m3/h" },
        slurry_density: { value: 1.38, unit: "t/m3" },
        solids_mass_fraction: { value: 42, unit: "%" },
      },
    },
    response: {
      request_id: "req_...",
      validity: "VALID | CAUTION | INVALID",
      results: { slurry_mass_flow: {}, dry_solids_rate: {}, water_mass_flow: {} },
      steps: [],
      warnings: [],
    },
  }, null, 2);
}

export function DrySolidsCalculator({ apiClient, checkHealth = true }: DrySolidsCalculatorProps) {
  const client = useMemo(() => apiClient ?? createDrySolidsApiClient(), [apiClient]);
  const historyApi = useMemo(() => createCalculationHistoryApi(), []);
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(drySolidsReducer, initialDrySolidsState);
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
    void historyApi.getReusePackage(recordId, "dry-solids-rate").then((pkg) => {
      dispatch({ type: "LOAD_REUSE", inputs: applyReuseToDrySolids(initialDrySolidsState.inputs, pkg) });
      toast({ title: "已载入历史结果", description: `来源：${pkg.source_tool_name}`, tone: pkg.warnings.length ? "warning" : "success" });
    }).catch((reason: unknown) => {
      toast({ title: "历史结果载入失败", description: reason instanceof Error ? reason.message : "请重试。", tone: "error" });
    });
  }, [historyApi, searchParams, toast]);

  const edit = (field: DrySolidsField, value: { value: number | null; unit: string }) => dispatch({ type: "EDIT_INPUT", field, value });

  const calculate = async () => {
    dispatch({ type: "VALIDATING" });
    const validation = validateDrySolidsInputs(state.inputs);
    if (!validation.valid) {
      dispatch({ type: "VALIDATION_FAILED", errors: validation.errors, warnings: validation.warnings });
      toast({ title: "请修正输入参数", description: "已定位到不能继续计算的字段。", tone: "error" });
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    dispatch({ type: "CALCULATING", warnings: validation.warnings });
    try {
      const result = await client.calculate(state.inputs, controller.signal);
      dispatch({ type: "CALCULATED", result });
      setServiceStatus("online");
      toast({ title: "计算完成", description: result.summary, tone: result.validity === "CAUTION" ? "warning" : "success" });
    } catch (error) {
      const failure = error instanceof DrySolidsApiError
        ? error.failure
        : { code: "CALCULATION_FAILED", message: "计算未完成，请重试。" };
      dispatch({ type: "FAILED", failure });
      if (failure.code === "SERVICE_UNAVAILABLE") setServiceStatus("offline");
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const save = () => {
    if (!state.result) return;
    setSaveOpen(true);
  };

  const copy = async () => {
    if (!state.result) return;
    await navigator.clipboard.writeText(formatDrySolidsText(state.result));
    toast({ title: "计算结果已复制", tone: "success" });
  };

  const exportResult = async (format: { id: string }) => {
    if (!state.result) return;
    const stamp = new Date().toISOString().slice(0, 10);
    if (format.id === "markdown") {
      downloadTextFile(`干固体量计算_${stamp}.md`, formatDrySolidsMarkdown(state.inputs, state.result), "text/markdown;charset=utf-8");
    } else if (format.id === "json") {
      downloadTextFile(`干固体量计算_${stamp}.json`, JSON.stringify({ inputs: state.inputs, ...state.result }, null, 2), "application/json;charset=utf-8");
    } else {
      await copy();
    }
    toast({ title: "导出已完成", description: format.id.toUpperCase(), tone: "success" });
  };

  const renderResult = (result: DrySolidsResponse) => {
    const steps = result.steps.map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      formula: step.formula,
      substitutedExpression: step.substituted_expression,
      result: { label: "步骤结果", ...step.result },
      note: step.note,
      tone: "default" as const,
    }));
    return (
      <>
        <Panel>
          <div className={styles.resultHeader}>
            <div><h3>计算结果</h3><p>{result.summary}</p></div>
            <div className={styles.resultActions}>
              <Button variant="secondary" size="sm" leadingIcon={<Copy size={15} />} onClick={() => void copy()}>复制</Button>
              <Button variant="secondary" size="sm" leadingIcon={<Save size={15} />} onClick={save}>保存</Button>
              <ExportMenu
                currentPlan="free"
                label="导出"
                formats={[
                  { id: "copy", label: "复制文本", description: "复制核心结果" },
                  { id: "markdown", label: "Markdown", description: "包含输入、结果和警告", extension: "md" },
                  { id: "json", label: "JSON数据", description: "结构化API结果", extension: "json" },
                ]}
                onExport={exportResult}
              />
            </div>
          </div>
          <div className={styles.metricGrid}>
            <div className={`${styles.metric} ${styles.primary}`}><span className={styles.metricLabel}>干固体量</span><div className={styles.metricValue}><EngineeringValue {...result.results.dry_solids_rate} emphasize /></div><p className={styles.metricNote}>矿浆质量流量 × 固体质量分数</p></div>
            <div className={styles.metric}><span className={styles.metricLabel}>矿浆质量流量</span><div className={styles.metricValue}><EngineeringValue {...result.results.slurry_mass_flow} emphasize /></div><p className={styles.metricNote}>矿浆体积流量 × 矿浆密度</p></div>
            <div className={styles.metric}><span className={styles.metricLabel}>水量</span><div className={styles.metricValue}><EngineeringValue {...result.results.water_mass_flow} emphasize /></div><p className={styles.metricNote}>矿浆质量流量 − 干固体量</p></div>
          </div>
          <div className={styles.validityRow}><div><ValidityBadge validity={result.validity} /><small> request_id：{result.request_id}</small></div><span className={styles.phaseText}>公式 {result.formula_version} · {new Date(result.computed_at).toLocaleString("zh-CN")}</span></div>
        </Panel>

        {result.warnings.length ? <div className={styles.warningList}>{result.warnings.map((warning) => <Alert key={warning.code} tone="warning" title={warning.title}>{warning.message}</Alert>)}</div> : null}

        <Panel>
          <Tabs variant="card" defaultValue="steps" items={[
            { value: "steps", label: "计算过程", content: <CalculationSteps steps={steps} /> },
            { value: "assumptions", label: "假设与边界", content: <ul className={styles.assumptions}>{result.assumptions.map((item) => <li key={item}>{item}</li>)}</ul> },
            { value: "contract", label: "API数据", content: <pre className={styles.apiContract}>{JSON.stringify(result, null, 2)}</pre> },
          ]} />
        </Panel>
      </>
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.serviceBar}>
        <div className={styles.serviceInfo}>
          <span className={`${styles.serviceDot} ${styles[serviceStatus]}`} />
          <div><strong>FastAPI计算服务：{serviceStatus === "checking" ? "检查中" : serviceStatus === "online" ? "在线" : "离线"}</strong><small>Next.js → FastAPI → mining_core，前端不执行正式公式。</small></div>
        </div>
        <span className={styles.phaseText}>页面状态：{state.phase.toUpperCase()}</span>
      </div>

      {serviceStatus === "offline" ? <Alert tone="warning" title="后端服务未连接">请运行工程根目录的 <code>11_START_FASTAPI.cmd</code>，然后重新计算。你的输入不会丢失。</Alert> : null}

      <div className={styles.layout}>
        <Panel className={styles.inputPanel} title="输入参数" subtitle="输入原始值和单位，API会再次独立校验。">
          <div className={styles.inputStack}>
            <div className={styles.sourceRow}><span>数据来源</span><strong>{state.inputSource === "example" ? "教学示例" : state.inputSource === "reused" ? "历史结果复用" : "手动输入"}</strong></div>
            {state.inputSource === "example" ? <Alert tone="info" title="教学示例数据">当前参数仅用于演示工具流程，不代表实际项目工况。</Alert> : null}
            {state.inputSource === "reused" ? <Alert tone="info" title="已复用统一历史记录">请补充未能映射的字段，并在计算前核对来源记录状态。</Alert> : null}
            <UnitInput label="矿浆体积流量" quantity="volumeFlow" value={state.inputs.slurryVolumeFlow} onChange={(value) => edit("slurryVolumeFlow", value)} required min={0} helpText="允许输入0；支持m³/h和L/s。" errorText={state.fieldErrors.slurryVolumeFlow} />
            <UnitInput label="矿浆密度" quantity="density" value={state.inputs.slurryDensity} onChange={(value) => edit("slurryDensity", value)} required min={0} helpText="建议确认密度测点与流量测点代表同一时段。" errorText={state.fieldErrors.slurryDensity} />
            <UnitInput label="固体质量浓度" quantity="concentration" value={state.inputs.solidsMassFraction} onChange={(value) => edit("solidsMassFraction", value)} required min={0} helpText="质量分数定义；支持%和fraction。" errorText={state.fieldErrors.solidsMassFraction} />
            {state.localWarnings.map((warning) => <Alert key={warning.code} tone="warning" title={warning.title} compact>{warning.message}</Alert>)}
            <div className={styles.buttonRow}>
              <Button variant="primary" leadingIcon={<Calculator size={17} />} isLoading={state.phase === "calculating" || state.phase === "validating"} onClick={() => void calculate()}>开始计算</Button>
              <Button variant="secondary" leadingIcon={<FlaskConical size={16} />} onClick={() => dispatch({ type: "LOAD_EXAMPLE" })}>载入示例</Button>
              <Button variant="ghost" leadingIcon={<RotateCcw size={16} />} onClick={() => dispatch({ type: "RESET" })}>重置</Button>
            </div>
          </div>
        </Panel>

        <div className={styles.resultColumn} aria-live="polite">
          {state.dirty && state.result ? <div className={styles.dirtyBanner}>输入参数已修改，当前显示的仍是上一次计算结果。请重新计算。</div> : null}
          {(state.phase === "initial" || (state.phase === "editing" && !state.result)) ? <Panel><div className={styles.placeholder}><EmptyState title="输入参数后开始计算" description="系统将返回核心结果、计算过程、数据有效性、工程提示和request_id。" icon={<Database />} primaryAction={<Button variant="primary" onClick={() => dispatch({ type: "LOAD_EXAMPLE" })}>载入教学示例</Button>} /></div></Panel> : null}
          {(state.phase === "validating" || state.phase === "calculating") ? <Panel title={state.phase === "validating" ? "正在校验输入" : "正在调用计算服务"} subtitle="旧结果会保留，计算完成后再替换。"><div className={styles.skeletonStack}><div className={styles.skeletonGrid}><LoadingSkeleton variant="metric" /><LoadingSkeleton variant="metric" /><LoadingSkeleton variant="metric" /></div><LoadingSkeleton variant="text" lines={4} /></div></Panel> : null}
          {state.phase === "failed" && state.failure ? <ErrorState kind={state.failure.code === "SERVICE_UNAVAILABLE" ? "network" : "calculation"} title="计算未完成" description={state.failure.message} requestId={state.failure.requestId} primaryAction={<Button variant="primary" onClick={() => void calculate()}>重新计算</Button>} secondaryAction={<Button variant="secondary" onClick={() => dispatch({ type: "RESET" })}>重置输入</Button>} /> : null}
          {state.result ? renderResult(state.result) : null}
          {!state.result ? <Panel title="API数据契约" subtitle="前后端共享的首版请求与响应结构。"><pre className={styles.apiContract}>{contractPreview()}</pre></Panel> : null}
        </div>
      </div>
      {state.result ? <CalculationSaveModal key={state.result.request_id} open={saveOpen} onOpenChange={setSaveOpen} record={buildDrySolidsRecord(state.inputs, state.result)} onSaved={(saved) => toast({ title: "已保存到统一计算历史", description: saved.project ? `项目：${saved.project.name}` : `记录编号：${saved.id}`, tone: "success" })} /> : null}
    </div>
  );
}
