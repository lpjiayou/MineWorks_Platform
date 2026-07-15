import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calculator, FolderSearch, SearchX } from "lucide-react";
import { Button } from "@/components/primitives/button/button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "04 Feedback/EmptyState",
  component: EmptyState,
  args: {
    icon: <Calculator />,
    title: "尚未开始计算",
    description: "输入参数后，系统将显示核心结果、计算过程和数据有效性。",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotCalculated: Story = { args: { primaryAction: <Button variant="primary">载入示例</Button> } };
export const NoSearchResults: Story = { args: { icon: <SearchX />, title: "没有找到匹配工具", description: "请修改关键词或清除筛选条件。", primaryAction: <Button>清除筛选</Button> } };
export const NoProjects: Story = { args: { icon: <FolderSearch />, title: "尚未创建项目", description: "创建项目后可保存计算记录、版本和工程资料。", primaryAction: <Button variant="primary">新建项目</Button>, secondaryAction: <Button variant="link">了解项目工作台</Button> } };
export const Compact: Story = { args: { size: "sm" } };
