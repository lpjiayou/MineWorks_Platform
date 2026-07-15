import type { DrySolidsInputs, DrySolidsResponse } from "./types";

const STORAGE_KEY = "mineworks.drySolids.history.v1";
const MAX_ITEMS = 20;

export type DrySolidsHistoryItem = {
  id: string;
  savedAt: string;
  inputs: DrySolidsInputs;
  result: DrySolidsResponse;
};

export function saveDrySolidsResult(inputs: DrySolidsInputs, result: DrySolidsResponse): DrySolidsHistoryItem {
  const item: DrySolidsHistoryItem = {
    id: result.request_id,
    savedAt: new Date().toISOString(),
    inputs,
    result,
  };
  const current = readDrySolidsHistory();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...current.filter((entry) => entry.id !== item.id)].slice(0, MAX_ITEMS)));
  return item;
}

export function readDrySolidsHistory(): DrySolidsHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed as DrySolidsHistoryItem[] : [];
  } catch {
    return [];
  }
}
