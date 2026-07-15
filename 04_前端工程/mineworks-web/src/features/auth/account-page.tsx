"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Field, useToast } from "@/components";
import { createAuthApi } from "./api";
import { useAuth } from "./auth-provider";
import type { AuthSessionSummary } from "./types";
import styles from "./account-page.module.css";

const ROLE_LABEL = { owner: "所有者", admin: "管理员", engineer: "工程师", viewer: "查看者" } as const;

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString("zh-CN") : "—";
}

export function AccountPage() {
  const api = useMemo(() => createAuthApi(), []);
  const { identity, logout, switchTeam, refresh } = useAuth();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState<AuthSessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    if (!identity) return;
    let active = true;
    void api.listSessions()
      .then((items) => { if (active) setSessions(items); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "会话列表读取失败。"); })
      .finally(() => { if (active) setSessionsLoading(false); });
    return () => { active = false; };
  }, [api, identity]);

  if (!identity) return null;

  const createTeam = async () => {
    setBusy(true);
    setError("");
    try {
      const team = await api.createTeam(teamName);
      await refresh();
      await switchTeam(team.id);
      setTeamName("");
      toast({ title: "团队工作区已创建", description: team.name, tone: "success" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "团队创建失败。");
    } finally {
      setBusy(false);
    }
  };

  const acceptInvite = async () => {
    setBusy(true);
    setError("");
    try {
      const team = await api.acceptInvitation(inviteToken.trim());
      await refresh();
      await switchTeam(team.id);
      setInviteToken("");
      toast({ title: "已加入团队", description: team.name, tone: "success" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "邀请接受失败。");
    } finally {
      setBusy(false);
    }
  };

  const revokeOthers = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await api.revokeOtherSessions();
      const latest = await api.listSessions();
      setSessions(latest);
      toast({ title: "其他会话已撤销", description: `已撤销 ${result.revoked} 个会话。`, tone: "success" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "会话撤销失败。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <div><span>ACCOUNT &amp; AUTHORIZATION</span><h1>{identity.user.display_name}</h1><p>{identity.user.email} · 当前套餐 {identity.user.plan}</p></div>
        <div className={styles.formAction}><Link href="/billing"><Button variant="secondary">订阅与用量</Button></Link><Button variant="danger" onClick={() => void logout()}>退出登录</Button></div>
      </section>

      {error ? <Alert tone="error" title="账户操作失败">{error}</Alert> : null}

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2>用户身份</h2>
          <dl className={styles.identity}>
            <dt>用户ID</dt><dd>{identity.user.id}</dd>
            <dt>账户状态</dt><dd><Badge tone="success">正常</Badge></dd>
            <dt>创建时间</dt><dd>{formatDate(identity.user.created_at)}</dd>
            <dt>最近登录</dt><dd>{formatDate(identity.user.last_login_at)}</dd>
          </dl>
        </section>
        <section className={styles.section}>
          <h2>当前服务端权限</h2>
          <div className={styles.permissionGrid}>{identity.permissions.map((item) => <Badge key={item} tone="brand">{item}</Badge>)}</div>
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><h2>登录会话安全</h2><p>登录凭据保存在服务端会话中，浏览器仅使用HttpOnly安全Cookie。</p></div>
          <Button variant="danger" size="sm" isLoading={busy} disabled={sessions.length <= 1} onClick={() => void revokeOthers()}>撤销其他会话</Button>
        </div>
        {sessionsLoading ? <p className={styles.muted}>正在读取会话…</p> : (
          <div className={styles.sessionList}>
            {sessions.map((session) => (
              <article key={session.id} className={styles.sessionCard}>
                <div className={styles.sessionTitle}><strong>{session.current ? "当前设备" : "其他设备"}</strong>{session.current ? <Badge tone="success">当前</Badge> : <Badge tone="neutral">已登录</Badge>}</div>
                <dl className={styles.sessionMeta}>
                  <dt>最近活动</dt><dd>{formatDate(session.last_seen_at)}</dd>
                  <dt>空闲到期</dt><dd>{formatDate(session.idle_expires_at)}</dd>
                  <dt>绝对到期</dt><dd>{formatDate(session.expires_at)}</dd>
                  <dt>IP</dt><dd>{session.ip_address || "—"}</dd>
                  <dt>设备</dt><dd title={session.user_agent}>{session.user_agent || "未知设备"}</dd>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2>团队工作区</h2>
        <div className={styles.teamList}>{identity.teams.map((team) => (
          <div key={team.id} className={`${styles.team} ${identity.active_team_id === team.id ? styles.active : ""}`}>
            <div><strong>{team.name}</strong><div><Badge tone="team">{ROLE_LABEL[team.role]}</Badge> <span>{team.member_count}名成员</span></div></div>
            <Button size="sm" variant={identity.active_team_id === team.id ? "primary" : "secondary"} disabled={identity.active_team_id === team.id} onClick={() => void switchTeam(team.id)}>{identity.active_team_id === team.id ? "当前团队" : "切换团队"}</Button>
          </div>
        ))}</div>
      </section>

      <div className={styles.grid}>
        <section className={styles.section}>
          <h2>创建新团队</h2>
          <Field label="团队名称" helpText="创建者自动成为团队所有者"><input className={styles.input} value={teamName} onChange={(event) => setTeamName(event.target.value)} /></Field>
          <div className={styles.formAction}><Button variant="primary" isLoading={busy} disabled={!teamName.trim()} onClick={() => void createTeam()}>创建并切换</Button></div>
        </section>
        <section className={styles.section}>
          <h2>接受团队邀请</h2>
          <Field label="一次性邀请口令" helpText="口令必须与当前登录邮箱匹配"><textarea className={styles.textarea} rows={4} value={inviteToken} onChange={(event) => setInviteToken(event.target.value)} /></Field>
          <div className={styles.formAction}><Button variant="secondary" isLoading={busy} disabled={!inviteToken.trim()} onClick={() => void acceptInvite()}>接受邀请</Button></div>
        </section>
      </div>
    </div>
  );
}
