import { cn } from "@/lib/cn";
import styles from "./loading-skeleton.module.css";

export type LoadingSkeletonProps = {
  variant?: "text" | "circle" | "rect" | "metric" | "card" | "table";
  lines?: number;
  rows?: number;
  width?: string | number;
  height?: string | number;
  label?: string;
  className?: string;
};

export function LoadingSkeleton({
  variant = "rect",
  lines = 3,
  rows = 4,
  width,
  height,
  label = "内容加载中",
  className,
}: LoadingSkeletonProps) {
  const style = { width, height };
  return (
    <div className={cn(styles.root, styles[variant], className)} role="status" aria-label={label} aria-busy="true" style={style}>
      {variant === "text" ? (
        <div className={styles.textLines} aria-hidden="true">
          {Array.from({ length: lines }, (_, index) => (
            <span key={index} className={styles.block} style={{ width: index === lines - 1 ? "68%" : "100%" }} />
          ))}
        </div>
      ) : null}
      {variant === "metric" ? (
        <div className={styles.metricContent} aria-hidden="true">
          <span className={styles.block} style={{ width: "42%", height: 12 }} />
          <span className={styles.block} style={{ width: "70%", height: 30 }} />
          <span className={styles.block} style={{ width: "55%", height: 10 }} />
        </div>
      ) : null}
      {variant === "card" ? (
        <div className={styles.cardContent} aria-hidden="true">
          <span className={styles.block} style={{ width: 48, height: 48, borderRadius: 14 }} />
          <span className={styles.block} style={{ width: "56%", height: 16 }} />
          <span className={styles.block} style={{ width: "100%", height: 12 }} />
          <span className={styles.block} style={{ width: "82%", height: 12 }} />
        </div>
      ) : null}
      {variant === "table" ? (
        <div className={styles.tableContent} aria-hidden="true">
          {Array.from({ length: rows + 1 }, (_, rowIndex) => (
            <div key={rowIndex} className={cn(styles.tableRow, rowIndex === 0 && styles.tableHeader)}>
              {Array.from({ length: 4 }, (_, columnIndex) => (
                <span key={columnIndex} className={styles.block} />
              ))}
            </div>
          ))}
        </div>
      ) : null}
      {(variant === "rect" || variant === "circle") ? <span className={styles.block} aria-hidden="true" /> : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}
