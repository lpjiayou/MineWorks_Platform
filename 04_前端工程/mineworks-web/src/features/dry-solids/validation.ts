import { convertUnit } from "@/lib/units/convert";
import type { DrySolidsInputs, EngineeringWarning, FieldErrors } from "./types";

export type ValidationResult = {
  errors: FieldErrors;
  warnings: EngineeringWarning[];
  valid: boolean;
};

export function validateDrySolidsInputs(inputs: DrySolidsInputs): ValidationResult {
  const errors: FieldErrors = {};
  const warnings: EngineeringWarning[] = [];

  const flow = inputs.slurryVolumeFlow.value;
  const density = inputs.slurryDensity.value;
  const concentration = inputs.solidsMassFraction.value;

  if (flow === null || Number.isNaN(flow)) errors.slurryVolumeFlow = "请输入矿浆体积流量。";
  else if (flow < 0) errors.slurryVolumeFlow = "矿浆体积流量不能小于0。";

  if (density === null || Number.isNaN(density)) errors.slurryDensity = "请输入矿浆密度。";
  else {
    const densityBase = convertUnit(density, "density", inputs.slurryDensity.unit, "t/m3");
    if (densityBase <= 0) errors.slurryDensity = "矿浆密度必须大于0。";
    else if (densityBase > 10) errors.slurryDensity = "矿浆密度不能大于10 t/m³，请检查单位。";
    else if (densityBase < 1 || densityBase > 4.5) warnings.push({
      code: "SLURRY_DENSITY_ATYPICAL",
      severity: "warning",
      title: "矿浆密度需要复核",
      message: "矿浆密度超出1.0～4.5 t/m³的常见工程范围。",
      field: "slurryDensity",
    });
  }

  if (concentration === null || Number.isNaN(concentration)) errors.solidsMassFraction = "请输入固体质量浓度。";
  else {
    const fraction = convertUnit(concentration, "concentration", inputs.solidsMassFraction.unit, "fraction");
    if (fraction < 0 || fraction > 1) errors.solidsMassFraction = "固体质量浓度必须位于0%～100%之间。";
    else if (fraction > 0.75) warnings.push({
      code: "SOLIDS_CONCENTRATION_HIGH",
      severity: "warning",
      title: "固体质量浓度较高",
      message: "固体质量浓度高于75%，请确认该物流是否仍可按均匀矿浆处理。",
      field: "solidsMassFraction",
    });
  }

  if (flow !== null && !Number.isNaN(flow)) {
    const flowBase = convertUnit(flow, "volumeFlow", inputs.slurryVolumeFlow.unit, "m3/h");
    if (flowBase > 50_000) warnings.push({
      code: "VOLUME_FLOW_HIGH",
      severity: "warning",
      title: "体积流量超出常见范围",
      message: "矿浆体积流量高于50,000 m³/h，请确认单位和测点。",
      field: "slurryVolumeFlow",
    });
  }

  return { errors, warnings, valid: Object.keys(errors).length === 0 };
}
