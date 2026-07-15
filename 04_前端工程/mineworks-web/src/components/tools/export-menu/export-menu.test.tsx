import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExportMenu } from "./export-menu";

const formats = [{ id: "md", label: "Markdown" }, { id: "xlsx", label: "Excel", requiredPlan: "professional" as const }];

describe("ExportMenu", () => {
  it("exports allowed formats and redirects locked formats", () => {
    const onExport = vi.fn();
    const onLocked = vi.fn();
    render(<ExportMenu formats={formats} currentPlan="free" onExport={onExport} onLockedFormat={onLocked} />);
    fireEvent.click(screen.getByRole("button", { name: "导出" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Markdown/ }));
    expect(onExport).toHaveBeenCalledWith(formats[0]);
    fireEvent.click(screen.getByRole("button", { name: "导出" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Excel/ }));
    expect(onLocked).toHaveBeenCalledWith(formats[1]);
  });
});
