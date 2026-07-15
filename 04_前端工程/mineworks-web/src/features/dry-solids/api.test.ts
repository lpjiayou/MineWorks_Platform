import { describe, expect, it } from "vitest";
import { buildDrySolidsRequest } from "./api";
import { EXAMPLE_INPUTS } from "./state-machine";


describe("buildDrySolidsRequest", () => {
  it("preserves original values and units", () => {
    const request = buildDrySolidsRequest(EXAMPLE_INPUTS);
    expect(request.inputs.slurry_volume_flow).toEqual({ value: 118.37, unit: "m3/h" });
    expect(request.inputs.solids_mass_fraction).toEqual({ value: 42, unit: "%" });
  });
});
