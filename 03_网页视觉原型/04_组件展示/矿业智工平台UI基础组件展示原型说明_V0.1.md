# 矿业智工平台 UI 基础组件展示高保真原型 V0.1 说明

> 编制日期：2026-07-14  
> 对应规范：《矿业智工平台UI基础组件库V0.1规范.md》  
> 页面性质：独立HTML高保真交互原型，不是正式生产组件库

---

## 一、建议保存位置

```text
D:\Codex使用\矿业智工平台\03_网页视觉原型\04_组件展示\
```

文件：

```text
矿业智工平台UI基础组件展示高保真原型_V0.1.html
矿业智工平台UI基础组件展示原型说明_V0.1.md
```

---

## 二、本轮完成内容

原型已展示以下组件与规范：

### Foundations

- 品牌色与语义色；
- 浅色、深色主题；
- 字体层级；
- 4px间距系统；
- 圆角体系；
- 舒适、紧凑密度。

### Primitives

- Button；
- IconButton；
- TextInput；
- NumberInput；
- UnitInput；
- Select；
- Checkbox；
- Radio；
- Switch；
- Tooltip。

### Feedback

- MembershipBadge；
- StatusBadge；
- ValidityBadge；
- Alert；
- Toast；
- EmptyState；
- LoadingSkeleton；
- ErrorState。

### Domain Components

- ToolCard；
- ResultMetricCard；
- EngineeringValue；
- FormulaBlock；
- CalculationSteps；
- PermissionGate；
- 工程数据有效性。

### Navigation and Overlays

- Tabs；
- Accordion；
- Modal；
- Drawer；
- 组件目录；
- 搜索。

### Data Display

- 工程表格；
- 数值右对齐；
- 单位列；
- 数据状态；
- 时间字段。

---

## 三、可交互功能

1. 浅色、深色主题切换；
2. 舒适、紧凑密度切换；
3. 组件名称搜索；
4. 左侧目录定位；
5. Checkbox、Radio、Switch；
6. Tabs切换；
7. Accordion展开；
8. Modal打开和确认；
9. Drawer打开和关闭；
10. Tooltip；
11. Toast反馈；
12. 响应式侧栏。

快捷键：

```text
Ctrl+K：聚焦组件搜索
Escape：关闭Modal或Drawer
```

---

## 四、设计验证重点

### 工程数值

原型明确验证：

```text
0 → 有效数值
null → —
NaN → 计算错误
```

### 状态表达

所有状态均包含文字，不只依赖颜色。

### 权限表达

专业会员与团队功能展示价值、所需套餐和免费替代，不只显示锁图标。

### 单位输入

数值和单位在同一字段中，正式开发时必须由统一单位注册表处理换算。

### 响应式

验证范围：

```text
1920×1080
1366×768
1024×768
768×1024
390×844
```

---

## 五、当前未完成

- React和TypeScript组件；
- Storybook工程；
- 设计令牌JSON；
- 组件清单JSON；
- 单元测试；
- Playwright测试；
- 视觉回归基线；
- 正式图标库；
- DataGrid；
- ChartFrame；
- ProcessCanvas；
- PID趋势组件。

---

## 六、版本定位

```text
MineWorks UI V0.1
高保真组件视觉基线
```

该版本用于进入Next.js开发前的组件视觉确认。

---

## 七、下一步

建议继续生成：

```text
01_矿业智工平台设计令牌_V0.1.json
02_矿业智工平台组件清单_V0.1.json
03_矿业智工平台Storybook结构草案.md
04_矿业智工平台组件库开发任务清单.md
```

建议保存位置：

```text
D:\Codex使用\矿业智工平台\02_UI设计规范\03_组件库\
```

完成上述文件后，即可正式初始化Next.js和MineWorks UI前端工程。
