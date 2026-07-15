import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoadingSkeleton } from "./loading-skeleton";

const meta = {
  title: "04 Feedback/LoadingSkeleton",
  component: LoadingSkeleton,
  args: { label: "工程数据加载中" },
  tags: ["autodocs"],
} satisfies Meta<typeof LoadingSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = { args: { variant: "text", lines: 4 } };
export const Metric: Story = { args: { variant: "metric" } };
export const ToolCard: Story = { args: { variant: "card" } };
export const Table: Story = { args: { variant: "table", rows: 5 } };
export const Circle: Story = { args: { variant: "circle" } };
