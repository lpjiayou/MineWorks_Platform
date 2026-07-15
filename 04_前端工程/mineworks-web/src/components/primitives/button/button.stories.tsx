import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "02 Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "开始计算" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const WithIcons: Story = { args: { variant: "primary", leadingIcon: <Calculator size={17} />, trailingIcon: <ArrowRight size={17} /> } };
export const Loading: Story = { args: { variant: "primary", isLoading: true, children: "计算中" } };
export const Disabled: Story = { args: { disabled: true } };
