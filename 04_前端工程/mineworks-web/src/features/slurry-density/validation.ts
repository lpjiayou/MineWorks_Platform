import { convertUnit } from "@/lib/units/convert";
import type { EngineeringWarning, FieldErrors, SlurryDensityInputs, SlurryDensityMode } from "./types";

export type ValidationResult = { errors: FieldErrors; warnings: EngineeringWarning[]; valid: boolean };

export function validateSlurryDensityInputs(mode: SlurryDensityMode, inputs: SlurryDensityInputs): ValidationResult {
  const errors: FieldErrors = {};
  const warnings: EngineeringWarning[] = [];
  const solidsRaw = inputs.solidsDensity.value;
  const liquidRaw = inputs.liquidDensity.value;
  const knownRaw = inputs.knownValue.value;
  let solids: number | null = null;
  let liquid: number | null = null;

  if (solidsRaw === null || Number.isNaN(solidsRaw)) errors.solidsDensity = "请输入固体密度。";
  else {
    solids = convertUnit(solidsRaw, "density", inputs.solidsDensity.unit, "t/m3");
    if (solids <= 0) errors.solidsDensity = "固体密度必须大于0。";
    else if (solids > 25) errors.solidsDensity = "固体密度不能大于25 t/m³，请检查单位。";
    else if (solids < 1.5 || solids > 8) warnings.push({ code: "SOLIDS_DENSITY_ATYPICAL", severity: "warning", title: "固体密度需要复核", message: "固体密度超出1.5～8.0 t/m³的常见矿物工程范围。", field: "solidsDensity" });
  }

  if (liquidRaw === null || Number.isNaN(liquidRaw)) errors.liquidDensity = "请输入液相密度。";
  else {
    liquid = convertUnit(liquidRaw, "density", inputs.liquidDensity.unit, "t/m3");
    if (liquid <= 0) errors.liquidDensity = "液相密度必须大于0。";
    else if (liquid > 5) errors.liquidDensity = "液相密度不能大于5 t/m³，请检查单位。";
    else if (liquid < 0.8 || liquid > 1.5) warnings.push({ code: "LIQUID_DENSITY_ATYPICAL", severity: "warning", title: "液相密度需要复核", message: "液相密度超出0.8～1.5 t/m³的常见范围。", field: "liquidDensity" });
  }

  if (solids !== null && liquid !== null && solids <= liquid) {
    errors.solidsDensity = "固体密度必须大于液相密度。";
  }

  if (knownRaw === null || Number.isNaN(knownRaw)) {
    errors.knownValue = mode === "from_slurry_density" ? "请输入已知矿浆密度。" : mode === "from_mass_concentration" ? "请输入已知固体质量浓度。" : "请输入已知固体体积浓度。";
  } else if (mode === "from_slurry_density") {
    const density = convertUnit(knownRaw, "density", inputs.knownValue.unit, "t/m3");
    if (density <= 0) errors.knownValue = "矿浆密度必须大于0。";
    else if (solids !== null && liquid !== null && (density < liquid || density > solids)) errors.knownValue = "矿浆密度必须位于液相密度与固体密度之间。";
    if (solids !== null && liquid !== null && solids - liquid < 0.1) warnings.push({ code: "DENSITY_CONTRAST_LOW", severity: "warning", title: "密度差较小", message: "利用矿浆密度反算浓度会对测量误差较敏感。", field: "knownValue" });
  } else {
    const fraction = convertUnit(knownRaw, "concentration", inputs.knownValue.unit, "fraction");
    if (fraction < 0 || fraction > 1) errors.knownValue = "浓度必须位于0%～100%之间。";
    else if (mode === "from_mass_concentration" && fraction > 0.75) warnings.push({ code: "MASS_CONCENTRATION_HIGH", severity: "warning", title: "固体质量浓度较高", message: "固体质量浓度高于75%，建议复核流变性和可泵送性。", field: "knownValue" });
    else if (mode === "from_volume_concentration" && fraction > 0.5) warnings.push({ code: "VOLUME_CONCENTRATION_HIGH", severity: "warning", title: "固体体积浓度较高", message: "固体体积浓度高于50%，建议复核均匀悬浮和体积可加假设。", field: "knownValue" });
  }

  return { errors, warnings, valid: Object.keys(errors).length === 0 };
}
