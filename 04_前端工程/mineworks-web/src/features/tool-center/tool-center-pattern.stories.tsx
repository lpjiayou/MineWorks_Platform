import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calculator, Cpu, Factory, Mountain } from "lucide-react";
import { CategoryNavigation } from "@/components/navigation/category-navigation/category-navigation";
import { ToolCard } from "@/components/tools/tool-card/tool-card";

function Preview() {
  return <div style={{ display: "grid", gap: 18, maxWidth: 1180 }}><CategoryNavigation selectedId="all" onSelect={() => undefined} items={[{ id: "all", label: "全部工具", description: "跨专业工具", count: 24, icon: <Factory /> }, { id: "mineral", label: "选矿工程", description: "破碎、磨矿、浮选", count: 8, icon: <Calculator /> }, { id: "mining", label: "采矿工程", description: "爆破、运输和通风", count: 3, icon: <Mountain /> }, { id: "automation", label: "自动化", description: "控制、仪表和PLC", count: 5, icon: <Cpu /> }]} /><div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14 }}><ToolCard icon={<Calculator />} name="干固体量计算" description="根据矿浆流量、密度和浓度计算干固体处理量。" category="选矿工程 / 工程计算" accessLevel="free" status="VALIDATED" isFavorite /><ToolCard icon={<Cpu />} name="PID参数仿真" description="观察比例、积分和微分参数对过程响应的影响。" category="自动化 / 仿真与控制" accessLevel="free" status="VALIDATED" /><ToolCard icon={<Factory />} name="全流程物料与金属平衡" description="计算多节点固体、水量、品位和金属闭合误差。" category="选矿工程 / 高级分析" accessLevel="professional" status="REVIEWING" isLocked /></div></div>;
}

const meta = { title: "10 Patterns/ToolCenter", component: Preview, tags: ["autodocs"], parameters: { layout: "padded" } } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
