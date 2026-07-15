import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumb } from "./breadcrumb";

describe("Breadcrumb", () => {
  it("marks the last item as current page", () => {
    render(<Breadcrumb items={[{ label: "首页", href: "/" }, { label: "工具中心" }]} />);
    expect(screen.getByText("工具中心")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /首页/ })).toHaveAttribute("href", "/");
  });
});
