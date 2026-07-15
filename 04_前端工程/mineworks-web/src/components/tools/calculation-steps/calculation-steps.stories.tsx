import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalculationSteps } from "./calculation-steps";

const steps = [
  { id: "mass", title: "计算矿浆质量流量", formula: "Qm = Qv × ρm", substitutedExpression: "118.37 × 1.38 = 163.35", result: { value: 163.35, unit: "t/h", precision: 2 } },
  { id: "solid", title: "计算干固体量", formula: "Qs = Qm × Cw", substitutedExpression: "163.35 × 0.42 = 68.61", result: { value: 68.61, unit: "t/h", precision: 2 } },
  { id: "check", title: "一致性检查", formula: "Qm = Qs + Qw", note: "闭合误差小于0.01%。", tone: "info" as const },
];

const meta = { title: "08 Tools/CalculationSteps", component: CalculationSteps, args: { steps }, tags: ["autodocs"] } satisfies Meta<typeof CalculationSteps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Collapsed: Story = { args: { defaultExpandedIds: [] } };
export const WarningStep: Story = { args: { steps: [...steps.slice(0, 2), { id: "warning", title: "理论密度复核", formula: "偏差 = 7.42%", tone: "warning", note: "建议确认固体密度或浓度测量。" }] } };
