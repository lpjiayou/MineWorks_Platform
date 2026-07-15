import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EngineeringValue } from "./engineering-value";
const meta = { title: "09 Domain/EngineeringValue", component: EngineeringValue, tags: ["autodocs"] } satisfies Meta<typeof EngineeringValue>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DrySolids: Story = { args: { value: 68.61, unit: "t/h", label: "干固体量", emphasize: true } };
export const Zero: Story = { args: { value: 0, unit: "m³/h", precision: 2 } };
export const Missing: Story = { args: { value: null, unit: "kg/h" } };
export const Invalid: Story = { args: { value: Number.NaN, unit: "t/h" } };
