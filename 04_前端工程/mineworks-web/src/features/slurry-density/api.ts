import { authorizedFetch } from "@/features/auth/api";
import type { FieldErrors, SlurryDensityInputs, SlurryDensityMode, SlurryDensityRequest, SlurryDensityResponse, ToolFailure } from "./types";

const DEFAULT_API_BASE = "/api/v1";

export class SlurryDensityApiError extends Error {
  readonly failure: ToolFailure;
  constructor(failure: ToolFailure) { super(failure.message); this.name = "SlurryDensityApiError"; this.failure = failure; }
}

export type SlurryDensityApiClient = {
  health: (signal?: AbortSignal) => Promise<boolean>;
  calculate: (mode: SlurryDensityMode, inputs: SlurryDensityInputs, signal?: AbortSignal) => Promise<SlurryDensityResponse>;
};

function requiredValue(value: number | null, field: string): number {
  if (value === null || Number.isNaN(value)) throw new Error(`${field} is required`);
  return value;
}

export function buildSlurryDensityRequest(mode: SlurryDensityMode, inputs: SlurryDensityInputs): SlurryDensityRequest {
  return {
    tool_id: "slurry-density-conversion",
    formula_version: "1.0.0",
    mode,
    inputs: {
      solids_density: { value: requiredValue(inputs.solidsDensity.value, "solidsDensity"), unit: inputs.solidsDensity.unit },
      liquid_density: { value: requiredValue(inputs.liquidDensity.value, "liquidDensity"), unit: inputs.liquidDensity.unit },
      known_value: { value: requiredValue(inputs.knownValue.value, "knownValue"), unit: inputs.knownValue.unit },
    },
  };
}

function mapFieldErrors(payload: unknown): FieldErrors | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const root = payload as Record<string, unknown>;
  const detail = root.detail && typeof root.detail === "object" ? root.detail as Record<string, unknown> : root;
  const details = detail.details && typeof detail.details === "object" ? detail.details as { fields?: Array<{ path?: string; message?: string }> } : undefined;
  if (!details?.fields) return undefined;
  const mapped: FieldErrors = {};
  for (const item of details.fields) {
    const path = item.path ?? "";
    if (path.includes("solids_density")) mapped.solidsDensity = item.message;
    if (path.includes("liquid_density")) mapped.liquidDensity = item.message;
    if (path.includes("known_value")) mapped.knownValue = item.message;
  }
  return Object.keys(mapped).length ? mapped : undefined;
}

async function parseFailure(response: Response): Promise<ToolFailure> {
  let payload: unknown;
  try { payload = await response.json(); } catch { payload = null; }
  const object = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const detail = object.detail && typeof object.detail === "object" ? object.detail as Record<string, unknown> : object;
  return {
    code: String(detail.code ?? `HTTP_${response.status}`),
    message: String(detail.message ?? object.message ?? "计算服务返回了无法处理的响应。"),
    requestId: typeof detail.request_id === "string" ? detail.request_id : typeof object.request_id === "string" ? object.request_id : undefined,
    fieldErrors: mapFieldErrors(object),
  };
}

export function createSlurryDensityApiClient(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE): SlurryDensityApiClient {
  return {
    async health(signal) {
      try { const response = await fetch(`${baseUrl}/health`, { signal, cache: "no-store" }); return response.ok; }
      catch { return false; }
    },
    async calculate(mode, inputs, signal) {
      let response: Response;
      try {
        response = await authorizedFetch(`${baseUrl}/tools/slurry-density-conversion/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildSlurryDensityRequest(mode, inputs)),
          signal,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") throw new SlurryDensityApiError({ code: "REQUEST_ABORTED", message: "本次计算已取消或请求超时。" });
        throw new SlurryDensityApiError({ code: "SERVICE_UNAVAILABLE", message: "无法连接FastAPI计算服务。请确认后端端口8000已启动。" });
      }
      if (!response.ok) throw new SlurryDensityApiError(await parseFailure(response));
      return await response.json() as SlurryDensityResponse;
    },
  };
}
