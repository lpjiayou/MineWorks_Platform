# 生产部署 Docker + Nginx + PostgreSQL 实施说明 V1.1

> 项目：矿业智工平台  
> 版本：V1.1  
> 编制日期：2026-07-14

## 1. 目标拓扑

```text
Internet
→ 80/443 Nginx
   ├─ /       → Next.js web:3000
   └─ /api/*  → FastAPI api:8000
                    ↓
                PostgreSQL:5432
```

PostgreSQL只加入内部backend网络，不向公网暴露端口。

## 2. 服务

```text
postgres  数据库
migrate   一次性Alembic迁移
api       FastAPI/Uvicorn
web       Next.js standalone
nginx     TLS和反向代理
```

API只有在：

```text
PostgreSQL健康
＋ Alembic迁移成功
```

后才启动。

## 3. 服务器建议基线

早期正式试运行：

```text
4 vCPU
8 GB RAM
100 GB SSD
Ubuntu LTS
```

数据库增长、文件存储、AI调用和并发提升后，应将PostgreSQL、对象存储和应用服务分离。

## 4. 文件准备

进入：

```text
deploy/
```

复制：

```text
.env.production.example → .env.production
secrets/postgres_password.txt.example → secrets/postgres_password.txt
secrets/database_url.txt.example → secrets/database_url.txt
```

准备证书：

```text
certs/fullchain.pem
certs/privkey.pem
```

## 5. 密钥

`postgres_password.txt`：

```text
仅数据库密码
```

`database_url.txt`：

```text
postgresql+psycopg://mineworks_app:URL编码密码@postgres:5432/mineworks
```

两者密码必须一致。

禁止：

- 提交到Git；
- 放入截图；
- 写入普通说明文档；
- 发送到群聊；
- 在命令历史中长期保留。

## 6. 配置检查

```sh
docker compose --env-file .env.production -f compose.production.yml config
```

确认没有：

- 空域名；
- 示例密码；
- 错误证书路径；
- 对外暴露5432；
- 生产启用本地支付模拟。

## 7. 首次启动

```sh
docker compose --env-file .env.production -f compose.production.yml up -d --build
```

查看：

```sh
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs migrate
docker compose --env-file .env.production -f compose.production.yml logs api
docker compose --env-file .env.production -f compose.production.yml logs nginx
```

## 8. 健康检查

```text
https://域名/api/v1/health
https://域名/api/v1/ready
```

`health`代表进程可响应；`ready`还会执行数据库查询。

## 9. 数据迁移

已有SQLite数据时，不要直接启动对外服务。

正确顺序：

```text
维护窗口
→ 备份SQLite
→ 启动PostgreSQL
→ Alembic迁移
→ 复制SQLite业务数据
→ 核对数量与权限
→ 用户重新登录
→ 再开放Nginx
```

详见：

```text
36_SQLite到PostgreSQL迁移操作手册_V1.1.md
```

## 10. 备份

执行：

```sh
./scripts/backup-postgres.sh
```

输出：

```text
deploy/backups/mineworks_UTC时间.dump
```

最低建议：

```text
每日自动备份
7个日备份
4个周备份
12个月备份
至少一份异地副本
```

保留策略需根据项目数据价值和法规重新确认。

## 11. 恢复演练

```sh
./scripts/restore-postgres.sh ./backups/FILE.dump
```

恢复操作会清理并重建对象。必须在隔离环境演练，不能首次在正式故障中尝试。

## 12. 更新发布

```text
备份数据库
→ 拉取新版本
→ 阅读迁移说明
→ docker compose build
→ migrate服务执行Alembic
→ 滚动启动api/web/nginx
→ readiness检查
→ 核心业务验收
```

## 13. Nginx基础安全

当前包含：

- HTTP强制跳转HTTPS；
- TLS 1.2/1.3；
- HSTS；
- 请求体20MB上限；
- API按IP限流；
- CSP基础策略；
- 禁止iframe嵌入；
- 隐藏后端网络；
- 传递真实IP和协议。

## 14. 上线前必须补齐

- 域名ICP备案和合规手续；
- 云安全组只开放必要端口；
- SSH密钥、禁用密码登录；
- 自动证书续期；
- 日志集中收集；
- CPU、内存、磁盘、数据库连接监控；
- 5xx、登录异常和备份失败告警；
- 对象存储；
- 邮件服务；
- 真实支付服务；
- 隐私和用户协议；
- 漏洞扫描和渗透测试。

## 15. 本阶段边界

当前提供的是生产基础架构，不代表已经完成某一云厂商的正式上线。

本构建环境未安装Docker，因此Compose和PostgreSQL容器必须在目标服务器或Windows Docker Desktop上再次实测。
