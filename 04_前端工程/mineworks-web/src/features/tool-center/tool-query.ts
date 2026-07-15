import type { AccessLevel, ToolStatus } from "@/types/status";
import type { ToolCenterQueryState, ToolCategory, ToolDefinition, ToolDiscipline, ToolSort, ToolView } from "./types";

const disciplines: ToolDiscipline[] = ["all", "mineral-processing", "mining", "automation", "electrical", "civil", "equipment", "general"];
const categories: ToolCategory[] = ["calculation", "analysis", "design", "selection", "simulation", "knowledge"];
const accessLevels: AccessLevel[] = ["free", "professional", "team", "enterprise"];
const statuses: ToolStatus[] = ["DRAFT", "REVIEWING", "VALIDATED", "TEACHING", "DEPRECATED", "DISABLED"];
const sorts: ToolSort[] = ["recommended", "newest", "popular", "name"];
const views: ToolView[] = ["card", "list"];

export const DEFAULT_TOOL_QUERY: ToolCenterQueryState = {
  query: "",
  discipline: "all",
  categories: [],
  accessLevels: [],
  statuses: [],
  sort: "recommended",
  view: "card",
  favoritesOnly: false,
};

function parseList<T extends string>(value: string | null, allowed: readonly T[]): T[] {
  if (!value) return [];
  return [...new Set(value.split(",").filter((item): item is T => allowed.includes(item as T)))];
}

export function parseToolQuery(params: Pick<URLSearchParams, "get">): ToolCenterQueryState {
  const disciplineValue = params.get("discipline") as ToolDiscipline | null;
  const sortValue = params.get("sort") as ToolSort | null;
  const viewValue = params.get("view") as ToolView | null;
  return {
    query: params.get("q")?.trim() ?? "",
    discipline: disciplineValue && disciplines.includes(disciplineValue) ? disciplineValue : "all",
    categories: parseList(params.get("category"), categories),
    accessLevels: parseList(params.get("access"), accessLevels),
    statuses: parseList(params.get("status"), statuses),
    sort: sortValue && sorts.includes(sortValue) ? sortValue : "recommended",
    view: viewValue && views.includes(viewValue) ? viewValue : "card",
    favoritesOnly: params.get("favorites") === "1",
  };
}

export function serializeToolQuery(state: ToolCenterQueryState): string {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.discipline !== "all") params.set("discipline", state.discipline);
  if (state.categories.length) params.set("category", state.categories.join(","));
  if (state.accessLevels.length) params.set("access", state.accessLevels.join(","));
  if (state.statuses.length) params.set("status", state.statuses.join(","));
  if (state.sort !== "recommended") params.set("sort", state.sort);
  if (state.view !== "card") params.set("view", state.view);
  if (state.favoritesOnly) params.set("favorites", "1");
  return params.toString();
}

function textMatches(tool: ToolDefinition, query: string): boolean {
  const words = query.toLocaleLowerCase("zh-CN").split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = [tool.name, tool.description, ...tool.tags].join(" ").toLocaleLowerCase("zh-CN");
  return words.every((word) => haystack.includes(word));
}

export function filterAndSortTools(
  tools: ToolDefinition[],
  state: ToolCenterQueryState,
  favoriteIds: ReadonlySet<string> = new Set(),
): ToolDefinition[] {
  const filtered = tools.filter((tool) => {
    if (!textMatches(tool, state.query)) return false;
    if (state.discipline !== "all" && tool.discipline !== state.discipline) return false;
    if (state.categories.length && !state.categories.includes(tool.category)) return false;
    if (state.accessLevels.length && !state.accessLevels.includes(tool.accessLevel)) return false;
    if (state.statuses.length && !state.statuses.includes(tool.status)) return false;
    if (state.favoritesOnly && !favoriteIds.has(tool.id)) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (state.sort === "name") return a.name.localeCompare(b.name, "zh-CN");
    if (state.sort === "newest") return b.updatedAt.localeCompare(a.updatedAt);
    if (state.sort === "popular") return b.popularity - a.popularity;
    return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.popularity - a.popularity || a.name.localeCompare(b.name, "zh-CN");
  });
}

export function countByDiscipline(tools: ToolDefinition[]): Record<ToolDiscipline, number> {
  const result: Record<ToolDiscipline, number> = {
    all: tools.length,
    "mineral-processing": 0,
    mining: 0,
    automation: 0,
    electrical: 0,
    civil: 0,
    equipment: 0,
    general: 0,
  };
  tools.forEach((tool) => { result[tool.discipline] += 1; });
  return result;
}
