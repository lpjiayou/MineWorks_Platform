export type DataValidity =
  | "NOT_CALCULATED"
  | "VALID"
  | "CAUTION"
  | "INCONSISTENT"
  | "INVALID"
  | "STALE"
  | "MISSING";

export type AccessLevel = "free" | "professional" | "team" | "enterprise";

export type ToolStatus = "DRAFT" | "REVIEWING" | "VALIDATED" | "TEACHING" | "DEPRECATED" | "DISABLED";
