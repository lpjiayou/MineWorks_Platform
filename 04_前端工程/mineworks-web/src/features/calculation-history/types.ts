export type ProjectRole = "owner" | "manager" | "editor" | "viewer";

export type ProjectSummary = {
  id: string;
  name: string;
  code: string | null;
  description: string;
  status: "active" | "archived";
  team_id: string | null;
  owner_user_id: string | null;
  created_by: string | null;
  visibility: "team" | "private";
  my_role: ProjectRole | null;
  member_count: number;
  record_count: number;
  created_at: string;
  updated_at: string;
};

export type ReuseMapping = {
  target_tool_id: string;
  target_field: string;
  target_unit: string;
  target_mode?: string | null;
};

export type ReusableOutput = {
  key: string;
  label: string;
  value: number;
  unit: string;
  quantity: string;
  mappings: ReuseMapping[];
};

export type CalculationRecordCreate = {
  source_request_id: string;
  tool_id: string;
  tool_name: string;
  tool_version: string;
  formula_version: string;
  title: string;
  project_id?: string | null;
  data_source: string;
  validity: string;
  computed_at: string;
  inputs: Record<string, unknown>;
  normalized_inputs: Record<string, unknown>;
  results: Record<string, unknown>;
  steps: Array<Record<string, unknown>>;
  warnings: Array<Record<string, unknown>>;
  assumptions: string[];
  reusable_outputs: ReusableOutput[];
  tags: string[];
  note: string;
};

export type CalculationRecord = CalculationRecordCreate & {
  id: string;
  saved_at: string;
  updated_at: string;
  project: ProjectSummary | null;
};

export type ReuseValue = {
  source_key: string;
  source_label: string;
  target_field: string;
  value: number;
  unit: string;
  target_mode?: string | null;
};

export type ReusePackage = {
  record_id: string;
  source_tool_id: string;
  source_tool_name: string;
  target_tool_id: string;
  values: ReuseValue[];
  warnings: string[];
};

export type ProjectMember = { user_id: string; email: string; display_name: string; role: ProjectRole; status: "active" | "suspended"; created_at: string; updated_at: string; };
