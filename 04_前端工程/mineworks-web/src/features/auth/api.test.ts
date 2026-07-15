import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizedFetch } from "./api";
import { writeStoredAuthSession } from "./session-store";

describe("authorizedFetch", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = "mw_csrf=; Max-Age=0; path=/";
  });

  it("uses credentials, active-team and CSRF headers without exposing a bearer token", async () => {
    writeStoredAuthSession({ active_team_id: "team_demo" });
    document.cookie = "mw_csrf=csrf-demo; path=/";
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBeNull();
      expect(headers.get("X-Team-Id")).toBe("team_demo");
      expect(headers.get("X-CSRF-Token")).toBe("csrf-demo");
      expect(init?.credentials).toBe("include");
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    await authorizedFetch("/api/v1/projects", { method: "POST" });
    expect(fetchMock).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});
