import type { DrySolidsInputs } from "@/features/dry-solids/types";
import type { SlurryDensityInputs, SlurryDensityMode } from "@/features/slurry-density/types";
import type { ReusePackage } from "./types";

export function applyReuseToDrySolids(current: DrySolidsInputs, pkg: ReusePackage): DrySolidsInputs {
  const next = { ...current };
  for (const item of pkg.values) {
    if (item.target_field === "slurryVolumeFlow") next.slurryVolumeFlow = { value: item.value, unit: item.unit };
    if (item.target_field === "slurryDensity") next.slurryDensity = { value: item.value, unit: item.unit };
    if (item.target_field === "solidsMassFraction") next.solidsMassFraction = { value: item.value, unit: item.unit };
  }
  return next;
}

export function applyReuseToSlurryDensity(
  currentMode: SlurryDensityMode,
  current: SlurryDensityInputs,
  pkg: ReusePackage,
): { mode: SlurryDensityMode; inputs: SlurryDensityInputs } {
  let mode = currentMode;
  const next = { ...current };
  for (const item of pkg.values) {
    if (item.target_mode) mode = item.target_mode as SlurryDensityMode;
    if (item.target_field === "solidsDensity") next.solidsDensity = { value: item.value, unit: item.unit };
    if (item.target_field === "liquidDensity") next.liquidDensity = { value: item.value, unit: item.unit };
    if (item.target_field === "knownValue") next.knownValue = { value: item.value, unit: item.unit };
  }
  return { mode, inputs: next };
}
