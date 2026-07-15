import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  it("reports value changes and submits with Enter", () => {
    const onValueChange = vi.fn();
    const onSearch = vi.fn();
    render(<SearchInput value="干固体量" onValueChange={onValueChange} onSearch={onSearch} />);
    const input = screen.getByRole("searchbox", { name: "搜索" });
    fireEvent.change(input, { target: { value: "物料平衡" } });
    expect(onValueChange).toHaveBeenCalledWith("物料平衡");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSearch).toHaveBeenCalledWith("干固体量");
  });

  it("clears with its clear button", () => {
    const onValueChange = vi.fn();
    render(<SearchInput value="球磨机" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "清除搜索内容" }));
    expect(onValueChange).toHaveBeenCalledWith("");
  });
});
