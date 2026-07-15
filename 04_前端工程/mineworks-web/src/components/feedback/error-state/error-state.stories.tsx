import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/button";
import { ErrorState } from "./error-state";

const meta = {
  title: "04 Feedback/ErrorState",
  component: ErrorState,
  args: {
    title: "计算未完成",
    description: "输入参数和上一次结果已保留，请重试；若问题持续，请提交request_id。",
    requestId: "req_4f7a2c",
    primaryAction: <Button variant="danger">重新尝试</Button>,
    secondaryAction: <Button>保存本地草稿</Button>,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CalculationFailed: Story = {};
export const ServiceUnavailable: Story = { args: { kind: "network", title: "计算服务暂时不可用", description: "你的输入已保留，请稍后重试。" } };
export const PermissionDenied: Story = { args: { kind: "permission", title: "当前套餐未开通", description: "批量物料平衡属于专业会员功能。", requestId: undefined } };
export const ToolDisabled: Story = { args: { kind: "disabled", title: "工具已停用", description: "请迁移到新版全流程物料平衡工具。", requestId: undefined } };
export const Compact: Story = { args: { compact: true } };
