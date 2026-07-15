import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectPicker } from "./project-picker";

const projects = [{ id: "p1", name: "金矿项目" }, { id: "p2", name: "铜矿项目" }];

describe("ProjectPicker", () => {
  it("filters projects and announces selection", () => {
    const onValueChange = vi.fn();
    render(<ProjectPicker projects={projects} value="p1" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole("searchbox", { name: "搜索项目" }), { target: { value: "铜" } });
    expect(screen.queryByText("金矿项目")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("铜矿项目"));
    expect(onValueChange).toHaveBeenCalledWith("p2");
  });
});
