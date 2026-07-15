# PostgreSQL数据库迁移与兼容层开发报告 V1.1

> 项目：矿业智工平台  
> 工程：mineworks-web  
> 版本：V1.1  
> 编制日期：2026-07-14

## 1. 目标

本阶段将V1.0仅面向SQLite的数据库层升级为：

```text
本地开发：SQLite
生产运行：PostgreSQL
数据库访问：SQLAlchemy 2
版本管理：Alembic
历史迁移：SQLite → PostgreSQL复制工具
```

改造必须保持现有项目、计算历史、用户、团队、权限、订单和配额服务可继续工作。

## 2. 架构

```text
FastAPI路由
→ service层
→ CompatConnection
→ SQLAlchemy Connection
→ SQLite / PostgreSQL
```

`CompatConnection`在过渡期保留现有service层的问号占位符SQL：

```sql
SELECT * FROM users WHERE id=?
```

执行前转换为SQLAlchemy命名绑定参数。该兼容层只用于降低V1.1迁移风险，后续应逐模块迁移为SQLAlchemy Core或Repository。

## 3. 新增文件

```text
backend/app/schema.py
backend/alembic.ini
backend/migrations/env.py
backend/migrations/script.py.mako
backend/migrations/versions/20260714_0001_production_baseline.py
backend/scripts/migrate_sqlite_to_postgres.py
backend/scripts/check_production_config.py
```

## 4. 数据表

Alembic基线包含：

```text
users
auth_sessions
auth_login_attempts
teams
team_members
team_invitations
projects
project_members
calculation_records
audit_logs
subscriptions
billing_orders
usage_counters
usage_events
```

以及Alembic自己的：

```text
alembic_version
```

## 5. 数据库配置

支持三种来源，优先级从高到低：

```text
MINEWORKS_DATABASE_URL
MINEWORKS_DATABASE_URL_FILE
MINEWORKS_DATABASE_PATH
```

生产推荐通过Docker secret挂载完整数据库URL：

```text
MINEWORKS_DATABASE_URL_FILE=/run/secrets/database_url
```

避免把数据库密码直接写入Compose文件或普通环境变量清单。

## 6. 连接池

PostgreSQL配置：

```text
pool_pre_ping=true
pool_size=5
max_overflow=10
pool_recycle=1800s
```

SQLite使用：

```text
check_same_thread=false
busy_timeout=10000ms
foreign_keys=ON
```

## 7. Schema管理边界

开发和自动测试可以：

```text
MINEWORKS_AUTO_CREATE_SCHEMA=true
```

生产必须：

```text
MINEWORKS_AUTO_CREATE_SCHEMA=false
alembic -c alembic.ini upgrade head
```

应用启动时不得在生产库静默创建或修改表结构。

## 8. SQLite迁移工具

脚本：

```text
backend/scripts/migrate_sqlite_to_postgres.py
```

执行顺序：

```text
备份SQLite
→ 建立PostgreSQL
→ Alembic upgrade head
→ 校验目标表完整
→ 按外键顺序复制数据
→ 输出逐表行数报告
→ 用户重新登录
```

默认不复制：

```text
auth_sessions
```

理由：迁移后强制重新登录，避免旧浏览器会话在新生产环境继续有效。

## 9. 一致性检查

迁移后至少核对：

- 用户数量；
- 团队数量；
- 项目数量；
- 计算记录数量；
- 订单和订阅数量；
- 项目记录归属；
- 团队成员角色；
- 计算记录JSON完整性；
- 关键页面登录和读取；
- 新增记录可写入。

## 10. 回滚

V1.1迁移不会删除原SQLite文件。

回滚方式：

```text
停止PostgreSQL版API
→ 恢复V1.0/V1.1代码备份
→ 使用原backend/data/mineworks.db
→ 启动SQLite开发服务
```

生产上线后产生的新数据不会自动回写SQLite，因此正式切换后必须以PostgreSQL备份作为主恢复路径。

## 11. 已验证

```text
SQLAlchemy SQLite兼容层测试：通过
Alembic基线在临时SQLite升级：通过
基线表数量：15张（含alembic_version）
后端pytest：39项通过
```

## 12. 未在本构建环境实测

当前构建环境没有Docker命令，因此没有在本次打包环境启动真实PostgreSQL容器。

项目已提供：

```text
18_START_POSTGRES_DEV.cmd
19_MIGRATE_SQLITE_TO_POSTGRES_DEV.cmd
20_START_FASTAPI_POSTGRES_DEV.cmd
```

必须在用户Windows + Docker Desktop环境执行一次完整迁移演练，再进入公网部署。
