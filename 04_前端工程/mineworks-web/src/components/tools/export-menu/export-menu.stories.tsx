import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ExportMenu } from "./export-menu";

const formats = [
  { id: "copy", label: "复制文本", description: "复制核心结果和单位" },
  { id: "md", label: "Markdown", extension: "md", description: "基础可追溯报告" },
  { id: "xlsx", label: "Excel", extension: "xlsx", requiredPlan: "professional" as const },
  { id: "docx", label: "Word正式报告", extension: "docx", requiredPlan: "team" as const },
];
const meta = { title: "08 Tools/ExportMenu", component: ExportMenu, args: { formats, currentPlan: "free", onExport: () => undefined }, tags: ["autodocs"] } satisfies Meta<typeof ExportMenu>;
export default meta;
type Story = StoryObj<typeof meta>;
export const FreeUser: Story = {};
export const Professional: Story = { args: { currentPlan: "professional" } };
export const Exporting: Story = { args: { exportingFormatId: "md" } };
