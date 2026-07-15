"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./toast.module.css";

export type ToastTone = "info" | "success" | "warning" | "error";

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
};

type ToastItem = Required<Pick<ToastInput, "title" | "tone" | "duration">> & {
  id: string;
  description?: string;
};

type ToastContextValue = {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneIcons = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: CircleAlert,
};

export type ToastProviderProps = {
  children: ReactNode;
  defaultDuration?: number;
  maxVisible?: number;
};

export function ToastProvider({ children, defaultDuration = 3200, maxVisible = 4 }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const sequence = useRef(0);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setItems([]);
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      sequence.current += 1;
      const id = `mw-toast-${sequence.current}`;
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        tone: input.tone ?? "info",
        duration: input.duration ?? defaultDuration,
      };
      setItems((current) => [...current, item].slice(-maxVisible));
      if (item.duration > 0) {
        const timer = setTimeout(() => dismiss(id), item.duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [defaultDuration, dismiss, maxVisible],
  );

  const value = useMemo(() => ({ toast, dismiss, dismissAll }), [dismiss, dismissAll, toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.viewport} aria-label="通知">
        {items.map((item) => {
          const Icon = toneIcons[item.tone];
          return (
            <div
              key={item.id}
              role={item.tone === "error" ? "alert" : "status"}
              aria-live={item.tone === "error" ? "assertive" : "polite"}
              className={cn(styles.toast, styles[item.tone])}
            >
              <Icon className={styles.icon} size={19} aria-hidden="true" />
              <div className={styles.content}>
                <strong>{item.title}</strong>
                {item.description ? <p>{item.description}</p> : null}
              </div>
              <button type="button" className={styles.close} aria-label="关闭通知" onClick={() => dismiss(item.id)}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
