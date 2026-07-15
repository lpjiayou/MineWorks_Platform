import { describe, expect, it } from "vitest";
import { TOOL_CATALOG } from "./tool-data";
import { DEFAULT_TOOL_QUERY, filterAndSortTools, parseToolQuery, serializeToolQuery } from "./tool-query";

describe("tool query", () => {
  it("round-trips URL state", () => {
    const state = { ...DEFAULT_TOOL_QUERY, query: "矿浆", discipline: "mineral-processing" as const, categories: ["calculation" as const], accessLevels: ["free" as const], favoritesOnly: true, view: "list" as const };
    const parsed = parseToolQuery(new URLSearchParams(serializeToolQuery(state)));
    expect(parsed).toEqual(state);
  });

  it("filters by text, discipline, access and favorites", () => {
    const result = filterAndSortTools(TOOL_CATALOG, { ...DEFAULT_TOOL_QUERY, query: "矿浆", discipline: "mineral-processing", accessLevels: ["free"], favoritesOnly: true }, new Set(["dry-solids-rate"]));
    expect(result.map((tool) => tool.id)).toEqual(["dry-solids-rate"]);
  });

  it("keeps recommended tools ahead of normal tools", () => {
    const result = filterAndSortTools(TOOL_CATALOG, DEFAULT_TOOL_QUERY);
    expect(result[0]?.featured).toBe(true);
  });
});
