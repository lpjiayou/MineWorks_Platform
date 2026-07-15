import { describe, expect, it } from "vitest";
import { EXAMPLE_INPUTS } from "./state-machine";
import { validateDrySolidsInputs } from "./validation";


describe("validateDrySolidsInputs", () => {
  it("accepts the standard example", () => {
    const result = validateDrySolidsInputs(EXAMPLE_INPUTS);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("accepts zero flow", () => {
    const result = validateDrySolidsInputs({ ...EXAMPLE_INPUTS, slurryVolumeFlow: { value: 0, unit: "m3/h" } });
    expect(result.valid).toBe(true);
  });

  it("rejects concentration above 100 percent", () => {
    const result = validateDrySolidsInputs({ ...EXAMPLE_INPUTS, solidsMassFraction: { value: 120, unit: "%" } });
    expect(result.valid).toBe(false);
    expect(result.errors.solidsMassFraction).toContain("100%");
  });

  it("returns caution for atypical density", () => {
    const result = validateDrySolidsInputs({ ...EXAMPLE_INPUTS, slurryDensity: { value: 4.8, unit: "t/m3" } });
    expect(result.valid).toBe(true);
    expect(result.warnings[0]?.code).toBe("SLURRY_DENSITY_ATYPICAL");
  });
});
