"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderPlus, Save } from "lucide-react";
import { Button, Field, Modal, ProjectPicker } from "@/components";
import { createCalculationHistoryApi } from "./api";
import type { CalculationRecord, CalculationRecordCreate, ProjectSummary } from "./types";
import styles from "./calculation-save-modal.module.css";

export type CalculationSaveModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: CalculationRecordCreate;
  onSaved?: (record: CalculationRecord) => void;
};

const STANDALONE = "__standalone__";
const NEW_PROJECT = "__new_project__";

export function CalculationSaveModal({ open, onOpenChange, record, onSaved }: CalculationSaveModalProps) {
  const api = useMemo(() => createCalculationHistoryApi(), []);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectId, setProjectId] = useState(STANDALONE);
  const [title, setTitle] = useState(record.title);
  const [note, setNote] = useState(record.note);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectCode, setNewProjectCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    void api.listProjects().then((items) => {
      if (active) setProjects(items);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "项目列表读取失败。");
    });
    return () => { active = false; };
  }, [api, open]);

  const save = async () => {
    if (!title.trim()) { setError("记录标题不能为空。"); return; }
    if (projectId === NEW_PROJECT && !newProjectName.trim()) { setError("请输入新项目名称。"); return; }
    setLoading(true);
    setError("");
    try {
      let targetProjectId: string | null = projectId === STANDALONE ? null : projectId;
      if (projectId === NEW_PROJECT) {
        const project = await api.createProject({
          name: newProjectName.trim(),
          code: newProjectCode.trim() || undefined,
          description: `由${record.tool_name}计算结果创建`,
        });
        targetProjectId = project.id;
      }
      const saved = await api.createRecord({
        ...record,
        title: title.trim(),
        note: note.trim(),
        project_id: targetProjectId,
      });
      onSaved?.(saved);
      onOpenChange(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "保存失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="保存计算记录"
      description="记录将统一保存输入、结果、公式版本、有效性和可复用字段。"
      size="lg"
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>取消</Button><Button variant="primary" leadingIcon={<Save size={16} />} isLoading={loading} onClick={() => void save()}>确认保存</Button></>}
    >
      <div className={styles.stack}>
        <Field label="记录标题" required errorText={!title.trim() ? "请输入记录标题。" : undefined}>
          <input className={styles.input} value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="计算备注" helpText="建议记录数据来源、工况和需要复核的事项。">
          <textarea className={styles.textarea} rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <ProjectPicker
          projects={projects.map((project) => ({ id: project.id, name: project.name, description: project.code ? `${project.code} · ${project.description}` : project.description, updatedAt: new Date(project.updated_at).toLocaleString("zh-CN"), status: project.status }))}
          value={projectId}
          onValueChange={setProjectId}
          standaloneValue={STANDALONE}
          onCreateProject={() => setProjectId(NEW_PROJECT)}
        />
        {projectId === NEW_PROJECT ? (
          <div className={styles.newProject}>
            <div className={styles.newProjectTitle}><FolderPlus size={17} /><strong>新建并保存到项目</strong></div>
            <Field label="项目名称" required><input className={styles.input} value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} /></Field>
            <Field label="项目编号"><input className={styles.input} value={newProjectCode} onChange={(event) => setNewProjectCode(event.target.value)} placeholder="例如：MW-2026-001" /></Field>
          </div>
        ) : null}
        {error ? <div className={styles.error} role="alert">{error}</div> : null}
      </div>
    </Modal>
  );
}
