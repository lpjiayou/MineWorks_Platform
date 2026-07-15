# 统一计算历史 SQLite 数据结构说明

> 版本：V0.8  
> 数据库：`backend/data/mineworks.db`

## 1. projects

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | 项目ID，格式`prj_...` |
| name | TEXT | 项目名称 |
| code | TEXT | 项目编号，可空，非空时唯一 |
| description | TEXT | 项目说明 |
| status | TEXT | active/archived |
| created_at | TEXT | UTC ISO时间 |
| updated_at | TEXT | UTC ISO时间 |

## 2. calculation_records

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | 计算记录ID，格式`calc_...` |
| source_request_id | TEXT | 原计算API request_id |
| tool_id | TEXT | 工具ID |
| tool_name | TEXT | 工具名称快照 |
| tool_version | TEXT | 工具版本快照 |
| formula_version | TEXT | 公式版本快照 |
| title | TEXT | 记录标题 |
| project_id | TEXT FK | 项目ID，可空 |
| data_source | TEXT | manual/example/import/live等 |
| validity | TEXT | VALID/CAUTION/INVALID等 |
| computed_at | TEXT | 原计算时间 |
| saved_at | TEXT | 保存时间 |
| updated_at | TEXT | 记录更新时间 |
| inputs_json | TEXT | 原始输入JSON |
| normalized_inputs_json | TEXT | 标准单位输入JSON |
| results_json | TEXT | 结果JSON |
| steps_json | TEXT | 计算步骤JSON |
| warnings_json | TEXT | 警告JSON |
| assumptions_json | TEXT | 假设JSON |
| reusable_outputs_json | TEXT | 可复用字段及映射JSON |
| tags_json | TEXT | 标签JSON |
| note | TEXT | 用户备注 |

## 3. 索引

```text
projects.code（唯一、非空）
calculation_records.saved_at
calculation_records.tool_id + saved_at
calculation_records.project_id + saved_at
```

## 4. 当前阶段说明

SQLite用于本地开发和产品功能验证，优点是无需新增数据库服务。正式上线后建议迁移到PostgreSQL，并增加：

```text
user_id
organization_id
created_by
updated_by
revision
soft_delete
审计日志
```
