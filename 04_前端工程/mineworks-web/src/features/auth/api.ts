import { clearStoredAuthSession, readStoredAuthSession } from "./session-store";
import type { AuditLog, AuthIdentity, AuthSession, AuthSessionSummary, AuthTeam, TeamInvitation, TeamMember, TeamRole } from "./types";

const DEFAULT_API_BASE = "/api/v1";

export class AuthApiError extends Error {
  constructor(message: string, readonly code = "AUTH_API_ERROR", readonly status = 0) {
    super(message);
    this.name = "AuthApiError";
  }
}

export async function expectApiJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `请求失败（HTTP ${response.status}）`;
    let code = `HTTP_${response.status}`;
    try {
      const payload = await response.json() as { detail?: { message?: string; code?: string }; message?: string; code?: string };
      message = payload.detail?.message ?? payload.message ?? message;
      code = payload.detail?.code ?? payload.code ?? code;
    } catch { /* fallback */ }
    throw new AuthApiError(message, code, response.status);
  }
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

function isUnsafeMethod(method: string | undefined): boolean {
  return !["GET", "HEAD", "OPTIONS", "TRACE"].includes((method ?? "GET").toUpperCase());
}

export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const preferences = readStoredAuthSession();
  const headers = new Headers(init.headers);
  if (preferences?.active_team_id) headers.set("X-Team-Id", preferences.active_team_id);
  if (isUnsafeMethod(init.method)) {
    const csrfToken = readCookie("mw_csrf");
    if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(input, { ...init, headers, credentials: "include" });
  if (response.status === 401) clearStoredAuthSession();
  return response;
}

export function createAuthApi(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE) {
  return {
    async register(input: { email: string; password: string; display_name: string; team_name?: string }): Promise<AuthSession> {
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), credentials: "include",
      });
      return await expectApiJson<AuthSession>(response);
    },
    async login(input: { email: string; password: string }): Promise<AuthSession> {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), credentials: "include",
      });
      return await expectApiJson<AuthSession>(response);
    },
    async me(): Promise<AuthIdentity> {
      return await expectApiJson<AuthIdentity>(await authorizedFetch(`${baseUrl}/auth/me`, { cache: "no-store" }));
    },
    async logout(): Promise<void> {
      const response = await authorizedFetch(`${baseUrl}/auth/logout`, { method: "POST" });
      if (!response.ok && response.status !== 401) await expectApiJson(response);
    },
    async listSessions(): Promise<AuthSessionSummary[]> {
      return await expectApiJson<AuthSessionSummary[]>(await authorizedFetch(`${baseUrl}/auth/sessions`, { cache: "no-store" }));
    },
    async revokeOtherSessions(): Promise<{ revoked: number }> {
      return await expectApiJson<{ revoked: number }>(await authorizedFetch(`${baseUrl}/auth/sessions/revoke-others`, { method: "POST" }));
    },
    async createTeam(name: string): Promise<AuthTeam> {
      return await expectApiJson<AuthTeam>(await authorizedFetch(`${baseUrl}/teams`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      }));
    },
    async listMembers(teamId: string): Promise<TeamMember[]> {
      return await expectApiJson<TeamMember[]>(await authorizedFetch(`${baseUrl}/teams/${teamId}/members`, { cache: "no-store" }));
    },
    async addMember(teamId: string, email: string, role: TeamRole): Promise<TeamMember> {
      return await expectApiJson<TeamMember>(await authorizedFetch(`${baseUrl}/teams/${teamId}/members`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }),
      }));
    },
    async updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<TeamMember> {
      return await expectApiJson<TeamMember>(await authorizedFetch(`${baseUrl}/teams/${teamId}/members/${userId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }),
      }));
    },
    async removeMember(teamId: string, userId: string): Promise<void> {
      await expectApiJson<void>(await authorizedFetch(`${baseUrl}/teams/${teamId}/members/${userId}`, { method: "DELETE" }));
    },
    async createInvitation(teamId: string, email: string, role: TeamRole): Promise<TeamInvitation> {
      return await expectApiJson<TeamInvitation>(await authorizedFetch(`${baseUrl}/teams/${teamId}/invitations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }),
      }));
    },
    async listInvitations(teamId: string): Promise<TeamInvitation[]> {
      return await expectApiJson<TeamInvitation[]>(await authorizedFetch(`${baseUrl}/teams/${teamId}/invitations`, { cache: "no-store" }));
    },
    async acceptInvitation(token: string): Promise<AuthTeam> {
      return await expectApiJson<AuthTeam>(await authorizedFetch(`${baseUrl}/team-invitations/accept`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      }));
    },
    async listAuditLogs(teamId: string): Promise<AuditLog[]> {
      return await expectApiJson<AuditLog[]>(await authorizedFetch(`${baseUrl}/teams/${teamId}/audit-logs`, { cache: "no-store" }));
    },
  };
}
