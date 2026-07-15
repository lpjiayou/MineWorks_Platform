import type { Metadata } from "next";
import { PublicHeader } from "@/components";
import { AuthGuard } from "@/features/auth/auth-guard";
import { ProjectsPage } from "@/features/calculation-history/projects-page";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "项目工作台",
  description: "管理项目和项目计算记录。",
};

export default function ProjectsRoute() {
  return <><PublicHeader /><main id="main-content" className={styles.main}><AuthGuard><ProjectsPage /></AuthGuard></main></>;
}
