import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ValidityBadge } from "./validity-badge";
const meta = { title: "09 Domain/ValidityBadge", component: ValidityBadge, tags: ["autodocs"] } satisfies Meta<typeof ValidityBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Valid: Story = { args: { validity: "VALID" } };
export const Caution: Story = { args: { validity: "CAUTION" } };
export const Inconsistent: Story = { args: { validity: "INCONSISTENT" } };
export const Missing: Story = { args: { validity: "MISSING" } };
