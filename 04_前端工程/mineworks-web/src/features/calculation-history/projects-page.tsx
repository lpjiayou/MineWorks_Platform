"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderKanban, Plus, RefreshCw } from "lucide-react";
import { Alert, Badge, Button, EmptyState, Field, Modal, Panel, useToast } from "@/components";
import { createCalculationHistoryApi } from "./api";
import type { ProjectSummary } from "./types";
import styles from "./projects-page.module.css";

export function ProjectsPage() {
  const api = useMemo(() => createCalculationHistoryApi(), []);
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => { setLoading(true); setError(""); try { setProjects(await api.listProjects()); } catch (reason) { setError(reason instanceof Error ? reason.message : "项目读取失败。"); } finally { setLoading(false); } }, [api]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const create = async () => {
    if (!name.trim()) return;
    setSaving(true); setError("");
    try { const project = await api.createProject({ name: name.trim(), code: code.trim() || undefined, description: description.trim() }); setProjects((items) => [project, ...items]); setOpen(false); setName(""); setCode(""); setDescription(""); toast({ title: "项目已创建", description: project.name, tone: "success" }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "项目创建失败。"); }
    finally { setSaving(false); }
  };

  return <div className={styles.root}>
    <section className={styles.hero}><div><span>PROJECT WORKSPACE</span><h1>项目工作台</h1><p>项目是计算记录、工具结果、后续报告和团队协作的统一业务容器。</p></div><div className={styles.actions}><Button variant="secondary" leadingIcon={<RefreshCw size={16}/>} onClick={() => void load()}>刷新</Button><Button variant="primary" leadingIcon={<Plus size={16}/>} onClick={() => setOpen(true)}>新建项目</Button></div></section>
    {error ? <Alert tone="error" title="项目服务提示">{error}</Alert> : null}
    {!loading && projects.length === 0 ? <Panel><EmptyState icon={<FolderKanban/>} title="尚未建立项目" description="创建项目后，可以把不同工具的计算记录集中保存并复用。" primaryAction={<Button variant="primary" onClick={() => setOpen(true)}>创建第一个项目</Button>} /></Panel> : null}
    <div className={styles.grid}>{projects.map((project) => <article className={styles.card} key={project.id}><div className={styles.icon}><FolderKanban/></div><div className={styles.cardBody}><div className={styles.titleRow}><h2>{project.name}</h2><Badge tone={project.status === "active" ? "success" : "neutral"}>{project.status === "active" ? "进行中" : "已归档"}</Badge></div><p>{project.description || "暂无项目说明"}</p><div className={styles.meta}><span>{project.code || "未设置编号"}</span><span>{project.record_count} 条计算记录</span><span>{project.member_count} 名成员</span><span>我的角色：{project.my_role ?? "—"}</span><span>更新 {new Date(project.updated_at).toLocaleString("zh-CN")}</span></div></div><div className={styles.actions}><Link href={`/projects/${project.id}`}><Button variant="primary">项目详情</Button></Link><Link href={{ pathname: "/history", query: { project_id: project.id } }}><Button variant="secondary">计算记录</Button></Link></div></article>)}</div>
    <Modal open={open} onOpenChange={setOpen} title="新建工程项目" description="项目编号建议使用公司内部统一编码。" footer={<><Button variant="secondary" onClick={() => setOpen(false)}>取消</Button><Button variant="primary" isLoading={saving} onClick={() => void create()}>确认创建</Button></>}><div className={styles.form}><Field label="项目名称" required><input className={styles.input} value={name} onChange={(event)=>setName(event.target.value)}/></Field><Field label="项目编号"><input className={styles.input} value={code} onChange={(event)=>setCode(event.target.value)} placeholder="MW-2026-001"/></Field><Field label="项目说明"><textarea className={styles.textarea} rows={4} value={description} onChange={(event)=>setDescription(event.target.value)}/></Field></div></Modal>
  </div>;
}
