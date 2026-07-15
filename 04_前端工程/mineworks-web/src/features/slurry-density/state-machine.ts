import type { UnitValue } from "@/lib/units/types";
import type { EngineeringWarning, FieldErrors, SlurryDensityField, SlurryDensityInputs, SlurryDensityMode, SlurryDensityResponse, SlurryDensityState, ToolFailure } from "./types";

export const EMPTY_INPUTS: SlurryDensityInputs = {
  solidsDensity: { value: null, unit: "t/m3" },
  liquidDensity: { value: 1.0, unit: "t/m3" },
  knownValue: { value: null, unit: "%" },
};

export const EXAMPLE_INPUTS: SlurryDensityInputs = {
  solidsDensity: { value: 2.7, unit: "t/m3" },
  liquidDensity: { value: 1.0, unit: "t/m3" },
  knownValue: { value: 42, unit: "%" },
};

export const initialSlurryDensityState: SlurryDensityState = {
  phase: "initial",
  mode: "from_mass_concentration",
  inputs: EMPTY_INPUTS,
  inputSource: "manual",
  fieldErrors: {},
  localWarnings: [],
  result: null,
  failure: null,
  dirty: false,
};

export type SlurryDensityAction =
  | { type: "CHANGE_MODE"; mode: SlurryDensityMode }
  | { type: "EDIT_INPUT"; field: SlurryDensityField; value: UnitValue }
  | { type: "LOAD_EXAMPLE" }
  | { type: "LOAD_REUSE"; mode: SlurryDensityMode; inputs: SlurryDensityInputs }
  | { type: "RESET" }
  | { type: "VALIDATING" }
  | { type: "VALIDATION_FAILED"; errors: FieldErrors; warnings: EngineeringWarning[] }
  | { type: "CALCULATING"; warnings: EngineeringWarning[] }
  | { type: "CALCULATED"; result: SlurryDensityResponse }
  | { type: "FAILED"; failure: ToolFailure };

function knownUnit(mode: SlurryDensityMode): string {
  return mode === "from_slurry_density" ? "t/m3" : "%";
}

export function slurryDensityReducer(state: SlurryDensityState, action: SlurryDensityAction): SlurryDensityState {
  switch (action.type) {
    case "CHANGE_MODE":
      return {
        ...state,
        phase: "editing",
        mode: action.mode,
        inputs: { ...state.inputs, knownValue: { value: null, unit: knownUnit(action.mode) } },
        inputSource: "manual",
        fieldErrors: {},
        localWarnings: [],
        failure: null,
        dirty: Boolean(state.result),
      };
    case "EDIT_INPUT":
      return {
        ...state,
        phase: "editing",
        inputs: { ...state.inputs, [action.field]: action.value },
        inputSource: "manual",
        fieldErrors: { ...state.fieldErrors, [action.field]: undefined },
        failure: null,
        dirty: Boolean(state.result),
      };
    case "LOAD_REUSE":
      return { ...initialSlurryDensityState, phase: "editing", mode: action.mode, inputs: action.inputs, inputSource: "reused" };
    case "LOAD_EXAMPLE":
      return { ...initialSlurryDensityState, phase: "editing", inputs: EXAMPLE_INPUTS, inputSource: "example" };
    case "RESET":
      return initialSlurryDensityState;
    case "VALIDATING":
      return { ...state, phase: "validating", fieldErrors: {}, failure: null };
    case "VALIDATION_FAILED":
      return { ...state, phase: "editing", fieldErrors: action.errors, localWarnings: action.warnings, failure: null };
    case "CALCULATING":
      return { ...state, phase: "calculating", fieldErrors: {}, localWarnings: action.warnings, failure: null };
    case "CALCULATED":
      return { ...state, phase: "calculated", result: action.result, failure: null, dirty: false, localWarnings: [] };
    case "FAILED":
      return { ...state, phase: "failed", failure: action.failure };
  }
}
