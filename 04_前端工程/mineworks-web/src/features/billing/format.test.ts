import { describe, expect, it } from "vitest";
import { formatPrice, quotaText } from "./format";

describe("billing format", () => {
  it("formats free, paid and custom prices", () => {
    expect(formatPrice(0, "monthly")).toBe("免费");
    expect(formatPrice(9900, "monthly")).toBe("¥99/月");
    expect(formatPrice(null, "annual")).toBe("联系企业服务");
  });

  it("formats unlimited quota", () => {
    expect(quotaText(12, null)).toBe("12 / 不限");
  });
});
