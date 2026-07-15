import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicHeader } from "@/components";
import { LoginPage } from "@/features/auth/login-page";
import styles from "./page.module.css";
export const metadata: Metadata = { title: "登录", description: "登录或注册矿业智工平台。" };
export default function Page() { return <><PublicHeader /><main id="main-content" className={styles.main}><Suspense fallback={<p>正在加载登录页面…</p>}><LoginPage /></Suspense></main></>; }
