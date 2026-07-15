import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components";
import { AuthProvider } from "@/features/auth/auth-provider";

export const metadata: Metadata = {
  title: { default: "矿业智工平台", template: "%s｜矿业智工平台" },
  description: "面向矿物加工与采矿工程的在线工具和知识工作台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning><body><ThemeProvider><ToastProvider><AuthProvider>{children}</AuthProvider></ToastProvider></ThemeProvider></body></html>;
}
