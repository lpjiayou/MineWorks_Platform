import { authorizedFetch } from "@/features/auth/api";
import type { DrySolidsInputs, DrySolidsRequest, DrySolidsResponse, FieldErrors, ToolFailure } from "./types";

const DEFAULT_API_BASE = "/api/v1";

export class DrySolidsApiError extends Error {
  readonly failure: ToolFailure;

  constructor(failure: ToolFailure) {
    super(failure.message);
    this.name = "DrySolidsApiError";
    this.failure = failure;
  }
}

export type DrySolidsApiClient = {
  health: (signal?: AbortSignal) => Promise<boolean>;
  calculate: (inputs: DrySolidsInputs, signal?: AbortSignal) => Promise<DrySolidsResponse>;
};

function requiredValue(value: number | null, field: string): number {
  if (value === null || Number.isNaN(value)) throw new Error(`${field} is required`);
  return value;
}

export function buildDrySolidsRequest(inputs: DrySolidsInputs): DrySolidsRequest {
  return {
    tool_id: "dry-solids-rate",
    formula_version: "1.0.0",
    inputs: {
      slurry_volume_flow: {
        value: requiredValue(inputs.slurryVolumeFlow.value, "slurryVolumeFlow"),
        unit: inputs.slurryVolumeFlow.unit,
      },
      slurry_density: {
        value: requiredValue(inputs.slurryDensity.value, "slurryDensity"),
        unit: inputs.slurryDensity.unit,
      },
      solids_mass_fraction: {
        value: requiredValue(inputs.solidsMassFraction.value, "solidsMassFraction"),
        unit: inputs.solidsMassFraction.unit,
      },
    },
  };
}

function mapFieldErrors(payload: unknown): FieldErrors | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const details = (payload as { details?: { fields?: Array<{ path?: string; message?: string }> } }).details;
  if (!details?.fields) return undefined;
  const mapped: FieldErrors = {};
  for (const item of details.fields) {
    const path = item.path ?? "";
    if (path.includes("slurry_volume_flow")) mapped.slurryVolumeFlow = item.message;
    if (path.includes("slurry_density")) mapped.slurryDensity = item.message;
    if (path.includes("solids_mass_fraction")) mapped.solidsMassFraction = item.message;
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

export function createDrySolidsApiClient(baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE): DrySolidsApiClient {
  return {
    async health(signal) {
      try {
        const response = await fetch(`${baseUrl}/health`, { signal, cache: "no-store" });
        return response.ok;
      } catch {
        return false;
      }
    },
    async calculate(inputs, signal) {
      let response: Response;
      try {
        response = await authorizedFetch(`${baseUrl}/tools/dry-solids-rate/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildDrySolidsRequest(inputs)),
          signal,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new DrySolidsApiError({ code: "REQUEST_ABORTED", message: "本次计算已取消或请求超时。" });
        }
        throw new DrySolidsApiError({ code: "SERVICE_UNAVAILABLE", message: "无法连接FastAPI计算服务。请确认后端端口8000已启动。" });
      }
      if (!response.ok) throw new DrySolidsApiError(await parseFailure(response));
      return await response.json() as DrySolidsResponse;
    },
  };
}
