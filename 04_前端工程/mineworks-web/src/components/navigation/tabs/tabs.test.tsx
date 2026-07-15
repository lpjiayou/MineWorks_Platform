import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./tabs";

const items = [
  { value: "steps", label: "计算过程", content: "公式内容" },
  { value: "warnings", label: "诊断与警告", content: "警告内容" },
  { value: "json", label: "结构化结果", content: "JSON内容" },
];

describe("Tabs", () => {
  it("changes panels on click", () => {
    render(<Tabs items={items} defaultValue="steps" />);
    fireEvent.click(screen.getByRole("tab", { name: "诊断与警告" }));
    expect(screen.getByRole("tab", { name: "诊断与警告" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("警告内容");
  });

  it("supports arrow-key navigation", () => {
    render(<Tabs items={items} defaultValue="steps" />);
    const first = screen.getByRole("tab", { name: "计算过程" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "诊断与警告" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "诊断与警告" })).toHaveFocus();
  });
});
