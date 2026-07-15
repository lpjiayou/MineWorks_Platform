import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryNavigation } from "./category-navigation";

describe("CategoryNavigation", () => {
  it("marks the selected category and emits selection", () => {
    const onSelect = vi.fn();
    render(<CategoryNavigation items={[{ id: "all", label: "全部工具", count: 2 }, { id: "mineral", label: "选矿工程", count: 1 }]} selectedId="all" onSelect={onSelect} />);
    expect(screen.getByRole("button", { name: /全部工具/ })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: /选矿工程/ }));
    expect(onSelect).toHaveBeenCalledWith("mineral");
  });
});
