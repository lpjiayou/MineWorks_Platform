import type { UnitValue } from "@/lib/units/types";
import type { DataValidity } from "@/types/status";

export type SlurryDensityMode = "from_mass_concentration" | "from_slurry_density" | "from_volume_concentration";
export type SlurryDensityField = "solidsDensity" | "liquidDensity" | "knownValue";

export type SlurryDensityInputs = {
  solidsDensity: UnitValue;
  liquidDensity: UnitValue;
  knownValue: UnitValue;
};

export type ApiResultValue = { value: number; unit: string; precision: number };
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

export type SlurryDensityResponse = {
  request_id: string;
  tool_id: "slurry-density-conversion";
  formula_version: "1.0.0";
  computed_at: string;
  validity: Extract<DataValidity, "VALID" | "CAUTION" | "INVALID">;
  summary: string;
  normalized_inputs: {
    mode: SlurryDensityMode;
    solids_density_t_m3: number;
    liquid_density_t_m3: number;
    known_value: number;
    known_quantity: "mass_fraction" | "slurry_density" | "volume_fraction";
  };
  results: {
    slurry_density: ApiResultValue;
    solids_mass_fraction: ApiResultValue;
    solids_volume_fraction: ApiResultValue;
    liquid_mass_fraction: ApiResultValue;
    liquid_volume_fraction: ApiResultValue;
  };
  steps: ApiCalculationStep[];
  warnings: EngineeringWarning[];
  assumptions: string[];
};

export type SlurryDensityRequest = {
  tool_id: "slurry-density-conversion";
  formula_version: "1.0.0";
  mode: SlurryDensityMode;
  inputs: {
    solids_density: { value: number; unit: string };
    liquid_density: { value: number; unit: string };
    known_value: { value: number; unit: string };
  };
};

export type FieldErrors = Partial<Record<SlurryDensityField, string>>;
export type ToolPhase = "initial" | "editing" | "validating" | "calculating" | "calculated" | "failed";
export type ToolFailure = { code: string; message: string; requestId?: string; fieldErrors?: FieldErrors };
export type SlurryDensityState = {
  phase: ToolPhase;
  mode: SlurryDensityMode;
  inputs: SlurryDensityInputs;
  inputSource: "manual" | "example" | "reused";
  fieldErrors: FieldErrors;
  localWarnings: EngineeringWarning[];
  result: SlurryDensityResponse | null;
  failure: ToolFailure | null;
  dirty: boolean;
};
