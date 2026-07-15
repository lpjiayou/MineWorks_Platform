import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./modal";

describe("Modal", () => {
  it("renders as an accessible dialog and closes with Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} title="保存到项目">
        <button type="button">确认保存</button>
      </Modal>,
    );
    expect(screen.getByRole("dialog", { name: "保存到项目" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.getByRole("button", { name: "关闭弹窗" })).toHaveFocus());
  });

  it("closes when the close button is activated", () => {
    const onOpenChange = vi.fn();
    render(<Modal open onOpenChange={onOpenChange} title="参数确认">内容</Modal>);
    fireEvent.click(screen.getByRole("button", { name: "关闭弹窗" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
