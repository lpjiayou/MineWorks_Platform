import { describe, expect, it } from "vitest";
import { buildSlurryDensityRequest } from "./api";
import { EXAMPLE_INPUTS } from "./state-machine";
describe("buildSlurryDensityRequest", () => { it("preserves mode, original values and units", () => { const request = buildSlurryDensityRequest("from_mass_concentration", EXAMPLE_INPUTS); expect(request.mode).toBe("from_mass_concentration"); expect(request.inputs.solids_density).toEqual({ value: 2.7, unit: "t/m3" }); expect(request.inputs.known_value).toEqual({ value: 42, unit: "%" }); }); });
