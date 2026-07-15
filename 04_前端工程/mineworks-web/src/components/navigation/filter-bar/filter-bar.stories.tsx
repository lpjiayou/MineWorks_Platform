import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FilterBar } from "./filter-bar";

const groups = [
  { id: "discipline", label: "专业方向", options: [{ value: "mineral", label: "选矿", count: 26 }, { value: "mining", label: "采矿", count: 14 }] },
  { id: "access", label: "使用权限", options: [{ value: "free", label: "免费", count: 18 }, { value: "professional", label: "专业会员", count: 12 }] },
];

function Demo() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, string[]>>({ discipline: ["mineral"], access: [] });
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState<"card" | "list">("card");
  return <FilterBar query={query} onQueryChange={setQuery} groups={groups} selected={selected} onSelectedChange={(id, values) => setSelected((current) => ({ ...current, [id]: values }))} sortOptions={[{ value: "recommended", label: "推荐排序" }, { value: "updated", label: "最近更新" }]} sortValue={sort} onSortChange={setSort} view={view} onViewChange={setView} resultCount={26} />;
}

const meta = { title: "06 Navigation/FilterBar", component: FilterBar, args: { query: "", onQueryChange: () => undefined, groups, selected: {}, onSelectedChange: () => undefined }, tags: ["autodocs"] } satisfies Meta<typeof FilterBar>;
export default meta;
type Story = StoryObj<typeof meta>;
export const ToolCenter: Story = { render: () => <Demo />, args: { query: "", onQueryChange: () => undefined, groups, selected: {}, onSelectedChange: () => undefined } };
