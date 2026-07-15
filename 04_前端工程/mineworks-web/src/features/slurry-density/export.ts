import type { SlurryDensityInputs, SlurryDensityMode, SlurryDensityResponse } from "./types";

const modeLabels: Record<SlurryDensityMode, string> = {
  from_mass_concentration: "已知固体质量浓度",
  from_slurry_density: "已知矿浆密度",
  from_volume_concentration: "已知固体体积浓度",
};

export function formatSlurryDensityText(mode: SlurryDensityMode, result: SlurryDensityResponse): string {
  return [
    "矿浆密度与浓度换算",
    `计算模式：${modeLabels[mode]}`,
    `矿浆密度：${result.results.slurry_density.value.toFixed(3)} t/m³`,
    `固体质量浓度：${result.results.solids_mass_fraction.value.toFixed(2)} %`,
    `固体体积浓度：${result.results.solids_volume_fraction.value.toFixed(2)} %`,
    `数据状态：${result.validity}`,
    `request_id：${result.request_id}`,
  ].join("\n");
}

export function formatSlurryDensityMarkdown(
  mode: SlurryDensityMode,
  inputs: SlurryDensityInputs,
  result: SlurryDensityResponse,
): string {
  const warnings = result.warnings.length
    ? result.warnings.map((item) => `- ${item.title}：${item.message}`).join("\n")
    : "- 无";

  return `# 矿浆密度与浓度换算

- 计算模式：${modeLabels[mode]}
- 固体密度：${inputs.solidsDensity.value ?? "—"} ${inputs.solidsDensity.unit}
- 液相密度：${inputs.liquidDensity.value ?? "—"} ${inputs.liquidDensity.unit}
- 已知量：${inputs.knownValue.value ?? "—"} ${inputs.knownValue.unit}

## 结果

- 矿浆密度：${result.results.slurry_density.value.toFixed(3)} t/m³
- 固体质量浓度：${result.results.solids_mass_fraction.value.toFixed(2)} %
- 固体体积浓度：${result.results.solids_volume_fraction.value.toFixed(2)} %
- 液相质量分数：${result.results.liquid_mass_fraction.value.toFixed(2)} %
- 液相体积分数：${result.results.liquid_volume_fraction.value.toFixed(2)} %
- 数据状态：${result.validity}
- request_id：${result.request_id}

## 工程提示

${warnings}
`;
}

export function downloadTextFile(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
