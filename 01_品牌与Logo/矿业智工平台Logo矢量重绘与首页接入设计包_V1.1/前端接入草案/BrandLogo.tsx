import Image from "next/image";
import Link from "next/link";
import styles from "./BrandLogo.module.css";

export type BrandLogoVariant = "horizontal" | "symbol";
export type BrandLogoTheme = "light" | "dark";

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  theme?: BrandLogoTheme;
  priority?: boolean;
  href?: string;
  className?: string;
};

export function BrandLogo({
  variant = "horizontal",
  theme = "light",
  priority = false,
  href = "/",
  className,
}: BrandLogoProps) {
  if (variant === "symbol") {
    return (
      <Link
        href={href}
        aria-label="矿业智工平台首页"
        className={`${styles.logoLink} ${className ?? ""}`}
      >
        <Image
          src="/brand/logo-symbol.png"
          alt=""
          width={48}
          height={48}
          priority={priority}
          className={styles.symbol}
        />
      </Link>
    );
  }

  const src =
    theme === "dark"
      ? "/brand/logo-header-dark.png"
      : "/brand/logo-header-light.png";

  return (
    <Link
      href={href}
      aria-label="矿业智工平台首页"
      className={`${styles.logoLink} ${className ?? ""}`}
    >
      <Image
        src={src}
        alt="矿业智工平台 MineWorks Platform"
        width={480}
        height={154}
        priority={priority}
        className={styles.horizontal}
      />
    </Link>
  );
}
