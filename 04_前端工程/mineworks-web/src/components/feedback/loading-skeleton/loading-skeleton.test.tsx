import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingSkeleton } from "./loading-skeleton";

describe("LoadingSkeleton", () => {
  it("announces the loading state", () => {
    render(<LoadingSkeleton variant="metric" label="计算结果加载中" />);
    const status = screen.getByRole("status", { name: "计算结果加载中" });
    expect(status).toHaveAttribute("aria-busy", "true");
  });
});
