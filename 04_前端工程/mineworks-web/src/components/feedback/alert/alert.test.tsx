import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./alert";

describe("Alert", () => {
  it("uses alert semantics for errors", () => {
    render(<Alert tone="error" title="计算失败">输入已保留。</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("输入已保留。");
  });

  it("supports dismiss actions", () => {
    const onDismiss = vi.fn();
    render(<Alert title="提示" onDismiss={onDismiss}>可以关闭。</Alert>);
    fireEvent.click(screen.getByRole("button", { name: "关闭提示" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
