import type { DrySolidsInputs, DrySolidsResponse } from "@/features/dry-solids/types";
import type { SlurryDensityInputs, SlurryDensityMode, SlurryDensityResponse } from "@/features/slurry-density/types";
import type { CalculationRecordCreate, ReusableOutput } from "./types";

function timestampTitle(prefix: string): string {
  return `${prefix} ${new Date().toLocaleString("zh-CN", { hour12: false })}`;
}

export function buildDrySolidsRecord(
  inputs: DrySolidsInputs,
  result: DrySolidsResponse,
  options: { title?: string; projectId?: string | null; note?: string } = {},
): CalculationRecordCreate {
  const n = result.normalized_inputs;
  const reusable: ReusableOutput[] = [
    {
      key: "slurry_volume_flow",
      label: "矿浆体积流量",
      value: n.slurry_volume_flow_m3_h,
      unit: "m3/h",
      quantity: "volume_flow",
      mappings: [{ target_tool_id: "dry-solids-rate", target_field: "slurryVolumeFlow", target_unit: "m3/h" }],
    },
    {
      key: "slurry_density",
      label: "矿浆密度",
      value: n.slurry_density_t_m3,
      unit: "t/m3",
      quantity: "density",
      mappings: [{ target_tool_id: "dry-solids-rate", target_field: "slurryDensity", target_unit: "t/m3" }],
    },
    {
      key: "solids_mass_fraction",
      label: "固体质量浓度",
      value: n.solids_mass_fraction * 100,
      unit: "%",
      quantity: "concentration",
      mappings: [
        { target_tool_id: "dry-solids-rate", target_field: "solidsMassFraction", target_unit: "%" },
        { target_tool_id: "slurry-density-conversion", target_field: "knownValue", target_unit: "%", target_mode: "from_mass_concentration" },
      ],
    },
    {
      key: "dry_solids_rate",
      label: "干固体量",
      value: result.results.dry_solids_rate.value,
      unit: result.results.dry_solids_rate.unit,
      quantity: "mass_flow",
      mappings: [],
    },
  ];
  return {
    source_request_id: result.request_id,
    tool_id: result.tool_id,
    tool_name: "干固体量计算",
    tool_version: "1.0.0",
    formula_version: result.formula_version,
    title: options.title ?? timestampTitle("干固体量计算"),
    project_id: options.projectId ?? null,
    data_source: "manual",
    validity: result.validity,
    computed_at: result.computed_at,
    inputs: inputs as unknown as Record<string, unknown>,
    normalized_inputs: result.normalized_inputs,
    results: result.results,
    steps: result.steps as unknown as Array<Record<string, unknown>>,
    warnings: result.warnings as unknown as Array<Record<string, unknown>>,
    assumptions: result.assumptions,
    reusable_outputs: reusable,
    tags: ["选矿", "矿浆", "干固体量"],
    note: options.note ?? "",
  };
}

export function buildSlurryDensityRecord(
  mode: SlurryDensityMode,
  inputs: SlurryDensityInputs,
  result: SlurryDensityResponse,
  options: { title?: string; projectId?: string | null; note?: string } = {},
): CalculationRecordCreate {
  const reusable: ReusableOutput[] = [
    {
      key: "slurry_density",
      label: "矿浆密度",
      value: result.results.slurry_density.value,
      unit: result.results.slurry_density.unit,
      quantity: "density",
      mappings: [{ target_tool_id: "dry-solids-rate", target_field: "slurryDensity", target_unit: "t/m3" }],
    },
    {
      key: "solids_mass_fraction",
      label: "固体质量浓度",
      value: result.results.solids_mass_fraction.value,
      unit: result.results.solids_mass_fraction.unit,
      quantity: "concentration",
      mappings: [
        { target_tool_id: "dry-solids-rate", target_field: "solidsMassFraction", target_unit: "%" },
        { target_tool_id: "slurry-density-conversion", target_field: "knownValue", target_unit: "%", target_mode: "from_mass_concentration" },
      ],
    },
    {
      key: "solids_density",
      label: "固体密度",
      value: result.normalized_inputs.solids_density_t_m3,
      unit: "t/m3",
      quantity: "density",
      mappings: [{ target_tool_id: "slurry-density-conversion", target_field: "solidsDensity", target_unit: "t/m3" }],
    },
    {
      key: "liquid_density",
      label: "液相密度",
      value: result.normalized_inputs.liquid_density_t_m3,
      unit: "t/m3",
      quantity: "density",
      mappings: [{ target_tool_id: "slurry-density-conversion", target_field: "liquidDensity", target_unit: "t/m3" }],
    },
  ];
  return {
    source_request_id: result.request_id,
    tool_id: result.tool_id,
    tool_name: "矿浆密度与浓度换算",
    tool_version: "1.0.0",
    formula_version: result.formula_version,
    title: options.title ?? timestampTitle("矿浆密度与浓度换算"),
    project_id: options.projectId ?? null,
    data_source: "manual",
    validity: result.validity,
    computed_at: result.computed_at,
    inputs: { mode, ...inputs } as unknown as Record<string, unknown>,
    normalized_inputs: result.normalized_inputs,
    results: result.results,
    steps: result.steps as unknown as Array<Record<string, unknown>>,
    warnings: result.warnings as unknown as Array<Record<string, unknown>>,
    assumptions: result.assumptions,
    reusable_outputs: reusable,
    tags: ["选矿", "矿浆", "密度", "浓度"],
    note: options.note ?? "",
  };
}
