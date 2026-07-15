import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CalculationSteps } from "./calculation-steps";

const steps = [{ id: "one", title: "计算质量流量", formula: "Qm = Qv × ρm", result: { value: 0, unit: "t/h" } }];

describe("CalculationSteps", () => {
  it("renders zero as a valid result", () => {
    render(<CalculationSteps steps={steps} />);
    expect(screen.getByText("0.00")).toBeInTheDocument();
  });

  it("toggles step details accessibly", () => {
    render(<CalculationSteps steps={steps} />);
    const trigger = screen.getByRole("button", { name: /计算质量流量/ });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
