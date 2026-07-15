import type { Preview } from "@storybook/nextjs-vite";
import React from "react";
import { ToastProvider } from "../src/components/feedback/toast/toast";
import { AuthProvider } from "../src/features/auth/auth-provider";
import "../src/app/globals.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "界面主题",
      defaultValue: "light",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "浅色" },
          { value: "dark", title: "深色" },
        ],
      },
    },
    density: {
      description: "组件密度",
      defaultValue: "comfortable",
      toolbar: {
        icon: "component",
        items: [
          { value: "comfortable", title: "舒适" },
          { value: "compact", title: "紧凑" },
        ],
      },
    },
  },
  initialGlobals: {
    theme: "light",
    density: "comfortable",
  },
  decorators: [
    (Story, context) => (
      <ToastProvider>
        <AuthProvider>
        <div
          data-theme={String(context.globals.theme ?? "light")}
          data-density={String(context.globals.density ?? "comfortable")}
          style={{ minHeight: "100vh", padding: 24, background: "var(--mw-bg-page)" }}
        >
          <Story />
        </div>
        </AuthProvider>
      </ToastProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: {
        mobile390: { name: "手机 390×844", styles: { width: "390px", height: "844px" } },
        tablet768: { name: "平板 768×1024", styles: { width: "768px", height: "1024px" } },
        desktop1366: { name: "桌面 1366×768", styles: { width: "1366px", height: "768px" } },
        desktop1920: { name: "桌面 1920×1080", styles: { width: "1920px", height: "1080px" } },
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
