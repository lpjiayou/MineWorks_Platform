import Image from "next/image";
import styles from "./brand-logo.module.css";

export type BrandLogoProps = { variant?: "horizontal" | "symbol"; priority?: boolean };
export function BrandLogo({ variant = "horizontal", priority = false }: BrandLogoProps) {
  if (variant === "symbol") return <Image src="/brand/mineworks-symbol.svg" alt="矿业智工平台" width={48} height={48} priority={priority} />;
  return <span className={styles.wrap}><Image className={styles.light} src="/brand/mineworks-logo-light.svg" alt="矿业智工平台 MineWorks Platform" width={480} height={120} priority={priority} /><Image className={styles.dark} src="/brand/mineworks-logo-dark.svg" alt="矿业智工平台 MineWorks Platform" width={480} height={120} priority={priority} /></span>;
}
