import type { SlurryDensityInputs, SlurryDensityMode, SlurryDensityResponse } from "./types";
const STORAGE_KEY = "mineworks.slurryDensity.history.v1";
const MAX_ITEMS = 20;
export type SlurryDensityHistoryItem = { id: string; savedAt: string; mode: SlurryDensityMode; inputs: SlurryDensityInputs; result: SlurryDensityResponse };
export function readSlurryDensityHistory(): SlurryDensityHistoryItem[] {
  if (typeof window === "undefined") return [];
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as SlurryDensityHistoryItem[] : []; } catch { return []; }
}
export function saveSlurryDensityResult(mode: SlurryDensityMode, inputs: SlurryDensityInputs, result: SlurryDensityResponse): SlurryDensityHistoryItem {
  const item = { id: result.request_id, savedAt: new Date().toISOString(), mode, inputs, result };
  const current = readSlurryDensityHistory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...current.filter((entry) => entry.id !== item.id)].slice(0, MAX_ITEMS)));
  return item;
}
