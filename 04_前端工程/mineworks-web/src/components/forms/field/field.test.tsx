import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NumberInput } from "@/components/forms/number-input/number-input";
import { Field } from "./field";

describe("Field", () => {
  it("connects label, help text and control", () => {
    render(
      <Field label="矿浆密度" helpText="标准单位为t/m³">
        <NumberInput value={1.38} onValueChange={() => undefined} />
      </Field>,
    );
    const input = screen.getByRole("spinbutton", { name: "矿浆密度" });
    const help = screen.getByText("标准单位为t/m³");
    expect(input).toHaveAttribute("aria-describedby", help.id);
  });

  it("marks invalid controls and exposes the error", () => {
    render(
      <Field label="回收率" errorText="回收率必须位于0%到100%之间。">
        <NumberInput value={120} onValueChange={() => undefined} />
      </Field>,
    );
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("回收率必须位于0%到100%之间。");
  });
});
