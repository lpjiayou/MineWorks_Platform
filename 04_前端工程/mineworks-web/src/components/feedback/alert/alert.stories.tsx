import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/button";
import { Alert } from "./alert";

const meta = {
  title: "04 Feedback/Alert",
  component: Alert,
  args: {
    title: "工程提示",
    children: "矿浆密度高于典型范围，请确认介质和单位。",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { tone: "info" } };
export const Success: Story = { args: { tone: "success", title: "计算成功", children: "结果已生成，可保存或导出。" } };
export const Warning: Story = { args: { tone: "warning" } };
export const Error: Story = { args: { tone: "error", title: "计算未完成", children: "输入已保留，请修正错误后重试。" } };
export const WithAction: Story = { args: { tone: "warning", action: <Button size="sm">查看诊断</Button> } };
export const Dismissible: Story = { args: { onDismiss: () => undefined } };
