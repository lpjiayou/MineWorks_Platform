import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Calculator, Cpu, Factory, Mountain, Zap } from "lucide-react";
import { CategoryNavigation } from "./category-navigation";

const items = [
  { id: "all", label: "全部工具", description: "跨专业工具能力", count: 24, icon: <Factory /> },
  { id: "mineral", label: "选矿工程", description: "破碎、磨矿、浮选", count: 8, icon: <Calculator /> },
  { id: "mining", label: "采矿工程", description: "爆破、通风与运输", count: 3, icon: <Mountain /> },
  { id: "automation", label: "自动化", description: "控制、仪表与PLC", count: 5, icon: <Cpu /> },
  { id: "electrical", label: "电气工程", description: "负荷、短路与配电", count: 4, icon: <Zap /> },
];

function Demo() {
  const [selected, setSelected] = useState("all");
  return <CategoryNavigation items={items} selectedId={selected} onSelect={setSelected} />;
}

const meta = { title: "06 Navigation/CategoryNavigation", component: CategoryNavigation, tags: ["autodocs"] } satisfies Meta<typeof CategoryNavigation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { items, selectedId: "all", onSelect: () => undefined }, render: () => <Demo /> };
