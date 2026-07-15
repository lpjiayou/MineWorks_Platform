"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchInput } from "./search-input";

function InteractiveSearch({ loading = false }: { loading?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <div style={{ width: 420, maxWidth: "100%" }}>
      <SearchInput
        value={value}
        onValueChange={setValue}
        placeholder="搜索工具、设备或资料"
        shortcutHint="Ctrl K"
        isLoading={loading}
        statusText={value ? `正在搜索：${value}` : "等待输入"}
      />
    </div>
  );
}

const meta = {
  title: "03 Forms/SearchInput",
  component: SearchInput,
  args: {
    value: "",
    onValueChange: () => undefined,
    placeholder: "搜索工具、设备或资料",
  },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <InteractiveSearch /> };
export const Loading: Story = { render: () => <InteractiveSearch loading /> };
export const WithValue: Story = { args: { value: "干固体量", shortcutHint: "Ctrl K" } };
export const Disabled: Story = { args: { disabled: true, value: "在线仪表" } };
