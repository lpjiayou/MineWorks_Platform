import type { AccessLevel, ToolStatus } from "@/types/status";

export type ToolDiscipline =
  | "all"
  | "mineral-processing"
  | "mining"
  | "automation"
  | "electrical"
  | "civil"
  | "equipment"
  | "general";

export type ToolCategory =
  | "calculation"
  | "analysis"
  | "design"
  | "selection"
  | "simulation"
  | "knowledge";

export type ToolAvailability = "available" | "preview" | "planned";
export type ToolSort = "recommended" | "newest" | "popular" | "name";
export type ToolView = "card" | "list";

export type ToolIconName =
  | "calculator"
  | "droplets"
  | "scale"
  | "workflow"
  | "chart"
  | "flask"
  | "gauge"
  | "settings"
  | "cpu"
  | "cable"
  | "zap"
  | "pump"
  | "conveyor"
  | "book"
  | "mountain"
  | "wind"
  | "building"
  | "database";

export type ToolDefinition = {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  discipline: Exclude<ToolDiscipline, "all">;
  category: ToolCategory;
  tags: string[];
  accessLevel: AccessLevel;
  status: ToolStatus;
  availability: ToolAvailability;
  version: string;
  updatedAt: string;
  icon: ToolIconName;
  featured?: boolean;
  popularity: number;
};

export type ToolCenterQueryState = {
  query: string;
  discipline: ToolDiscipline;
  categories: ToolCategory[];
  accessLevels: AccessLevel[];
  statuses: ToolStatus[];
  sort: ToolSort;
  view: ToolView;
  favoritesOnly: boolean;
};
