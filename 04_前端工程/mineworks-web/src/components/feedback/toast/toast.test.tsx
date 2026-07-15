import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToastProvider, useToast } from "./toast";

function TestTrigger() {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast({ title: "结果已保存", tone: "success", duration: 0 })}>
      触发通知
    </button>
  );
}

describe("Toast", () => {
  it("announces and dismisses feedback", () => {
    render(
      <ToastProvider>
        <TestTrigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "触发通知" }));
    expect(screen.getByRole("status")).toHaveTextContent("结果已保存");
    fireEvent.click(screen.getByRole("button", { name: "关闭通知" }));
    expect(screen.queryByText("结果已保存")).not.toBeInTheDocument();
  });
});
