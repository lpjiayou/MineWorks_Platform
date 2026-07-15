import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/button";
import { NumberInput } from "@/components/forms/number-input/number-input";
import { Field } from "./field";

const meta = {
  title: "03 Forms/Field",
  component: Field,
  args: {
    label: "矿浆密度",
    children: <NumberInput value={1.38} onValueChange={() => undefined} />,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { helpText: "请输入现场检测或项目设计值。" },
};

export const Required: Story = {
  args: { required: true, helpText: "该参数用于干固体量计算。" },
};

export const Warning: Story = {
  args: { warningText: "高于典型矿浆密度，请确认介质和单位。" },
};

export const Error: Story = {
  args: {
    errorText: "矿浆密度必须大于0。",
    children: <NumberInput value={0} validationState="error" onValueChange={() => undefined} />,
  },
};

export const WithLabelAction: Story = {
  args: {
    helpText: "参数可从项目模板读取。",
    labelAction: <Button variant="link" size="sm">从项目读取</Button>,
  },
};
