import type { Metadata } from "next";
import { PublicHeader } from "@/components";
import { TeamPage } from "@/features/auth/team-page";
import { AuthGuard } from "@/features/auth/auth-guard";
import styles from "./page.module.css";
export const metadata: Metadata = { title: "团队权限", description: "管理团队成员、邀请、角色和授权审计。" };
export default function Page() { return <><PublicHeader /><main id="main-content" className={styles.main}><AuthGuard><TeamPage /></AuthGuard></main></>; }
