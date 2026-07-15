import { describe, expect, it } from "vitest";
import { buildDrySolidsRecord, buildSlurryDensityRecord } from "../record-builders";
import { applyReuseToDrySolids, applyReuseToSlurryDensity } from "../reuse";
import type { DrySolidsResponse } from "@/features/dry-solids/types";
import type { SlurryDensityResponse } from "@/features/slurry-density/types";

const dryResult: DrySolidsResponse = {
  request_id: "req_dry",
  tool_id: "dry-solids-rate",
  formula_version: "1.0.0",
  computed_at: "2026-07-14T00:00:00Z",
  validity: "VALID",
  summary: "ok",
  normalized_inputs: { slurry_volume_flow_m3_h: 100, slurry_density_t_m3: 1.4, solids_mass_fraction: 0.4 },
  results: {
    slurry_mass_flow: { value: 140, unit: "t/h", precision: 2 },
    dry_solids_rate: { value: 56, unit: "t/h", precision: 2 },
    water_mass_flow: { value: 84, unit: "t/h", precision: 2 },
  },
  steps: [], warnings: [], assumptions: [],
};

const slurryResult: SlurryDensityResponse = {
  request_id: "req_slurry",
  tool_id: "slurry-density-conversion",
  formula_version: "1.0.0",
  computed_at: "2026-07-14T00:00:00Z",
  validity: "VALID",
  summary: "ok",
  normalized_inputs: {
    mode: "from_mass_concentration",
    solids_density_t_m3: 2.7,
    liquid_density_t_m3: 1,
    known_value: 0.42,
    known_quantity: "mass_fraction",
  },
  results: {
    slurry_density: { value: 1.3595, unit: "t/m3", precision: 3 },
    solids_mass_fraction: { value: 42, unit: "%", precision: 2 },
    solids_volume_fraction: { value: 21.15, unit: "%", precision: 2 },
    liquid_mass_fraction: { value: 58, unit: "%", precision: 2 },
    liquid_volume_fraction: { value: 78.85, unit: "%", precision: 2 },
  },
  steps: [], warnings: [], assumptions: [],
};

describe("calculation record builders", () => {
  it("builds reusable dry solids outputs", () => {
    const record = buildDrySolidsRecord({
      slurryVolumeFlow: { value: 100, unit: "m3/h" },
      slurryDensity: { value: 1.4, unit: "t/m3" },
      solidsMassFraction: { value: 40, unit: "%" },
    }, dryResult);
    expect(record.reusable_outputs.find((item) => item.key === "solids_mass_fraction")?.value).toBe(40);
    expect(record.validity).toBe("VALID");
  });

  it("maps slurry results into dry solids inputs", () => {
    const record = buildSlurryDensityRecord("from_mass_concentration", {
      solidsDensity: { value: 2.7, unit: "t/m3" },
      liquidDensity: { value: 1, unit: "t/m3" },
      knownValue: { value: 42, unit: "%" },
    }, slurryResult);
    const pkg = {
      record_id: "calc_1",
      source_tool_id: "slurry-density-conversion",
      source_tool_name: "矿浆密度与浓度换算",
      target_tool_id: "dry-solids-rate",
      values: record.reusable_outputs.flatMap((output) => output.mappings
        .filter((mapping) => mapping.target_tool_id === "dry-solids-rate")
        .map((mapping) => ({ source_key: output.key, source_label: output.label, target_field: mapping.target_field, value: output.value, unit: mapping.target_unit, target_mode: mapping.target_mode }))),
      warnings: [],
    };
    const inputs = applyReuseToDrySolids({
      slurryVolumeFlow: { value: null, unit: "m3/h" },
      slurryDensity: { value: null, unit: "t/m3" },
      solidsMassFraction: { value: null, unit: "%" },
    }, pkg);
    expect(inputs.slurryDensity.value).toBe(1.3595);
    expect(inputs.solidsMassFraction.value).toBe(42);
  });

  it("maps dry solids concentration into slurry density mode", () => {
    const pkg = {
      record_id: "calc_2",
      source_tool_id: "dry-solids-rate",
      source_tool_name: "干固体量计算",
      target_tool_id: "slurry-density-conversion",
      values: [{ source_key: "solids_mass_fraction", source_label: "固体质量浓度", target_field: "knownValue", value: 40, unit: "%", target_mode: "from_mass_concentration" }],
      warnings: [],
    };
    const reused = applyReuseToSlurryDensity("from_slurry_density", {
      solidsDensity: { value: 2.7, unit: "t/m3" },
      liquidDensity: { value: 1, unit: "t/m3" },
      knownValue: { value: null, unit: "t/m3" },
    }, pkg);
    expect(reused.mode).toBe("from_mass_concentration");
    expect(reused.inputs.knownValue).toEqual({ value: 40, unit: "%" });
  });
});
