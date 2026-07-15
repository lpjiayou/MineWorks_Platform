import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs } from "./tabs";

const items = [
  { value: "steps", label: "计算过程", content: "显示公式、代入过程和中间结果。" },
  { value: "warnings", label: "诊断与警告", content: "当前没有需要提示的工程异常。" },
  { value: "json", label: "结构化结果", content: <code>{'{ "validity": "VALID" }'}</code> },
];

const meta = {
  title: "06 Navigation/Tabs",
  component: Tabs,
  args: { items, defaultValue: "steps" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {};
export const Card: Story = { args: { variant: "card" } };
export const Segmented: Story = { args: { variant: "segmented" } };
export const Vertical: Story = { args: { orientation: "vertical", variant: "card" } };
