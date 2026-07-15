# MineWorks Web 全栈工程规则

本文件适用于 `04_前端工程\mineworks-web` 全目录，并补充项目根目录 `AGENTS.md`。本目录不是单纯前端工程；它同时包含 Next.js、FastAPI、`mining_core`、数据库、Alembic、Docker、Nginx、Storybook 和测试。

## 前端与设计系统

1. 所有页面优先复用 `src\components` 中的 MineWorks UI 组件。
2. 不在页面内重复实现 Button、Field、UnitInput、Badge、Card 等基础组件。
3. 颜色、间距、圆角、字体和状态颜色只使用设计令牌；不得擅自修改 Logo 和正式配色。
4. 保持 TypeScript strict 和 Typed Routes 开启，不得使用 `as any` 绕过错误。
5. 新增路由后如类型缓存异常，使用正式 typegen 和类型检查定位，不关闭 Typed Routes。
6. 每个适用的新组件同时提供 Story、测试、键盘与无障碍状态。
7. 页面按任务范围检查浅色、深色、1366×768、1920×1080 和 390×844。
8. 禁止使用 Emoji 作为正式产品图标。

## 计算与数据

1. `0` 是有效数值，`null` 表示无数据，`NaN` 表示计算错误。
2. 数值必须带单位；单位转换集中管理，不在页面隐式换算。
3. 正式公式不得保留在 React 页面、前端工具函数或 FastAPI 路由中；应调用 `backend\mining_core`，并最终演进为双端共享的唯一核心。
4. 不得把桌面版公式复制进本工程后独立维护。
5. 历史结果复用必须显式映射，目标工具重新校验和重新计算。
6. 不得删除、覆盖、清空或提交 `backend\data\mineworks.db`。
7. 未经任务明确授权，不运行 Alembic、SQLite 到 PostgreSQL 迁移、恢复、初始化或清理脚本。

## 后端、权限与商业化

1. 权限组件只负责界面表达，FastAPI 必须最终校验 RBAC、项目访问、套餐权益和配额。
2. 不得关闭或绕过 CSRF、Origin/Referer、HttpOnly 会话、Secure Cookie 生产要求和会话撤销。
3. 生产环境不得允许 Bearer 会话、SQLite 或本地模拟支付。
4. 不向客户端返回密码哈希、会话摘要、内部堆栈或敏感配置。
5. Python 子目录脚本优先在 `backend` 目录使用 `python -m scripts.module_name`。

## 文件、依赖与验证

1. 不提交 `node_modules`、`.next`、`storybook-static`、`backend\.venv`、`.env`、`.env.local`、真实 secrets 或 `backend\data\mineworks.db`。
2. 不修改 `package.json`、锁文件或依赖版本，除非任务明确要求。
3. CMD/BAT 必须为纯 ASCII 命令、无 UTF-8 BOM、Windows CRLF。
4. 修改前先核对现有变化，修改后执行与范围匹配的前端、后端、类型、Storybook、API 或安全验证。
5. 不自动 Git 提交、数据库迁移或生产部署。
