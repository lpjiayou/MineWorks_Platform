import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Select } from "./select";

const options = [
  { value: "m3/h", label: "m³/h" },
  { value: "l/s", label: "L/s" },
  { value: "kg/s", label: "kg/s", disabled: true },
];

const meta = {
  title: "03 Forms/Select",
  component: Select,
  args: {
    options,
    defaultValue: "m3/h",
    "aria-label": "流量单位",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Placeholder: Story = { args: { defaultValue: "", placeholder: "请选择单位" } };
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };
