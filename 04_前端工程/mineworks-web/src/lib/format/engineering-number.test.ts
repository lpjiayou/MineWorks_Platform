import { describe, expect, it } from "vitest";
import { formatEngineeringNumber } from "./engineering-number";
describe("formatEngineeringNumber", () => {
  it("keeps zero as a valid value", () => expect(formatEngineeringNumber(0, { precision: 2 })).toBe("0.00"));
  it("renders null as a dash", () => expect(formatEngineeringNumber(null)).toBe("—"));
  it("renders NaN as a calculation error", () => expect(formatEngineeringNumber(Number.NaN)).toBe("计算错误"));
});
