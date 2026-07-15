import { beforeEach, describe, expect, it } from "vitest";
import { clearStoredAuthSession, readStoredAuthSession, updateStoredActiveTeam, writeStoredAuthSession } from "./session-store";

describe("auth preference store", () => {
  beforeEach(() => window.localStorage.clear());

  it("stores only the active team preference", () => {
    writeStoredAuthSession({ active_team_id: "team_a" });
    expect(readStoredAuthSession()?.active_team_id).toBe("team_a");
    expect(window.localStorage.getItem("mineworks.auth.preferences.v2")).not.toContain("access_token");
    updateStoredActiveTeam("team_b");
    expect(readStoredAuthSession()?.active_team_id).toBe("team_b");
  });

  it("clears local preferences without managing the HttpOnly session cookie", () => {
    writeStoredAuthSession({ active_team_id: null });
    clearStoredAuthSession();
    expect(readStoredAuthSession()).toBeNull();
  });
});
