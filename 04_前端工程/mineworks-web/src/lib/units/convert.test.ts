import { describe, expect, it } from "vitest";
import { convertUnit, normalizeUnit } from "./convert";
describe("unit conversion", () => {
  it("converts L/s to m3/h", () => expect(convertUnit(1, "volumeFlow", "L/s", "m3/h")).toBeCloseTo(3.6));
  it("converts kg/m3 to t/m3", () => expect(normalizeUnit(1380, "density", "kg/m3")).toBeCloseTo(1.38));
  it("converts percent to fraction", () => expect(normalizeUnit(42, "concentration", "%")).toBeCloseTo(0.42));
});
