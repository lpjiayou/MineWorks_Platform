import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/button";
import { PermissionGate } from "./permission-gate";

const meta = {
  title: "09 Domain/PermissionGate",
  component: PermissionGate,
  args: {
    feature: "批量物料平衡",
    requiredPlan: "professional",
    currentPlan: "free",
    description: "支持多工况批量计算、闭合误差诊断和正式Excel报告。",
    upgradeAction: <Button variant="primary" size="sm">升级专业会员</Button>,
    children: <div>已获得访问权限</div>,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PermissionGate>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Preview: Story = { args: { preview: <div>多工况结果预览：6个工况，平均闭合误差0.42%</div> } };
export const Block: Story = { args: { mode: "block" } };
export const Granted: Story = { args: { currentPlan: "professional" } };
export const TeamFeature: Story = { args: { feature: "企业参数模板", requiredPlan: "team" } };
