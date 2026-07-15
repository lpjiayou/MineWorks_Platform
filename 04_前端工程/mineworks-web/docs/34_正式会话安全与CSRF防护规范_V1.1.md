# 正式会话安全与CSRF防护规范 V1.1

> 项目：矿业智工平台  
> 版本：V1.1  
> 编制日期：2026-07-14

## 1. 改造目标

V1.0使用浏览器localStorage保存Bearer令牌，只适合本地产品验证。

V1.1正式浏览器会话改为：

```text
服务端随机会话
＋ HttpOnly Cookie
＋ CSRF双提交令牌
＋ Origin/Referer校验
＋ 空闲和绝对过期
＋ 服务端撤销
```

## 2. Cookie

### 会话Cookie

```text
名称：mw_session
HttpOnly：true
Secure：生产true
SameSite：lax
Path：/
```

JavaScript不能读取会话令牌。

### CSRF Cookie

```text
名称：mw_csrf
HttpOnly：false
Secure：生产true
SameSite：lax
Path：/
```

前端读取该值并在非安全HTTP方法中发送：

```http
X-CSRF-Token: <token>
```

服务端同时验证：

1. Cookie值；
2. Header值；
3. 会话表中保存的CSRF哈希；
4. Origin或Referer是否属于可信站点。

## 3. 前端令牌存储

前端不再保存访问令牌。

localStorage只保留：

```text
当前团队ID
```

禁止恢复：

```text
access_token
refresh_token
session_token
password
```

## 4. 密码哈希

新密码使用Argon2id。

旧PBKDF2密码仍可登录；验证成功后自动重新哈希为Argon2id，避免强制所有旧用户立即重置密码。

数据库只保存密码哈希，不保存原始密码。

## 5. 会话生命周期

默认：

```text
绝对有效期：168小时
空闲有效期：120分钟
```

每次有效请求更新空闲到期时间，但不能超过绝对到期时间。

到期或撤销后：

```text
服务端拒绝
→ 前端清除本地团队偏好
→ 用户重新登录
```

## 6. 会话管理

新增接口：

```text
GET  /api/v1/auth/sessions
POST /api/v1/auth/sessions/revoke-others
```

账户页显示：

- 当前会话；
- 其他会话；
- 最近活动时间；
- 空闲到期；
- 绝对到期；
- IP；
- User-Agent；
- 撤销其他会话。

## 7. 登录限流

按以下组合统计失败登录：

```text
标准化邮箱 + IP地址 + 时间窗口
```

默认：

```text
15分钟内8次失败
→ HTTP 429 LOGIN_RATE_LIMITED
```

成功登录不清除审计记录，但后续限流只统计失败记录。

## 8. Bearer兼容边界

开发环境保留Bearer兼容，便于：

- 自动测试；
- API调试；
- 内部脚本；
- 迁移期间兼容。

生产强制：

```text
MINEWORKS_ALLOW_BEARER_TOKENS=false
```

禁止在生产重新开启，除非另行设计短期API Token、作用域、轮换和撤销体系。

## 9. 生产强制配置

```text
MINEWORKS_ENVIRONMENT=production
MINEWORKS_COOKIE_SECURE=true
MINEWORKS_COOKIE_SAMESITE=lax
MINEWORKS_ALLOW_BEARER_TOKENS=false
MINEWORKS_CSRF_ENABLED=true
MINEWORKS_AUTO_CREATE_SCHEMA=false
MINEWORKS_ALLOW_LOCAL_BILLING_SIMULATION=false
```

## 10. 安全响应头

FastAPI和Nginx基础配置包含：

```text
Strict-Transport-Security
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
Content-Security-Policy（Nginx基线）
```

当前CSP为兼容Next.js hydration的基础版本。上线后应通过浏览器报告模式逐步收紧script-src，避免未经验证直接造成页面不可用。

## 11. 已验证

```text
Cookie注册和登录：通过
HttpOnly会话Cookie：通过
缺少CSRF被拒绝：通过
正确CSRF可写入：通过
退出后会话失效：通过
登录失败限流：通过
前端不发送localStorage Bearer：通过
前端credentials=include：通过
```

## 12. 后续安全工作

生产商业化前仍需：

- 邮箱验证；
- 忘记密码和重置令牌；
- MFA；
- 异常登录提醒；
- 管理员强制撤销单个会话；
- API Token单独体系；
- 安全事件告警；
- 渗透测试；
- 依赖漏洞持续扫描。
