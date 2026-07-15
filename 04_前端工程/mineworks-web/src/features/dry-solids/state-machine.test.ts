import { describe, expect, it } from "vitest";
import { drySolidsReducer, initialDrySolidsState } from "./state-machine";


describe("drySolidsReducer", () => {
  it("treats zero as an edited value", () => {
    const state = drySolidsReducer(initialDrySolidsState, { type: "EDIT_INPUT", field: "slurryVolumeFlow", value: { value: 0, unit: "m3/h" } });
    expect(state.inputs.slurryVolumeFlow.value).toBe(0);
    expect(state.phase).toBe("editing");
  });

  it("marks old results dirty after input changes", () => {
    const calculated = { ...initialDrySolidsState, phase: "calculated" as const, result: { request_id: "req_1" } as never };
    const state = drySolidsReducer(calculated, { type: "EDIT_INPUT", field: "slurryDensity", value: { value: 1.4, unit: "t/m3" } });
    expect(state.dirty).toBe(true);
    expect(state.result).not.toBeNull();
  });
});
