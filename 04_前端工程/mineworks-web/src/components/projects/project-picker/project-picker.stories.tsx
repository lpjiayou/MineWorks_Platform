import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectPicker } from "./project-picker";

const projects = [
  { id: "gold", name: "某金矿选矿自动化项目", description: "浸出、CIL与解吸电积", updatedAt: "2026-07-14", access: "owner" as const },
  { id: "copper", name: "铜矿磨浮扩建项目", description: "磨矿分级与浮选物料平衡", updatedAt: "2026-07-12", access: "team" as const },
  { id: "archive", name: "历史试验项目", status: "archived" as const },
];
const meta = { title: "09 Domain/ProjectPicker", component: ProjectPicker, args: { projects, value: "gold", onValueChange: () => undefined }, tags: ["autodocs"] } satisfies Meta<typeof ProjectPicker>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Standalone: Story = { args: { value: "__standalone__" } };
export const NoProjects: Story = { args: { projects: [], value: "" } };
