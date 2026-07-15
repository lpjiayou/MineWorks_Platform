import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Calculator } from "lucide-react";
import { ToolCard } from "./tool-card";

describe("ToolCard", () => {
  it("emits favorite and open actions", () => {
    const onFavoriteChange = vi.fn();
    const onOpen = vi.fn();
    render(<ToolCard icon={<Calculator />} name="干固体量计算" description="说明" category="选矿工程" accessLevel="free" status="VALIDATED" onFavoriteChange={onFavoriteChange} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "收藏工具" }));
    fireEvent.click(screen.getByRole("button", { name: "立即使用" }));
    expect(onFavoriteChange).toHaveBeenCalledWith(true);
    expect(onOpen).toHaveBeenCalled();
  });

  it("shows member access action when locked", () => {
    render(<ToolCard icon={<Calculator />} name="高级分析" description="说明" category="选矿工程" accessLevel="professional" status="REVIEWING" isLocked />);
    expect(screen.getByRole("button", { name: "查看权益" })).toBeInTheDocument();
  });
});
