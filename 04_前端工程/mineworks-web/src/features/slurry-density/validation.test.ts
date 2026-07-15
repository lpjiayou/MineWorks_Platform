import { describe, expect, it } from "vitest";
import { EXAMPLE_INPUTS } from "./state-machine";
import { validateSlurryDensityInputs } from "./validation";
describe("validateSlurryDensityInputs", () => {
  it("accepts the normal mass-concentration example", () => { expect(validateSlurryDensityInputs("from_mass_concentration", EXAMPLE_INPUTS).valid).toBe(true); });
  it("accepts zero concentration", () => { const inputs = { ...EXAMPLE_INPUTS, knownValue: { value: 0, unit: "%" } }; expect(validateSlurryDensityInputs("from_mass_concentration", inputs).valid).toBe(true); });
  it("rejects solids density not greater than liquid density", () => { const inputs = { ...EXAMPLE_INPUTS, solidsDensity: { value: 0.9, unit: "t/m3" } }; const result = validateSlurryDensityInputs("from_mass_concentration", inputs); expect(result.valid).toBe(false); expect(result.errors.solidsDensity).toBeTruthy(); });
});
