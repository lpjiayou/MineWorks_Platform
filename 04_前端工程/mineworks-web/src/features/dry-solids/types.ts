import type { UnitValue } from "@/lib/units/types";
import type { DataValidity } from "@/types/status";

export type DrySolidsField = "slurryVolumeFlow" | "slurryDensity" | "solidsMassFraction";

export type DrySolidsInputs = Record<DrySolidsField, UnitValue>;

export type ApiResultValue = {
  value: number;
  unit: string;
  precision: number;
};

export type ApiCalculationStep = {
  id: string;
  title: string;
  description?: string;
  formula: string;
  substituted_expression: string;
  result: ApiResultValue;
  note?: string;
};

export type EngineeringWarning = {
  code: string;
  severity: "info" | "warning";
  title: string;
  message: string;
  field?: string;
};

export type DrySolidsResponse = {
  request_id: string;
  tool_id: "dry-solids-rate";
  formula_version: "1.0.0";
  computed_at: string;
  validity: Extract<DataValidity, "VALID" | "CAUTION" | "INVALID">;
  summary: string;
  normalized_inputs: {
    slurry_volume_flow_m3_h: number;
    slurry_density_t_m3: number;
    solids_mass_fraction: number;
  };
  results: {
    slurry_mass_flow: ApiResultValue;
    dry_solids_rate: ApiResultValue;
    water_mass_flow: ApiResultValue;
  };
  steps: ApiCalculationStep[];
  warnings: EngineeringWarning[];
  assumptions: string[];
};

export type DrySolidsRequest = {
  tool_id: "dry-solids-rate";
  formula_version: "1.0.0";
  inputs: {
    slurry_volume_flow: { value: number; unit: string };
    slurry_density: { value: number; unit: string };
    solids_mass_fraction: { value: number; unit: string };
  };
};

export type FieldErrors = Partial<Record<DrySolidsField, string>>;

export type ToolPhase = "initial" | "editing" | "validating" | "calculating" | "calculated" | "failed";

export type ToolFailure = {
  code: string;
  message: string;
  requestId?: string;
  fieldErrors?: FieldErrors;
};

export type DrySolidsState = {
  phase: ToolPhase;
  inputs: DrySolidsInputs;
  inputSource: "manual" | "example" | "reused";
  fieldErrors: FieldErrors;
  localWarnings: EngineeringWarning[];
  result: DrySolidsResponse | null;
  failure: ToolFailure | null;
  dirty: boolean;
};
