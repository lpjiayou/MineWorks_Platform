import { describe, expect, it } from "vitest";
import { initialSlurryDensityState, slurryDensityReducer } from "./state-machine";
describe("slurryDensityReducer", () => {
  it("treats zero concentration as a valid edited value", () => { const state = slurryDensityReducer(initialSlurryDensityState, { type: "EDIT_INPUT", field: "knownValue", value: { value: 0, unit: "%" } }); expect(state.inputs.knownValue.value).toBe(0); expect(state.phase).toBe("editing"); });
  it("changes known-value quantity when mode changes", () => { const state = slurryDensityReducer(initialSlurryDensityState, { type: "CHANGE_MODE", mode: "from_slurry_density" }); expect(state.inputs.knownValue.unit).toBe("t/m3"); expect(state.inputs.knownValue.value).toBeNull(); });
  it("marks an old result dirty after changing mode", () => { const calculated = { ...initialSlurryDensityState, phase: "calculated" as const, result: { request_id: "req_1" } as never }; const state = slurryDensityReducer(calculated, { type: "CHANGE_MODE", mode: "from_volume_concentration" }); expect(state.dirty).toBe(true); expect(state.result).not.toBeNull(); });
});
