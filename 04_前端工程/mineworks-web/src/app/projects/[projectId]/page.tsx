import type { Metadata } from "next";
import { PublicHeader } from "@/components";
import { AuthGuard } from "@/features/auth/auth-guard";
import { ProjectDetailPage } from "@/features/calculation-history/project-detail-page";
import styles from "./page.module.css";
export const metadata:Metadata={title:"项目成员与权限",description:"管理项目成员和项目角色。"};
export default async function ProjectDetailRoute({params}:{params:Promise<{projectId:string}>}){const {projectId}=await params;return <><PublicHeader/><main id="main-content" className={styles.main}><AuthGuard><ProjectDetailPage projectId={projectId}/></AuthGuard></main></>}
