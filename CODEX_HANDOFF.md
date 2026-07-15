# 矿业智工平台 Codex 接管状态

> 接管基线：`00_项目总纲\矿业智工平台跨账号项目转接单_V1.1.md`  
> 当前稳定代码基线：`mineworks-web V1.1.1`  
> 状态日期：2026-07-14

## 1. 已确认状态

- 用户已在 Windows 本机运行：`04_前端工程\mineworks-web\21_VERIFY_PRODUCTION_BASE.cmd`。
- 已取得最终成功标志：`VERIFY_PRODUCTION_BASE_V11_OK`。
- Storybook 已构建成功。
- Storybook 结束阶段出现过一次 Node/libuv 断言提示；当前记录为非阻断技术债，不改变本次构建成功结论。后续升级 Node.js、Storybook 或相关依赖时应复查，并保留原始终端日志以便定位。

上述本机验证结果更新了转接单 V1.1 中“仍待取得本机最终成功标志”的旧状态。

## 2. 当前系统基线

当前网页全栈工程位于：

```text
04_前端工程\mineworks-web
```

主要组成：

- Next.js 16、React 19、TypeScript、App Router、Typed Routes；
- MineWorks UI、Storybook、Vitest、Testing Library；
- FastAPI、Pydantic、SQLAlchemy 2、Alembic、pytest；
- 当前内置 `backend\mining_core`；
- SQLite 本地数据库和 PostgreSQL 生产目标；
- Docker Compose、Nginx、生产配置校验、备份恢复脚本。

已形成的主要能力包括工具中心、两项正式全栈计算工具、计算历史、项目保存和结果复用、用户与团队、RBAC、套餐权益与配额、订阅计费基础、正式会话安全基础以及生产部署基础架构。

## 3. 必须保持的连续性

- 产品定位、正式名称、Logo 和品牌配色不得擅自改变。
- `backend\data\mineworks.db` 不得删除或覆盖。
- PySide6 桌面版和网页版必须走唯一共享计算核心，不能分别维护同一公式。
- `0` 是有效数值，`null` 表示无数据，`NaN` 表示计算错误。
- TypeScript strict、Typed Routes、CSRF、RBAC、服务端权限、套餐权益和配额校验不得关闭。
- 正式公式、单位、默认参数和版本变更必须经过专业审核、测试和书面记录。

## 4. 当前尚未完成

1. Docker Desktop 下 SQLite 到 PostgreSQL 真实迁移；
2. 迁移后的登录、团队、项目、历史、计算保存、权限、订阅和配额业务验收；
3. 生产 Compose 整栈预演；
4. TLS 和正式域名；
5. 数据库备份恢复演练；
6. 共享 `mining_core` 独立化；
7. PySide6 桌面版与网页版双端统一；
8. 正式支付；
9. 邮箱验证、密码重置和 MFA。

## 5. 非阻断技术债

- Storybook 结束阶段的一次 Node/libuv 断言提示；
- pytest 相关依赖链的弃用警告；
- Storybook 大 chunk 提示；
- npm 依赖审计需在正式上线前重新执行并评估；
- 正式身份安全、支付、备份恢复和生产可观测性仍需补齐。

## 6. 推荐接管顺序

严格按 `CODEX_TASK_BACKLOG.md` 推进：先完成全项目只读接管审计，再检查 Git 与 `.gitignore`、建立稳定基线，之后才进入 PostgreSQL 迁移演练、生产预演和共享计算核心独立化。任何数据库、部署或目录迁移动作均需用户另行确认。
