import type { StoredAuthSession } from "./types";

const STORAGE_KEY = "mineworks.auth.preferences.v2";
const CHANGE_EVENT = "mineworks-auth-change";

export function readStoredAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as StoredAuthSession : null;
  } catch {
    return null;
  }
}

export function writeStoredAuthSession(session: StoredAuthSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearStoredAuthSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function updateStoredActiveTeam(activeTeamId: string | null): void {
  writeStoredAuthSession({ active_team_id: activeTeamId });
}

export function subscribeAuthStore(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
