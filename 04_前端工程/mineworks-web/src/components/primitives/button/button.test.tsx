import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders and handles click", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>开始计算</Button>);
    fireEvent.click(screen.getByRole("button", { name: "开始计算" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("blocks click while loading", () => {
    const onClick = vi.fn();
    render(<Button isLoading onClick={onClick}>计算中</Button>);
    fireEvent.click(screen.getByRole("button", { name: "计算中" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
