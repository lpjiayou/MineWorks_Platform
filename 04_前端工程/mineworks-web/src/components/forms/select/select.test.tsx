import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./select";

const options = [
  { value: "m3/h", label: "m³/h" },
  { value: "l/s", label: "L/s" },
];

describe("Select", () => {
  it("emits the selected engineering unit", () => {
    const onChange = vi.fn();
    render(<Select aria-label="流量单位" options={options} defaultValue="m3/h" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("流量单位"), { target: { value: "l/s" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("流量单位")).toHaveValue("l/s");
  });

  it("exposes invalid state to assistive technology", () => {
    render(<Select aria-label="错误单位" options={options} invalid />);
    expect(screen.getByLabelText("错误单位")).toHaveAttribute("aria-invalid", "true");
  });
});
