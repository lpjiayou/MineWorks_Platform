import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { UnitValue } from "@/lib/units/types";
import { UnitInput } from "./unit-input";

const meta = { title: "03 Forms/UnitInput", component: UnitInput, tags: ["autodocs"] } satisfies Meta<typeof UnitInput>;
export default meta;
type Story = StoryObj<typeof meta>;

function VolumeFlowDemo() {
  const [value, setValue] = useState<UnitValue>({ value: 118.37, unit: "m3/h" });
  return <div style={{ width: 360 }}><UnitInput label="矿浆体积流量" quantity="volumeFlow" value={value} onChange={setValue} required helpText="允许0；可在m³/h与L/s之间换算。" /></div>;
}

export const VolumeFlow: Story = {
  args: { label: "矿浆体积流量", quantity: "volumeFlow", value: { value: 118.37, unit: "m3/h" }, onChange: () => undefined },
  render: () => <VolumeFlowDemo />,
};
export const DensityWarning: Story = { args: { label: "矿浆密度", quantity: "density", value: { value: 4.2, unit: "t/m3" }, onChange: () => undefined, warningText: "超出典型工程范围，请复核。" } };
export const ZeroValue: Story = { args: { label: "矿浆体积流量", quantity: "volumeFlow", value: { value: 0, unit: "m3/h" }, onChange: () => undefined, helpText: "0是有效数值。" } };
