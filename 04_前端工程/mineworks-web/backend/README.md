# MineWorks API / PostgreSQL / Secure Session V1.1

## 本地SQLite启动

从项目根目录运行：

```text
17_UPGRADE_BACKEND_DEPENDENCIES.cmd
11_START_FASTAPI.cmd
```

地址：

```text
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/api/v1/health
http://127.0.0.1:8000/api/v1/ready
```

## PostgreSQL开发启动

```text
18_START_POSTGRES_DEV.cmd
19_MIGRATE_SQLITE_TO_POSTGRES_DEV.cmd
20_START_FASTAPI_POSTGRES_DEV.cmd
```

开发连接：

```text
postgresql+psycopg://mineworks:mineworks-dev-password@127.0.0.1:5432/mineworks
```

该固定口令只能用于本机开发容器，不能用于公网或正式服务器。

## 数据库迁移

生产数据库必须先运行：

```text
alembic -c alembic.ini upgrade head
```

不得在生产环境启用自动建表：

```text
MINEWORKS_AUTO_CREATE_SCHEMA=false
```

SQLite复制脚本：

```text
python scripts/migrate_sqlite_to_postgres.py \
  --sqlite data/mineworks.db \
  --postgres-url postgresql+psycopg://...
```

目标库必须先完成Alembic迁移。浏览器会话默认不复制。

## 会话安全

正式浏览器会话使用：

```text
HttpOnly session cookie
Readable CSRF cookie + X-CSRF-Token
Origin/Referer validation
Absolute expiry
Idle expiry
Server-side revoke
Argon2id password hash
Login rate limiting
```

开发环境为测试和CLI保留Bearer兼容。生产必须设置：

```text
MINEWORKS_ALLOW_BEARER_TOKENS=false
MINEWORKS_COOKIE_SECURE=true
MINEWORKS_CSRF_ENABLED=true
```

## 测试

```text
.venv\Scripts\python.exe -m pytest tests
```

`mining_core`保持为纯Python工程计算核心，不依赖FastAPI。
