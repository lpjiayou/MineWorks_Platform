import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormulaBlock } from "./formula-block";

describe("FormulaBlock", () => {
  it("renders formula as safe text", () => {
    render(<FormulaBlock formula={'Q = 0 < 1 && <script>alert("x")</script>'} />);
    expect(screen.getByText(/<script>/)).toBeInTheDocument();
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });

  it("supports copy feedback callback", () => {
    const onCopy = vi.fn();
    render(<FormulaBlock formula="Qs = Qm × Cw" onCopy={onCopy} />);
    fireEvent.click(screen.getByRole("button", { name: "复制公式" }));
    expect(onCopy).toHaveBeenCalledWith("Qs = Qm × Cw");
  });
});
