"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/button";
import { ToastProvider, useToast } from "./toast";

function ToastDemo() {
  const { toast } = useToast();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button onClick={() => toast({ title: "结果已复制", tone: "success" })}>成功</Button>
      <Button onClick={() => toast({ title: "结果需复核", description: "矿浆密度超出典型范围。", tone: "warning" })}>警告</Button>
      <Button onClick={() => toast({ title: "保存失败", description: "输入和结果已保留。", tone: "error", duration: 0 })}>错误</Button>
    </div>
  );
}

const meta = {
  title: "04 Feedback/Toast",
  component: ToastProvider,
  args: { children: null },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
