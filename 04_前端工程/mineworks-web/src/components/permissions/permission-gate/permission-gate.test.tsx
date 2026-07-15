import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PermissionGate } from "./permission-gate";

describe("PermissionGate", () => {
  it("renders children when plan is sufficient", () => {
    render(<PermissionGate feature="报告" requiredPlan="professional" currentPlan="team"><span>正式报告</span></PermissionGate>);
    expect(screen.getByText("正式报告")).toBeInTheDocument();
  });

  it("shows a value explanation when access is insufficient", () => {
    render(<PermissionGate feature="批量平衡" requiredPlan="professional" currentPlan="free"><span>隐藏内容</span></PermissionGate>);
    expect(screen.getByRole("region", { name: "批量平衡权限说明" })).toBeInTheDocument();
    expect(screen.queryByText("隐藏内容")).not.toBeInTheDocument();
  });
});
