import type { Meta, StoryObj } from "@storybook/react";
import { DrySolidsCalculator } from "./dry-solids-calculator";
import type { DrySolidsApiClient } from "./api";

const mockClient: DrySolidsApiClient = {
  health: async () => true,
  calculate: async () => ({
    request_id: "req_storybook_001",
    tool_id: "dry-solids-rate",
    formula_version: "1.0.0",
    computed_at: new Date().toISOString(),
    validity: "VALID",
    summary: "干固体量为68.61 t/h。",
    normalized_inputs: { slurry_volume_flow_m3_h: 118.37, slurry_density_t_m3: 1.38, solids_mass_fraction: 0.42 },
    results: {
      slurry_mass_flow: { value: 163.3506, unit: "t/h", precision: 2 },
      dry_solids_rate: { value: 68.607252, unit: "t/h", precision: 2 },
      water_mass_flow: { value: 94.743348, unit: "t/h", precision: 2 },
    },
    steps: [], warnings: [], assumptions: ["Storybook模拟结果。"],
  }),
};

const meta = { title: "10 Patterns/DrySolidsTool", component: DrySolidsCalculator, parameters: { layout: "padded" }, tags: ["autodocs"] } satisfies Meta<typeof DrySolidsCalculator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { apiClient: mockClient, checkHealth: false } };
