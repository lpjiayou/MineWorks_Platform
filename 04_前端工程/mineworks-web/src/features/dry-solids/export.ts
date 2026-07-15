import type { DrySolidsInputs, DrySolidsResponse } from "./types";

export function formatDrySolidsText(result: DrySolidsResponse): string {
  return [
    "干固体量计算结果",
    `干固体量：${result.results.dry_solids_rate.value.toFixed(result.results.dry_solids_rate.precision)} ${result.results.dry_solids_rate.unit}`,
    `矿浆质量流量：${result.results.slurry_mass_flow.value.toFixed(result.results.slurry_mass_flow.precision)} ${result.results.slurry_mass_flow.unit}`,
    `水量：${result.results.water_mass_flow.value.toFixed(result.results.water_mass_flow.precision)} ${result.results.water_mass_flow.unit}`,
    `数据状态：${result.validity}`,
    `公式版本：${result.formula_version}`,
    `request_id：${result.request_id}`,
  ].join("\n");
}

export function formatDrySolidsMarkdown(inputs: DrySolidsInputs, result: DrySolidsResponse): string {
  const warnings = result.warnings.length
    ? result.warnings.map((item) => `- **${item.title}**：${item.message}`).join("\n")
    : "- 无";

  return [
    "# 干固体量计算结果",
    "",
    `- 生成时间：${result.computed_at}`,
    `- request_id：${result.request_id}`,
    `- 数据状态：${result.validity}`,
    `- 公式版本：${result.formula_version}`,
    "",
    "## 输入",
    "",
    "| 参数 | 数值 | 单位 |",
    "|---|---:|---|",
    `| 矿浆体积流量 | ${inputs.slurryVolumeFlow.value} | ${inputs.slurryVolumeFlow.unit} |`,
    `| 矿浆密度 | ${inputs.slurryDensity.value} | ${inputs.slurryDensity.unit} |`,
    `| 固体质量浓度 | ${inputs.solidsMassFraction.value} | ${inputs.solidsMassFraction.unit} |`,
    "",
    "## 结果",
    "",
    "| 指标 | 结果 | 单位 |",
    "|---|---:|---|",
    `| 矿浆质量流量 | ${result.results.slurry_mass_flow.value.toFixed(2)} | t/h |`,
    `| 干固体量 | ${result.results.dry_solids_rate.value.toFixed(2)} | t/h |`,
    `| 水量 | ${result.results.water_mass_flow.value.toFixed(2)} | t/h |`,
    "",
    "## 工程提示",
    "",
    warnings,
    "",
  ].join("\n");
}

export function downloadTextFile(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
