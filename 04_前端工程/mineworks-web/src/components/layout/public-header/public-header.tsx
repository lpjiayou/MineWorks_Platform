"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo/brand-logo";
import { Button } from "@/components/primitives/button/button";
import { ThemeToggle } from "@/components/theme/theme-toggle/theme-toggle";
import { useAuth } from "@/features/auth/auth-provider";
import styles from "./public-header.module.css";

export function PublicHeader() {
  const { status, identity } = useAuth();
  const activeTeam = identity?.teams.find((team) => team.id === identity.active_team_id);
  return <header className={styles.header}><a className={styles.skip} href="#main-content">跳到主要内容</a><div className={styles.inner}>
    <Link className={styles.brand} href="/"><span className={styles.horizontal}><BrandLogo priority /></span><span className={styles.symbol}><BrandLogo variant="symbol" priority /></span></Link>
    <nav className={styles.nav} aria-label="主导航"><Link href="/">工程首页</Link><Link href="/tools">工具中心</Link><Link href="/pricing">会员套餐</Link><Link href="/history">计算历史</Link><Link href="/projects">项目工作台</Link><Link href="/team">团队</Link><Link href="/design-system">设计系统</Link></nav>
    <div className={styles.actions}><ThemeToggle /><a className={styles.storybookLink} href="http://127.0.0.1:6007" target="_blank" rel="noreferrer">Storybook</a>{status === "authenticated" && identity ? <Link className={styles.identityLink} href="/account"><span>{identity.user.display_name}</span><small>{activeTeam?.name ?? "个人账户"}</small></Link> : <Link href="/login"><Button variant="primary">登录</Button></Link>}</div>
  </div></header>;
}
