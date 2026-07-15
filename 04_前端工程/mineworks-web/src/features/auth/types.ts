export type AccessPlan = "free" | "professional" | "team" | "enterprise";
export type TeamRole = "owner" | "admin" | "engineer" | "viewer";
export type ProjectRole = "owner" | "manager" | "editor" | "viewer";

export type AuthUser = {
  id: string;
  email: string;
  display_name: string;
  status: "active" | "disabled";
  plan: AccessPlan;
  created_at: string;
  last_login_at: string | null;
};

export type AuthTeam = {
  id: string;
  name: string;
  slug: string;
  plan: AccessPlan;
  status: "active" | "archived";
  role: TeamRole;
  member_count: number;
  created_at: string;
  updated_at: string;
};

export type AuthIdentity = {
  user: AuthUser;
  teams: AuthTeam[];
  active_team_id: string | null;
  permissions: string[];
};

export type AuthSession = AuthIdentity & {
  access_token?: string | null;
  token_type: "cookie" | "bearer";
  expires_at: string;
};

export type StoredAuthSession = {
  active_team_id: string | null;
};

export type TeamMember = {
  user_id: string;
  email: string;
  display_name: string;
  role: TeamRole;
  status: "active" | "suspended";
  joined_at: string;
};

export type TeamInvitation = {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
  accept_token: string | null;
};

export type AuditLog = {
  id: string;
  actor_user_id: string | null;
  actor_display_name: string | null;
  team_id: string | null;
  project_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AuthSessionSummary = {
  id: string;
  created_at: string;
  expires_at: string;
  idle_expires_at: string | null;
  last_seen_at: string;
  current: boolean;
  user_agent: string;
  ip_address: string;
};
