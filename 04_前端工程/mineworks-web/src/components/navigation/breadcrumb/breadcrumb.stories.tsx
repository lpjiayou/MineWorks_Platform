import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Breadcrumb } from "./breadcrumb";

const meta = { title: "06 Navigation/Breadcrumb", component: Breadcrumb, args: { items: [{ label: "首页", href: "/" }, { label: "工具中心", href: "/tools" }, { label: "选矿计算", href: "/tools/mineral" }, { label: "干固体量计算" }] }, tags: ["autodocs"] } satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongPath: Story = { args: { items: [{ label: "首页", href: "/" }, { label: "项目工作台", href: "/projects" }, { label: "某金矿项目", href: "/projects/gold" }, { label: "选矿模块", href: "/mineral" }, { label: "物料平衡", href: "/balance" }, { label: "计算记录" }] } };
export const CurrentOnly: Story = { args: { items: [{ label: "工具中心" }] } };
