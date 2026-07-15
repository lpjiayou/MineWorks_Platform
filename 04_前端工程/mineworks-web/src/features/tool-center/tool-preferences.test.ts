import { describe, expect, it } from "vitest";
import { addRecentTool, parseStoredIds } from "./tool-preferences";

describe("tool preferences", () => {
  it("parses unique string ids", () => {
    expect(parseStoredIds('["a","b","a",1]')).toEqual(["a", "b"]);
    expect(parseStoredIds("bad json")).toEqual([]);
  });

  it("moves an opened tool to the front and applies the limit", () => {
    expect(addRecentTool(["a", "b", "c"], "b", 3)).toEqual(["b", "a", "c"]);
    expect(addRecentTool(["a", "b", "c"], "d", 3)).toEqual(["d", "a", "b"]);
  });
});
