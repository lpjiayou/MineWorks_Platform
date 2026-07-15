import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Calculator } from "lucide-react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("exposes its title and description", () => {
    render(<EmptyState icon={<Calculator />} title="尚未计算" description="请输入参数。" />);
    const region = screen.getByRole("region", { name: "尚未计算" });
    expect(region).toHaveTextContent("请输入参数。");
  });
});
