import { ChevronRight, Ellipsis, Home } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./breadcrumb.module.css";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  ariaLabel?: string;
  homeLabel?: string;
  showHomeIcon?: boolean;
  maxItems?: number;
  className?: string;
};

type DisplayItem = BreadcrumbItem & { key: string; collapsed?: boolean };

export function Breadcrumb({
  items,
  ariaLabel = "面包屑导航",
  homeLabel = "首页",
  showHomeIcon = true,
  maxItems = 5,
  className,
}: BreadcrumbProps) {
  const normalized = items.length > 0 ? items : [{ label: homeLabel }];
  let displayItems: DisplayItem[] = normalized.map((item, index) => ({ ...item, key: `${index}-${item.label}` }));
  if (normalized.length > maxItems && maxItems >= 3) {
    const tailCount = maxItems - 2;
    displayItems = [
      { ...normalized[0]!, key: `0-${normalized[0]!.label}` },
      { label: "省略的路径", key: "collapsed", collapsed: true },
      ...normalized.slice(-tailCount).map((item, index) => ({ ...item, key: `tail-${index}-${item.label}` })),
    ];
  }

  return (
    <nav className={cn(styles.nav, className)} aria-label={ariaLabel}>
      <ol>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          return (
            <li key={item.key}>
              {index > 0 ? <ChevronRight className={styles.separator} size={14} aria-hidden="true" /> : null}
              {item.collapsed ? (
                <span className={styles.ellipsis} title="中间路径已折叠"><Ellipsis size={17} aria-hidden="true" /><span className="sr-only">中间路径已折叠</span></span>
              ) : isLast || !item.href ? (
                <span className={styles.current} aria-current={isLast ? "page" : undefined}>{index === 0 && showHomeIcon ? <Home size={14} aria-hidden="true" /> : null}{item.label}</span>
              ) : (
                <a href={item.href} className={styles.link}>{index === 0 && showHomeIcon ? <Home size={14} aria-hidden="true" /> : null}{item.label}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
