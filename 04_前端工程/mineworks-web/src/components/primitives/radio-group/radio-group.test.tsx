import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "./radio-group";

describe("RadioGroup", () => {
  it("changes the selected save destination", () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup
        label="保存位置"
        defaultValue="current"
        onValueChange={onValueChange}
        options={[
          { value: "current", label: "当前项目" },
          { value: "standalone", label: "独立记录" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "独立记录" }));
    expect(onValueChange).toHaveBeenCalledWith("standalone");
    expect(screen.getByRole("radio", { name: "独立记录" })).toBeChecked();
  });
});
