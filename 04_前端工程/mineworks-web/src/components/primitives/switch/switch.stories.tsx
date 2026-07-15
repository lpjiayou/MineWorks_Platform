import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Switch } from "./switch";

const meta = {
  title: "02 Primitives/Switch",
  component: Switch,
  args: {
    label: "实时计算",
    description: "输入停止变化后自动重新计算。",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
