# 矿业智工平台 Git 稳定基线报告 V1.1.1

> 任务：MW-P0-002  
> 完成日期：2026-07-15  
> 稳定代码基线：`mineworks-web V1.1.1`  
> 用户确认的既有验证标志：`VERIFY_PRODUCTION_BASE_V11_OK`

## 1. Git 基线结论

| 项目 | 结果 |
|---|---|
| Git 仓库根目录 | `D:\Codex使用\矿业智工平台\` |
| 默认分支 | `main` |
| 稳定源码 commit | `b635ccd67257fee4042e1869ed0f33eafde69a54` |
| 稳定提交信息 | `baseline: MineWorks Platform V1.1.1` |
| 稳定 tag | `v1.1.1-stable`（annotated tag） |
| tag 指向 commit | `b635ccd67257fee4042e1869ed0f33eafde69a54` |
| 稳定源码提交跟踪文件数 | 504 |
| 远程仓库 | 未设置；用户提供的 GitHub 地址仅记录，本轮未连接、未 push |

本报告和 `CODEX_TASK_BACKLOG.md` 状态更新属于基线完成后的审计证据，将以独立本地证据提交纳入 `main`。稳定 tag 固定指向上表源码提交，源码 ZIP 也由该 tag 生成；最终 `main` HEAD 由 `23_VERIFY_GIT_BASELINE.cmd` 输出。

## 2. 仓库边界和嵌套仓库检查

- 初始化前对整个项目递归检查 `.git`，结果为 0 个，未发现嵌套 Git 仓库。
- Git 只在全项目根目录初始化，没有在 `mineworks-web` 单独初始化。
- 当前分支为 `main`。
- 没有修改全局 Git 配置，没有伪造用户名或邮箱。
- 本机已有可用的 `user.name` 和 `user.email`，但报告不输出其值。
- 没有配置 remote，没有创建远程仓库，没有执行 push。

## 3. 跟踪文件范围

稳定提交暂存前计划跟踪 504 个文件：

| 分类 | 文件数 |
|---|---:|
| 根目录项目管理、验证和 Git 规则 | 11 |
| `00_项目总纲` | 5 |
| `01_品牌与Logo` | 77 |
| `02_UI设计规范` | 9 |
| `03_网页视觉原型` | 8 |
| `04_前端工程` | 389 |
| `06_共享计算核心` | 1 |
| `07_测试与验收` | 4 |
| 合计 | 504 |

正式 Logo SVG/PNG/favicon、Markdown 规范、HTML 视觉原型、Alembic 迁移文件、测试源码和 JSON fixtures 可以跟踪。现有业务代码、公式、Logo、配色和依赖清单没有被本轮修改。

## 4. 忽略规则和属性规则

根目录 `.gitignore` 排除以下类别：

- `node_modules`、`.next`、`storybook-static`；
- Python 虚拟环境、`__pycache__`、pytest/mypy/ruff 缓存和 `*.pyc`；
- `.env`、`.env.local`、`.env.production` 和本地环境变体；
- `*.db`、`*.sqlite`、`*.sqlite3` 及 SQLite sidecar；
- `deploy\secrets` 真实内容；
- PEM、KEY、PFX、P12；
- coverage、dist、build 和 TypeScript 构建缓存。

例外规则允许 `.env.example`、secret 示例文件、README 和 `.gitkeep`。

根目录 `.gitattributes` 明确 CMD/BAT 使用 CRLF，shell 脚本使用 LF，Python、TypeScript、Markdown、JSON 等文本使用 LF；PNG、JPG、ZIP 和数据库扩展名按二进制处理。

## 5. 数据库权威判定

权威数据库：

```text
D:\Codex使用\矿业智工平台\04_前端工程\mineworks-web\backend\data\mineworks.db
```

判定依据是 `11_START_FASTAPI.cmd` 的 `backend` 启动目录、Pydantic `.env` 加载位置、未设置数据库覆盖项、默认相对路径和实际业务数据。详细证据见：

```text
07_测试与验收\01_数据库基线\SQLite权威数据库判定报告_V1.1.1.md
```

发现的数据库及 SHA-256：

| 数据库 | 状态 | SHA-256 |
|---|---|---|
| `04_前端工程\mineworks-web\backend\data\mineworks.db` | 权威数据库 | `48E3031F77123B334CC32C32E76F111296BA347280766FC422CDBEE9F11EDF89` |
| `04_前端工程\mineworks-web\data\mineworks.db` | 非权威空数据库，保留未动 | `1644C383CCC28CE9C44B4B61F5E3249DB7E6D643396A32D3B6B8329F6948953C` |

两份数据库均未被 Git 跟踪。

## 6. 数据库项目外备份

备份目录：

```text
D:\Codex使用\矿业智工平台_安全备份\V1.1.1_20260715\数据库\
```

| 备份文件 | 来源 | SHA-256 |
|---|---|---|
| `mineworks.db` | 权威数据库 | `48E3031F77123B334CC32C32E76F111296BA347280766FC422CDBEE9F11EDF89` |
| `mineworks_20260715_075740_826.db` | 非权威空数据库 | `1644C383CCC28CE9C44B4B61F5E3249DB7E6D643396A32D3B6B8329F6948953C` |

`DATABASE_SOURCE_MAP.md` 记录完整来源路径。两份源文件与备份 SHA-256 相等；原数据库没有移动、覆盖、修改或删除。

## 7. 源码归档

归档从 `v1.1.1-stable` 的 504 个 Git 跟踪文件直接生成。

```text
D:\Codex使用\矿业智工平台_安全备份\V1.1.1_20260715\源码\矿业智工平台_全项目源码基线_V1.1.1.zip
```

SHA-256：

```text
CDEF4C239DB39BCCAF6823E12C958B075A71F2C8768BBAD48D37BD5BF5275635
```

校验文件：

```text
D:\Codex使用\矿业智工平台_安全备份\V1.1.1_20260715\源码\矿业智工平台_全项目源码基线_V1.1.1.sha256
```

ZIP 内容复核：文件条目 504，数据库、环境文件、真实 secret、私钥、`node_modules`、`.next`、Storybook 静态构建、虚拟环境和构建缓存命中均为 0；归档内包含修正后的 `23_VERIFY_GIT_BASELINE.cmd`。

首次生成的归档包含验证脚本路径搜索缺陷，未作为最终基线覆盖或删除，而是保留为带 `superseded_d4acfdd` 后缀的历史证据；固定文件名指向本报告记录的正式归档。

## 8. 敏感文件检查

暂存前和暂存后均执行路径与内容特征检查：

| 检查项 | 结果 |
|---|---:|
| 被跟踪数据库 | 0 |
| 被跟踪 `.env`/`.env.local` | 0 |
| 被跟踪真实 `deploy\secrets` | 0 |
| 被跟踪私钥扩展名 | 0 |
| 私钥文件头命中 | 0 |
| 已知 API/token 格式命中 | 0 |
| 被跟踪生成目录或虚拟环境 | 0 |

凭据关键词扫描发现的 6 个候选均属于开发示例、SQLite URL、secret 文件引用、测试代码或开发文档，没有发现真实凭据。扫描过程没有在报告中回显任何本地环境值。

## 9. 版本标识差异

部分示例配置、API 元数据、Docker、生产 Compose 和 README 仍显示 1.1.0；一项工具版本也为 1.1.0，但工具/公式版本不能随平台版本自动升级。详细清单：

```text
07_测试与验收\03_Git基线\版本标识差异清单_V1.1.1.md
```

本轮没有批量替换或修改任何现有版本值。

## 10. 未解决风险

1. 两份 SQLite 均没有 `alembic_version` 表；后续迁移前必须明确 revision 对齐策略。
2. 非权威空数据库仍留在 `mineworks-web\data`，可能被人工误认；本轮按禁止事项保留未动。
3. 外部用户级/系统级数据库环境变量未来仍可能覆盖 `11_START_FASTAPI.cmd` 默认路径。
4. CSRF 生产安全校验缺口仍未处理，本轮按要求不修改。
5. PySide6 桌面版源码和公式资料仍未进入项目，唯一计算核心工作仍被阻塞。
6. PostgreSQL 迁移、生产 Compose、TLS、备份恢复演练仍未开始。
7. GitHub 地址尚未设置为 remote，也没有 push；这是本轮明确边界，不是失败。

## 11. 回退方法

### 11.1 基于 tag 创建安全回退分支

```text
git switch -c restore-v1.1.1 v1.1.1-stable
```

该方法不破坏现有 `main`。如果工作区存在未提交变化，应先另行备份或提交，不得直接覆盖。

### 11.2 只读查看稳定基线

```text
git switch --detach v1.1.1-stable
```

查看后使用 `git switch main` 返回主分支。

### 11.3 使用源码 ZIP 回退

先校验 `.sha256`，再解压到新的空目录，不得覆盖当前真实数据库或本地 `.env`。

### 11.4 数据库回退

数据库恢复不属于本轮任务。需要恢复时必须停止相关服务、再次备份当前库、核对 `DATABASE_SOURCE_MAP.md` 和 SHA-256，并在获得明确授权后执行；不得把源码 ZIP 当作数据库备份。

## 12. 本轮边界声明

- 未修改业务功能、工程公式、Logo、配色、`package.json`、锁文件或数据库；
- 未运行数据库迁移、初始化、清空、删除或恢复；
- 未处理 CSRF 风险或批量修改版本号；
- 未移动 `backend` 或 `mining_core`；
- 未开发新工具；
- 未设置远程仓库、未 push、未部署；
- 仅执行本地 Git 初始化、暂存、安全检查、提交、tag、项目外备份和源码归档。
