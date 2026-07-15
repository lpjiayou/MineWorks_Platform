import type { Meta, StoryObj } from "@storybook/react";
import { SlurryDensityCalculator } from "./slurry-density-calculator";
import type { SlurryDensityApiClient } from "./api";
const mockClient: SlurryDensityApiClient = { health: async () => true, calculate: async () => ({ request_id: "req_storybook_density_001", tool_id: "slurry-density-conversion", formula_version: "1.0.0", computed_at: new Date().toISOString(), validity: "VALID", summary: "矿浆密度1.360 t/m³，固体质量浓度42.00%。", normalized_inputs: { mode: "from_mass_concentration", solids_density_t_m3: 2.7, liquid_density_t_m3: 1, known_value: 0.42, known_quantity: "mass_fraction" }, results: { slurry_density: { value: 1.359516616, unit: "t/m³", precision: 3 }, solids_mass_fraction: { value: 42, unit: "%", precision: 2 }, solids_volume_fraction: { value: 21.148036254, unit: "%", precision: 2 }, liquid_mass_fraction: { value: 58, unit: "%", precision: 2 }, liquid_volume_fraction: { value: 78.851963746, unit: "%", precision: 2 } }, steps: [], warnings: [], assumptions: ["Storybook模拟结果。"] }) };
const meta = { title: "10 Patterns/SlurryDensityTool", component: SlurryDensityCalculator, parameters: { layout: "padded" }, tags: ["autodocs"] } satisfies Meta<typeof SlurryDensityCalculator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { apiClient: mockClient, checkHealth: false } };
