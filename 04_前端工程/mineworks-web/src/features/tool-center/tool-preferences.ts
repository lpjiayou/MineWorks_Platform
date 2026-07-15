"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export const FAVORITES_STORAGE_KEY = "mineworks.toolFavorites.v1";
export const RECENT_STORAGE_KEY = "mineworks.recentTools.v1";
const CHANGE_EVENT = "mineworks-tool-preferences-change";

export function parseStoredIds(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((item): item is string => typeof item === "string" && item.length > 0))];
  } catch {
    return [];
  }
}

export function addRecentTool(current: string[], id: string, limit = 8): string[] {
  return [id, ...current.filter((item) => item !== id)].slice(0, limit);
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getStorageSnapshot(key: string): string {
  return window.localStorage.getItem(key) ?? "[]";
}

function writeStorage(key: string, ids: string[]): void {
  window.localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useToolPreferences() {
  const favoritesSnapshot = useSyncExternalStore(subscribe, () => getStorageSnapshot(FAVORITES_STORAGE_KEY), () => "[]");
  const recentSnapshot = useSyncExternalStore(subscribe, () => getStorageSnapshot(RECENT_STORAGE_KEY), () => "[]");
  const isReady = useSyncExternalStore(subscribe, () => true, () => false);
  const favorites = useMemo(() => parseStoredIds(favoritesSnapshot), [favoritesSnapshot]);
  const recent = useMemo(() => parseStoredIds(recentSnapshot), [recentSnapshot]);

  const toggleFavorite = useCallback((id: string) => {
    const current = parseStoredIds(getStorageSnapshot(FAVORITES_STORAGE_KEY));
    const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current];
    writeStorage(FAVORITES_STORAGE_KEY, next);
    return next.includes(id);
  }, []);

  const recordRecent = useCallback((id: string) => {
    writeStorage(RECENT_STORAGE_KEY, addRecentTool(parseStoredIds(getStorageSnapshot(RECENT_STORAGE_KEY)), id));
  }, []);

  return { favorites, recent, isReady, toggleFavorite, recordRecent };
}
