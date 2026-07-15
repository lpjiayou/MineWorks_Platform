"use client";

import { useEffect } from "react";
import { useToolPreferences } from "./tool-preferences";

export function RecentToolTracker({ toolId }: { toolId: string }) {
  const { recordRecent } = useToolPreferences();
  useEffect(() => { recordRecent(toolId); }, [recordRecent, toolId]);
  return null;
}
