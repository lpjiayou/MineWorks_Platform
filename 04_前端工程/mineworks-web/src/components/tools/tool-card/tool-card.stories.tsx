import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calculator, Workflow } from "lucide-react";
import { ToolCard } from "./tool-card";
const meta = { title: "08 Tools/ToolCard", component: ToolCard, tags: ["autodocs"] } satisfies Meta<typeof ToolCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const FreeValidated: Story = { args: { icon: <Calculator />, name: "干固体量计算", description: "根据矿浆体积流量、密度和固体质量分数计算干固体处理量。", category: "选矿工具 / 浆体计算", accessLevel: "free", status: "VALIDATED", isFavorite: true, version: "1.0.0", updatedAt: "2026-07-14" } };
export const ProfessionalReviewing: Story = { args: { icon: <Workflow />, name: "全流程物料与金属平衡", description: "连接多个工艺节点，计算固体、水量和金属闭合误差。", category: "选矿工具 / 高级分析", accessLevel: "professional", status: "REVIEWING", isLocked: true, availability: "preview" } };
export const ListView: Story = { args: { ...FreeValidated.args, variant: "list" } };
