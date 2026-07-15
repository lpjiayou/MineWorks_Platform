import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("toggles an immediate setting", () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="实时计算" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch", { name: "实时计算" });
    expect(control).toHaveAttribute("aria-checked", "false");
    fireEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("does not toggle while disabled", () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="企业审核" disabled onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
