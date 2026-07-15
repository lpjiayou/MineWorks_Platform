"use client";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/primitives/icon-button/icon-button";
import { useTheme } from "@/components/providers/theme-provider";
export function ThemeToggle() { const { resolvedTheme, setMode } = useTheme(); const isDark = resolvedTheme === "dark"; return <IconButton label={isDark ? "切换到浅色主题" : "切换到深色主题"} icon={isDark ? <Sun size={19} /> : <Moon size={19} />} onClick={() => setMode(isDark ? "light" : "dark")} />; }
