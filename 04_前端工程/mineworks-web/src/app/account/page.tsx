import type { Metadata } from "next";
import { PublicHeader } from "@/components";
import { AccountPage } from "@/features/auth/account-page";
import { AuthGuard } from "@/features/auth/auth-guard";
import styles from "./page.module.css";
export const metadata: Metadata = { title: "账户与权限", description: "查看用户身份、团队和服务端权限。" };
export default function Page() { return <><PublicHeader /><main id="main-content" className={styles.main}><AuthGuard><AccountPage /></AuthGuard></main></>; }
