import type { CalculationRecord, CalculationRecordCreate, ProjectMember, ProjectRole, ProjectSummary, ReusePackage } from "./types";
import { authorizedFetch } from "@/features/auth/api";

const DEFAULT_API_BASE = "/api/v1";

export class CalculationHistoryApiError extends Error {
  constructor(message: string, readonly code = "HISTORY_API_ERROR") {
    super(message);
    this.name = "CalculationHistoryApiError";
  }
}

async function expectJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `请求失败（HTTP ${response.status}）`;
    let code = `HTTP_${response.status}`;
    try {
      const payload = await response.json() as { detail?: { message?: string; code?: string }; message?: string; code?: string };
      message = payload.detail?.message ?? payload.message ?? message;
      code = payload.detail?.code ?? payload.code ?? code;
    } catch { /* keep fallback */ }
    throw new CalculationHistoryApiError(message, code);
  }
  return await response.json() as T;
}

export function createCalculationHistoryApi(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE) {
  return {
    async listProjects(): Promise<ProjectSummary[]> {
      const response = await authorizedFetch(`${baseUrl}/projects`, { cache: "no-store" });
      const payload = await expectJson<{ items: ProjectSummary[] }>(response);
      return payload.items;
    },
    async createProject(input: { name: string; code?: string; description?: string }): Promise<ProjectSummary> {
      const response = await authorizedFetch(`${baseUrl}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return await expectJson<ProjectSummary>(response);
    },
    async listRecords(filters: { toolId?: string; projectId?: string; query?: string; limit?: number } = {}): Promise<CalculationRecord[]> {
      const params = new URLSearchParams();
      if (filters.toolId) params.set("tool_id", filters.toolId);
      if (filters.projectId) params.set("project_id", filters.projectId);
      if (filters.query) params.set("q", filters.query);
      params.set("limit", String(filters.limit ?? 100));
      const response = await authorizedFetch(`${baseUrl}/calculation-records?${params.toString()}`, { cache: "no-store" });
      const payload = await expectJson<{ items: CalculationRecord[] }>(response);
      return payload.items;
    },
    async createRecord(payload: CalculationRecordCreate): Promise<CalculationRecord> {
      const response = await authorizedFetch(`${baseUrl}/calculation-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await expectJson<CalculationRecord>(response);
    },
    async updateRecord(id: string, payload: { project_id?: string | null; clear_project?: boolean; title?: string; note?: string; tags?: string[] }): Promise<CalculationRecord> {
      const response = await authorizedFetch(`${baseUrl}/calculation-records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await expectJson<CalculationRecord>(response);
    },
    async deleteRecord(id: string): Promise<void> {
      const response = await authorizedFetch(`${baseUrl}/calculation-records/${id}`, { method: "DELETE" });
      if (!response.ok) await expectJson(response);
    },
    async getReusePackage(recordId: string, targetToolId: string): Promise<ReusePackage> {
      const params = new URLSearchParams({ target_tool_id: targetToolId });
      const response = await authorizedFetch(`${baseUrl}/calculation-records/${recordId}/reuse?${params.toString()}`, { cache: "no-store" });
      return await expectJson<ReusePackage>(response);
    },
    async getProject(id: string): Promise<ProjectSummary> {
      return await expectJson<ProjectSummary>(await authorizedFetch(`${baseUrl}/projects/${id}`, { cache: "no-store" }));
    },
    async listProjectMembers(projectId: string): Promise<ProjectMember[]> {
      return await expectJson<ProjectMember[]>(await authorizedFetch(`${baseUrl}/projects/${projectId}/members`, { cache: "no-store" }));
    },
    async addProjectMember(projectId: string, email: string, role: Exclude<ProjectRole, "owner">): Promise<ProjectMember> {
      return await expectJson<ProjectMember>(await authorizedFetch(`${baseUrl}/projects/${projectId}/members`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) }));
    },
    async updateProjectMember(projectId: string, userId: string, role: Exclude<ProjectRole, "owner">): Promise<ProjectMember> {
      return await expectJson<ProjectMember>(await authorizedFetch(`${baseUrl}/projects/${projectId}/members/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) }));
    },
    async removeProjectMember(projectId: string, userId: string): Promise<void> {
      const response = await authorizedFetch(`${baseUrl}/projects/${projectId}/members/${userId}`, { method: "DELETE" });
      if (!response.ok) await expectJson(response);
    },
  };
}
