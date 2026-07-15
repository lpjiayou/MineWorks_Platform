import type { DrySolidsField, DrySolidsInputs, DrySolidsResponse, DrySolidsState, EngineeringWarning, FieldErrors, ToolFailure } from "./types";
import type { UnitValue } from "@/lib/units/types";

export const EMPTY_INPUTS: DrySolidsInputs = {
  slurryVolumeFlow: { value: null, unit: "m3/h" },
  slurryDensity: { value: null, unit: "t/m3" },
  solidsMassFraction: { value: null, unit: "%" },
};

export const EXAMPLE_INPUTS: DrySolidsInputs = {
  slurryVolumeFlow: { value: 118.37, unit: "m3/h" },
  slurryDensity: { value: 1.38, unit: "t/m3" },
  solidsMassFraction: { value: 42, unit: "%" },
};

export const initialDrySolidsState: DrySolidsState = {
  phase: "initial",
  inputs: EMPTY_INPUTS,
  inputSource: "manual",
  fieldErrors: {},
  localWarnings: [],
  result: null,
  failure: null,
  dirty: false,
};

export type DrySolidsAction =
  | { type: "EDIT_INPUT"; field: DrySolidsField; value: UnitValue }
  | { type: "LOAD_EXAMPLE" }
  | { type: "LOAD_REUSE"; inputs: DrySolidsInputs }
  | { type: "RESET" }
  | { type: "VALIDATING" }
  | { type: "VALIDATION_FAILED"; errors: FieldErrors; warnings: EngineeringWarning[] }
  | { type: "CALCULATING"; warnings: EngineeringWarning[] }
  | { type: "CALCULATED"; result: DrySolidsResponse }
  | { type: "FAILED"; failure: ToolFailure };

export function drySolidsReducer(state: DrySolidsState, action: DrySolidsAction): DrySolidsState {
  switch (action.type) {
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
      return { ...initialDrySolidsState, phase: "editing", inputs: action.inputs, inputSource: "reused" };
    case "LOAD_EXAMPLE":
      return {
        ...initialDrySolidsState,
        phase: "editing",
        inputs: EXAMPLE_INPUTS,
        inputSource: "example",
      };
    case "RESET":
      return initialDrySolidsState;
    case "VALIDATING":
      return { ...state, phase: "validating", fieldErrors: {}, failure: null };
    case "VALIDATION_FAILED":
      return {
        ...state,
        phase: "editing",
        fieldErrors: action.errors,
        localWarnings: action.warnings,
        failure: null,
      };
    case "CALCULATING":
      return {
        ...state,
        phase: "calculating",
        fieldErrors: {},
        localWarnings: action.warnings,
        failure: null,
      };
    case "CALCULATED":
      return {
        ...state,
        phase: "calculated",
        result: action.result,
        failure: null,
        dirty: false,
        localWarnings: [],
      };
    case "FAILED":
      return { ...state, phase: "failed", failure: action.failure };
  }
}
