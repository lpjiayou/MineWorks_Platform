# 矿业智工平台 SQLite 权威数据库判定报告 V1.1.1

> 任务：MW-P0-002  
> 核对日期：2026-07-15  
> 核对方式：只读、不可变 SQLite 连接  
> 项目根目录：`D:\Codex使用\矿业智工平台\`

## 1. 判定结论

当前执行 `04_前端工程\mineworks-web\11_START_FASTAPI.cmd` 时，应用实际使用的权威 SQLite 数据库是：

```text
D:\Codex使用\矿业智工平台\04_前端工程\mineworks-web\backend\data\mineworks.db
```

该结论能够由启动目录、配置覆盖链和数据库内容唯一确认：

1. `11_START_FASTAPI.cmd` 先定位到脚本目录，再进入 `backend` 后启动 Uvicorn。
2. `SettingsConfigDict(env_file=".env", env_prefix="MINEWORKS_")` 因此读取 `backend\.env`。
3. `backend\.env` 未设置 `MINEWORKS_DATABASE_URL`、`MINEWORKS_DATABASE_URL_FILE` 或 `MINEWORKS_DATABASE_PATH`；本次核对进程也没有 `MINEWORKS_DATABASE*` 覆盖变量。
4. `settings.py` 默认 `database_path` 为相对路径 `data/mineworks.db`；以 `backend` 为当前目录解析后即为上述权威路径。
5. `app.main` 将 `settings.effective_database_url` 交给 `configure_database()`；未发现其他运行时重定向。
6. 权威库包含现有用户、团队、项目、订阅、会话、订单和审计数据；另一份数据库所有业务表均为空。

`.env.local` 仅包含前端公开配置键名 `NEXT_PUBLIC_APP_NAME`、`NEXT_PUBLIC_APP_VERSION` 和 `NEXT_PUBLIC_API_BASE_URL`，不参与 FastAPI SQLite 路径选择。本报告没有输出 `.env.local` 或 `backend\.env` 的任何配置值。

## 2. 只读核对方法

搜索范围为整个项目目录，扩展名包括 `*.db`、`*.sqlite` 和 `*.sqlite3`。共发现 2 个数据库。

每个数据库使用 Python `sqlite3` URI 的 `mode=ro&immutable=1` 打开，并设置 `PRAGMA query_only=ON`。仅查询 `sqlite_master`、各表 `COUNT(*)` 和 `alembic_version`。查询前后复核文件大小、修改时间和 SHA-256，两个数据库均保持不变。

本轮没有执行初始化、迁移、写入、清空、重命名、删除或恢复操作。

## 3. 数据库一：权威数据库

| 项目 | 值 |
|---|---|
| 完整路径 | `D:\Codex使用\矿业智工平台\04_前端工程\mineworks-web\backend\data\mineworks.db` |
| 文件大小 | 208896 字节 |
| 修改时间 | 2026-07-14 19:14:15.760 +08:00 |
| SHA-256 | `48E3031F77123B334CC32C32E76F111296BA347280766FC422CDBEE9F11EDF89` |
| `alembic_version` | 表不存在；没有可读取的 revision |
| 查询后完整性 | 大小、修改时间和 SHA-256 均未变化 |

### 3.1 表和记录数量

| 表名 | 记录数 |
|---|---:|
| `audit_logs` | 3 |
| `auth_sessions` | 1 |
| `billing_orders` | 1 |
| `calculation_records` | 0 |
| `project_members` | 0 |
| `projects` | 1 |
| `subscriptions` | 1 |
| `team_invitations` | 0 |
| `team_members` | 1 |
| `teams` | 1 |
| `usage_counters` | 0 |
| `usage_events` | 0 |
| `users` | 1 |

指定业务数量：`users=1`、`teams=1`、`projects=1`、`calculation_records=0`、`subscriptions=1`、`usage_events=0`。

## 4. 数据库二：非权威空数据库

| 项目 | 值 |
|---|---|
| 完整路径 | `D:\Codex使用\矿业智工平台\04_前端工程\mineworks-web\data\mineworks.db` |
| 文件大小 | 208896 字节 |
| 修改时间 | 2026-07-14 19:10:46.838 +08:00 |
| SHA-256 | `1644C383CCC28CE9C44B4B61F5E3249DB7E6D643396A32D3B6B8329F6948953C` |
| `alembic_version` | 表不存在；没有可读取的 revision |
| 查询后完整性 | 大小、修改时间和 SHA-256 均未变化 |

### 4.1 表和记录数量

| 表名 | 记录数 |
|---|---:|
| `audit_logs` | 0 |
| `auth_sessions` | 0 |
| `billing_orders` | 0 |
| `calculation_records` | 0 |
| `project_members` | 0 |
| `projects` | 0 |
| `subscriptions` | 0 |
| `team_invitations` | 0 |
| `team_members` | 0 |
| `teams` | 0 |
| `usage_counters` | 0 |
| `usage_events` | 0 |
| `users` | 0 |

指定业务数量：`users=0`、`teams=0`、`projects=0`、`calculation_records=0`、`subscriptions=0`、`usage_events=0`。

## 5. Alembic、PostgreSQL 与 Compose 关系

- `backend\alembic.ini` 的静态默认值也是 `sqlite:///data/mineworks.db`，但 `migrations\env.py` 会以 `settings.effective_database_url` 覆盖该值。
- `20_START_FASTAPI_POSTGRES_DEV.cmd` 明确设置 PostgreSQL URL，因此它不使用上述任何 SQLite 文件。
- `deploy\compose.postgres-dev.yml` 启动独立 PostgreSQL 开发容器。
- `deploy\compose.production.yml` 从 Docker secret 读取 PostgreSQL URL，并通过独立 migrate 服务执行 Alembic；生产路径不使用 SQLite。
- 两份现有 SQLite 均没有 `alembic_version` 表。它们的当前结构来自开发期自动建表路径或 Alembic revision 未落库；本轮只记录，不进行修复或迁移。

## 6. 项目外备份

备份目录：

```text
D:\Codex使用\矿业智工平台_安全备份\V1.1.1_20260715\数据库\
```

| 来源 | 备份文件 | SHA-256 |
|---|---|---|
| 权威数据库 | `mineworks.db` | `48E3031F77123B334CC32C32E76F111296BA347280766FC422CDBEE9F11EDF89` |
| 非权威空数据库 | `mineworks_20260715_075740_826.db` | `1644C383CCC28CE9C44B4B61F5E3249DB7E6D643396A32D3B6B8329F6948953C` |

来源映射记录：`DATABASE_SOURCE_MAP.md`。两份备份 SHA-256 均与对应源文件一致，原数据库没有移动或修改。

## 7. 未解决风险

1. 非权威空数据库仍保留在 `mineworks-web\data\mineworks.db`，容易被误认；根据本轮禁止事项，没有删除、移动或重命名。
2. 两份数据库均缺少 `alembic_version` 表，后续 PostgreSQL 迁移任务必须明确结构基线与 revision 对齐策略。
3. `11_START_FASTAPI.cmd` 没有主动清除用户级或系统级 `MINEWORKS_DATABASE*` 环境变量；未来若外部环境设置覆盖变量，实际数据库路径可能改变。当前核对环境不存在此类覆盖。
