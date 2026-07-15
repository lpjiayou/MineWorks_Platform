import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
  it("shows a traceable request id", () => {
    render(<ErrorState title="计算失败" description="输入已保留。" requestId="req_123" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("req_123");
    expect(alert).toHaveTextContent("输入已保留。");
  });
});
