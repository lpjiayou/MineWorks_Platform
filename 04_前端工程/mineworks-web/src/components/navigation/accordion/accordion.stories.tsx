import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/feedback/badge/badge";
import { Accordion } from "./accordion";

const items = [
  { value: "scope", label: "适用范围", content: "适用于磨矿、浮选、浓密和浸出等连续矿浆物流。" },
  { value: "source", label: "数据来源", content: "支持手动输入、项目数据、导入数据和在线仪表数据。", meta: <Badge tone="info">4类来源</Badge> },
  { value: "version", label: "模型版本", content: "公式版本1.0.0；状态为教学验证。" },
];

const meta = {
  title: "06 Navigation/Accordion",
  component: Accordion,
  args: { items, defaultValue: ["scope"] },
  tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};
export const Multiple: Story = { args: { type: "multiple", defaultValue: ["scope", "source"] } };
export const NonCollapsible: Story = { args: { collapsible: false } };
export const WithDisabledItem: Story = { args: { items: [...items, { value: "audit", label: "企业审核记录", content: "当前套餐未开通。", disabled: true }] } };
