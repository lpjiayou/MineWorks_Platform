"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Field } from "@/components";
import { useAuth } from "./auth-provider";
import styles from "./login-page.module.css";

export function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter(); const params = useSearchParams();
  const [mode,setMode]=useState<"login"|"register">("login");
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [displayName,setDisplayName]=useState(""); const [teamName,setTeamName]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const submit=async()=>{setBusy(true);setError("");try{if(mode==="login")await login(email,password);else await register({email,password,display_name:displayName,team_name:teamName||undefined});const returnTo = params.get("returnTo"); router.push((returnTo && returnTo.startsWith("/") ? returnTo : "/tools") as Route);}catch(reason){setError(reason instanceof Error?reason.message:"操作失败。");}finally{setBusy(false);}};
  return <div className={styles.root}><div className={styles.shell}>
    <section className={styles.intro}><span>MINEWORKS IDENTITY</span><h1>登录矿业智工平台</h1><p>用户身份是项目、计算历史、团队成员、权限和审计记录的安全边界。</p><ul><li>个人身份与多团队工作区</li><li>项目成员角色和数据隔离</li><li>服务端权限校验与操作审计</li><li>计算结果按用户和团队归属</li></ul><Alert tone="info" title="本地开发说明">当前版本使用HttpOnly安全Cookie、CSRF校验和服务端可撤销会话；浏览器不再保存访问令牌。</Alert></section>
    <section className={styles.form}><div className={styles.tabs}><Button variant={mode==="login"?"primary":"secondary"} onClick={()=>setMode("login")}>登录</Button><Button variant={mode==="register"?"primary":"secondary"} onClick={()=>setMode("register")}>注册</Button></div>
      {mode==="register"?<><Field label="姓名" required><input className={styles.input} value={displayName} onChange={e=>setDisplayName(e.target.value)} autoComplete="name" /></Field><Field label="团队名称" helpText="留空时自动创建个人工作区"><input className={styles.input} value={teamName} onChange={e=>setTeamName(e.target.value)} /></Field></>:null}
      <Field label="邮箱" required><input className={styles.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" /></Field>
      <Field label="密码" required><input className={styles.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==="login"?"current-password":"new-password"} /></Field>
      {mode==="register"?<div className={styles.passwordRules}>至少10位，并包含大写字母、小写字母和数字。</div>:null}
      {error?<div className={styles.error} role="alert">{error}</div>:null}
      <div className={styles.actions}><span className={styles.hint}>{mode==="login"?"登录后恢复团队与项目权限。":"首位注册用户会接管V0.8已有的本地项目和历史数据。"}</span><Button variant="primary" isLoading={busy} onClick={()=>void submit()} disabled={!email||!password||(mode==="register"&&!displayName)}>确认{mode==="login"?"登录":"注册"}</Button></div>
    </section>
  </div></div>;
}
