# Python模块路径热修复说明 V1.1.1

## 故障

运行 `21_VERIFY_PRODUCTION_BASE.cmd` 时，前三步通过，第4步报：

```text
ModuleNotFoundError: No module named 'app'
```

## 根因

直接执行：

```text
python scripts\check_production_config.py
```

时，Python将 `backend\scripts` 作为搜索根目录，无法找到同级的 `backend\app`。

## 修复

验证脚本改为：

```text
python -m scripts.check_production_config --skip-database
```

SQLite到PostgreSQL迁移脚本同步改为：

```text
python -m scripts.migrate_sqlite_to_postgres ...
```

两个Python脚本同时增加后端根目录引导，因此直接执行和模块执行均可用。

## 操作

覆盖V1.1.1增量包后，重新运行：

```text
21_VERIFY_PRODUCTION_BASE.cmd
```

第4步应输出生产安全配置JSON，最终显示：

```text
VERIFY_PRODUCTION_BASE_V11_OK
```

截图中的 `39 passed, 1 warning` 表示后端测试已通过。Starlette TestClient弃用警告不是此次失败原因。
