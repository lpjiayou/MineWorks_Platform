import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Accordion } from "./accordion";

const items = [
  { value: "a", label: "适用范围", content: "范围说明" },
  { value: "b", label: "数据来源", content: "来源说明" },
];

describe("Accordion", () => {
  it("opens and closes an item", () => {
    render(<Accordion items={items} />);
    const trigger = screen.getByRole("button", { name: "适用范围" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("范围说明")).toBeVisible();
  });

  it("supports arrow-key focus movement", () => {
    render(<Accordion items={items} />);
    const first = screen.getByRole("button", { name: "适用范围" });
    const second = screen.getByRole("button", { name: "数据来源" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(second).toHaveFocus();
  });
});
