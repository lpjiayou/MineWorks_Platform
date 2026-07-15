import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RadioGroup } from "./radio-group";

const options = [
  { value: "current", label: "当前项目", description: "保存到某金矿选矿改造项目。" },
  { value: "standalone", label: "独立记录", description: "不关联现有项目。" },
  { value: "new", label: "新建项目", description: "创建项目后保存。" },
];

const meta = {
  title: "02 Primitives/RadioGroup",
  component: RadioGroup,
  args: {
    label: "保存位置",
    options,
    defaultValue: "current",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {};
export const Horizontal: Story = { args: { orientation: "horizontal" } };
export const CardOptions: Story = { args: { variant: "card", orientation: "horizontal" } };
export const Disabled: Story = { args: { disabled: true } };
