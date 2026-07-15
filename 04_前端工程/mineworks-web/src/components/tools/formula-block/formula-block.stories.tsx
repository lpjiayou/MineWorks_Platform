import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FormulaBlock } from "./formula-block";

const meta = {
  title: "08 Tools/FormulaBlock",
  component: FormulaBlock,
  args: {
    title: "干固体量计算",
    version: "1.0.0",
    formula: "矿浆质量流量 Qm = Qv × ρm\n干固体量 Qs = Qm × Cw",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FormulaBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Substitution: Story = { args: { formula: "Qm = 118.37 m³/h × 1.38 t/m³ = 163.35 t/h\nQs = 163.35 t/h × 0.42 = 68.61 t/h" } };
export const Warning: Story = { args: { tone: "warning", description: "结果使用近似密度，请复核。" } };
export const Error: Story = { args: { tone: "error", formula: "无法计算：Cw 必须位于 0～1 之间。" } };
