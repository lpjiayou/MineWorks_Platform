# SQLite到PostgreSQL迁移操作手册 V1.1

> 适用版本：V1.0/V1.1  
> 目标：保留用户、团队、项目、计算历史、订阅、订单和配额数据

## 1. Windows本地演练

### 1.1 关闭服务

关闭：

```text
FastAPI
Next.js
Storybook
```

### 1.2 备份

备份工程：

```text
mineworks-web_backup_V1.0
```

单独备份：

```text
backend/data/mineworks.db
```

### 1.3 安装V1.1后端依赖

```text
17_UPGRADE_BACKEND_DEPENDENCIES.cmd
```

成功：

```text
BACKEND_DEPENDENCIES_V11_OK
```

### 1.4 启动PostgreSQL开发容器

```text
18_START_POSTGRES_DEV.cmd
```

成功：

```text
POSTGRES_DEV_READY
```

### 1.5 执行迁移

```text
19_MIGRATE_SQLITE_TO_POSTGRES_DEV.cmd
```

脚本会：

1. 再备份一次SQLite；
2. 执行Alembic；
3. 清空本地PostgreSQL开发库；
4. 复制业务数据；
5. 不复制旧会话。

成功：

```text
SQLITE_TO_POSTGRES_DEV_MIGRATION_OK
```

### 1.6 启动PostgreSQL版API

```text
20_START_FASTAPI_POSTGRES_DEV.cmd
```

打开：

```text
http://127.0.0.1:8000/api/v1/ready
```

应返回：

```json
{
  "status": "ok",
  "database": "postgresql"
}
```

### 1.7 启动前端

```text
02_START_NEXTJS.cmd
```

所有用户需要重新登录。

## 2. 验收清单

登录后核对：

- [ ] 用户可登录；
- [ ] 团队列表正确；
- [ ] 团队成员角色正确；
- [ ] 项目数量正确；
- [ ] 私有项目访问正确；
- [ ] 计算历史数量正确；
- [ ] 历史结果可打开；
- [ ] 结果可复用；
- [ ] 套餐和订阅正确；
- [ ] 用量计数正确；
- [ ] 新建项目成功；
- [ ] 新计算记录成功；
- [ ] 删除和权限限制正确；
- [ ] 其他团队无法读取数据。

## 3. 迁移报告

脚本输出每张表：

```text
status
rows
columns
```

保留该输出作为迁移记录。

## 4. 常见问题

### 目标表不存在

先执行：

```text
alembic -c alembic.ini upgrade head
```

### 唯一键冲突

说明目标库不是空库。开发脚本使用`--truncate-target`清空目标业务数据。

正式迁移时不要随意清空生产库，应先创建全新数据库或由数据库管理员确认。

### 密码含特殊字符

数据库URL中的密码必须URL编码。

### 用户迁移后登录失败

先确认用户表数量和密码哈希字段未截断。旧PBKDF2密码验证成功后会自动升级为Argon2id。

### 页面显示未登录

这是预期行为。旧会话默认不迁移。

## 5. 正式服务器迁移

正式迁移必须：

```text
书面维护窗口
＋ 全量备份
＋ 回滚方案
＋ 迁移前后数量核对
＋ 业务抽样
＋ 权限隔离测试
＋ 迁移负责人确认
```

不能直接用本地固定开发密码和开发Compose作为生产密码配置。

## 6. 回滚条件

出现以下任一情况立即停止开放：

- 表记录数量明显不一致；
- 团队或项目越权；
- JSON结果损坏；
- 新记录无法写入；
- readiness失败；
- 备份不可恢复。

回滚到原SQLite仅适用于尚未接受生产新数据的切换窗口。已经产生新数据后，应恢复PostgreSQL备份而不是退回旧SQLite。
