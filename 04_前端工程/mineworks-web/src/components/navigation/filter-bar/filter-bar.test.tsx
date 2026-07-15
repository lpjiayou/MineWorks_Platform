import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "./filter-bar";

describe("FilterBar", () => {
  it("emits filter changes and clears all", () => {
    const onSelectedChange = vi.fn();
    const onQueryChange = vi.fn();
    render(<FilterBar query="磨矿" onQueryChange={onQueryChange} groups={[{ id: "discipline", label: "专业", options: [{ value: "mineral", label: "选矿" }] }]} selected={{ discipline: [] }} onSelectedChange={onSelectedChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "选矿" }));
    expect(onSelectedChange).toHaveBeenCalledWith("discipline", ["mineral"]);
    fireEvent.click(screen.getByRole("button", { name: "清除全部" }));
    expect(onQueryChange).toHaveBeenCalledWith("");
  });
});
