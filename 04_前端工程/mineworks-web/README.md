# 矿业智工平台 Web / MineWorks UI V1.1

当前版本：`V1.1.0`

本版本在V1.0会员权益与订阅基础上新增：

- SQLAlchemy 2数据库访问层；
- SQLite本地开发兼容；
- PostgreSQL生产数据库支持；
- Alembic数据库版本迁移；
- SQLite到PostgreSQL数据复制工具；
- Argon2id新密码哈希与旧PBKDF2登录后升级；
- HttpOnly会话Cookie；
- 双提交CSRF令牌；
- Origin/Referer来源校验；
- 会话绝对过期与空闲过期；
- 登录失败限流；
- 账户页会话查看和撤销其他会话；
- Next.js standalone生产构建；
- FastAPI、Next.js、PostgreSQL、Nginx的Docker Compose基础架构；
- TLS、安全响应头、数据库备份和恢复脚本。

## 本地SQLite开发

```text
01_INSTALL_DEPENDENCIES.cmd
17_UPGRADE_BACKEND_DEPENDENCIES.cmd
11_START_FASTAPI.cmd
02_START_NEXTJS.cmd
03_START_STORYBOOK_6007.cmd
```

地址：

```text
http://127.0.0.1:3000
http://127.0.0.1:8000/docs
http://127.0.0.1:6007
```

本地SQLite数据库：

```text
backend/data/mineworks.db
```

升级工程时不要删除`backend/data`。

## 本地PostgreSQL开发

需要Docker Desktop：

```text
17_UPGRADE_BACKEND_DEPENDENCIES.cmd
18_START_POSTGRES_DEV.cmd
19_MIGRATE_SQLITE_TO_POSTGRES_DEV.cmd
20_START_FASTAPI_POSTGRES_DEV.cmd
02_START_NEXTJS.cmd
```

`19_MIGRATE...`会先备份SQLite数据库，再清空本地PostgreSQL开发库并复制业务数据。浏览器会话默认不迁移，用户需重新登录。

## 完整验证

```text
21_VERIFY_PRODUCTION_BASE.cmd
```

## 生产基础架构

生产部署文件：

```text
deploy/compose.production.yml
deploy/nginx/default.conf.template
deploy/.env.production.example
deploy/secrets/
deploy/certs/
deploy/scripts/
Dockerfile.web
backend/Dockerfile
```

生产环境强制要求：

```text
PostgreSQL
Alembic显式迁移
Secure HttpOnly Cookie
CSRF校验
禁用Bearer会话
关闭本地支付模拟
HTTPS反向代理
```

操作前先阅读：

```text
docs/35_生产部署Docker_Nginx_PostgreSQL实施说明_V1.1.md
docs/36_SQLite到PostgreSQL迁移操作手册_V1.1.md
```

## 生产边界

V1.1提供可部署基础架构，但上线前仍必须完成：

- 合法域名和有效TLS证书；
- 独立生产服务器与防火墙；
- PostgreSQL实际迁移演练；
- 恢复演练和异地备份；
- 真实支付回调安全；
- 邮箱验证、密码重置和MFA；
- 日志、监控、告警和漏洞扫描；
- 隐私政策、用户协议和数据合规审查。
