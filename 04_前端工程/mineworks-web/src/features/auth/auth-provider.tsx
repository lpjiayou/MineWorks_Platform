"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createAuthApi } from "./api";
import { clearStoredAuthSession, readStoredAuthSession, subscribeAuthStore, updateStoredActiveTeam } from "./session-store";
import type { AuthIdentity } from "./types";

type AuthStatus = "loading" | "guest" | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  identity: AuthIdentity | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; display_name: string; team_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  switchTeam: (teamId: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo(() => createAuthApi(), []);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await api.me();
      setIdentity(next);
      setStatus("authenticated");
      const preferred = readStoredAuthSession()?.active_team_id;
      if (!preferred && next.active_team_id) updateStoredActiveTeam(next.active_team_id);
    } catch {
      clearStoredAuthSession();
      setIdentity(null);
      setStatus("guest");
    }
  }, [api]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    const unsubscribe = subscribeAuthStore(() => void refresh());
    return () => { window.clearTimeout(timer); unsubscribe(); };
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.login({ email, password });
    updateStoredActiveTeam(session.active_team_id);
    setIdentity(session);
    setStatus("authenticated");
  }, [api]);

  const register = useCallback(async (input: { email: string; password: string; display_name: string; team_name?: string }) => {
    const session = await api.register(input);
    updateStoredActiveTeam(session.active_team_id);
    setIdentity(session);
    setStatus("authenticated");
  }, [api]);

  const logout = useCallback(async () => {
    try { await api.logout(); } finally { clearStoredAuthSession(); setIdentity(null); setStatus("guest"); }
  }, [api]);

  const switchTeam = useCallback(async (teamId: string) => {
    updateStoredActiveTeam(teamId);
    await refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => ({
    status, identity, login, register, logout, refresh, switchTeam,
    hasPermission: (permission) => identity?.permissions.includes(permission) ?? false,
  }), [identity, login, logout, refresh, register, status, switchTeam]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
