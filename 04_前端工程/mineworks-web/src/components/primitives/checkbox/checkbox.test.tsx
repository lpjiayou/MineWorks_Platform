import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("toggles and preserves its accessible label", () => {
    const onChange = vi.fn();
    render(<Checkbox label="显示计算过程" onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox", { name: "显示计算过程" });
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
  });

  it("supports indeterminate state", () => {
    render(<Checkbox label="选择部分记录" indeterminate />);
    expect(screen.getByRole("checkbox")).toHaveProperty("indeterminate", true);
  });
});
