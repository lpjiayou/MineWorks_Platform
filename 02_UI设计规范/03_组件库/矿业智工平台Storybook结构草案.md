# 矿业智工平台 Storybook 结构草案

> 项目：矿业智工平台  
> 设计系统：MineWorks UI  
> 文档版本：V0.1  
> 编制日期：2026-07-14  
> 建议保存目录：  
> `D:\Codex使用\矿业智工平台\02_UI设计规范\03_组件库\`

---

# 1. 文档目的

本草案用于规划 MineWorks UI 的 Storybook 信息架构、目录、主题、文档、交互、测试和发布方式。

Storybook不是单纯的组件截图页面，而是以下工作的统一入口：

```text
组件视觉确认
＋
组件状态确认
＋
工程示例
＋
无障碍检查
＋
交互测试
＋
视觉回归
＋
开发文档
```

---

# 2. 建设目标

Storybook V0.1 必须做到：

1. 所有 P0 组件均有 Story；
2. 所有组件展示浅色和深色主题；
3. 关键组件展示 1366px、平板和手机宽度；
4. 所有表单组件展示正常、警告、错误、禁用和只读状态；
5. 工程组件展示 0、null、NaN、单位和有效性；
6. 权限组件展示免费、专业、团队和企业；
7. Modal、Drawer、Tabs、Select 等组件支持键盘测试；
8. 工具卡片和结果卡片提供真实矿业工程示例；
9. Storybook 与单元测试、交互测试和视觉回归联动。

---

# 3. 建议目录

```text
apps/web/
├─ .storybook/
│  ├─ main.ts
│  ├─ preview.tsx
│  ├─ manager.ts
│  ├─ preview-head.html
│  └─ theme/
│     ├─ mineworks-light.ts
│     └─ mineworks-dark.ts
│
├─ components/
│  ├─ brand/
│  │  └─ BrandLogo/
│  ├─ primitives/
│  │  ├─ Button/
│  │  ├─ IconButton/
│  │  ├─ TextInput/
│  │  ├─ NumberInput/
│  │  ├─ Select/
│  │  ├─ Checkbox/
│  │  ├─ RadioGroup/
│  │  └─ Switch/
│  ├─ forms/
│  │  ├─ Field/
│  │  ├─ UnitInput/
│  │  └─ SearchInput/
│  ├─ feedback/
│  │  ├─ Badge/
│  │  ├─ Alert/
│  │  ├─ Toast/
│  │  ├─ EmptyState/
│  │  ├─ LoadingSkeleton/
│  │  └─ ErrorState/
│  ├─ layout/
│  │  ├─ Card/
│  │  ├─ Panel/
│  │  ├─ PublicHeader/
│  │  └─ WorkspaceHeader/
│  ├─ navigation/
│  │  ├─ Tabs/
│  │  ├─ Accordion/
│  │  ├─ Breadcrumb/
│  │  └─ FilterBar/
│  ├─ overlays/
│  │  ├─ Modal/
│  │  ├─ Drawer/
│  │  ├─ Tooltip/
│  │  ├─ Popover/
│  │  └─ DropdownMenu/
│  ├─ tools/
│  │  ├─ ToolCard/
│  │  ├─ ResultMetricCard/
│  │  ├─ FormulaBlock/
│  │  ├─ CalculationSteps/
│  │  └─ ExportMenu/
│  ├─ domain/
│  │  ├─ EngineeringValue/
│  │  ├─ ValidityBadge/
│  │  ├─ PermissionGate/
│  │  ├─ ProjectPicker/
│  │  └─ SaveStatus/
│  └─ data-display/
│     ├─ Table/
│     └─ ChartFrame/
│
├─ stories/
│  ├─ 00-Introduction/
│  ├─ 01-Foundations/
│  ├─ 02-Primitives/
│  ├─ 03-Forms/
│  ├─ 04-Feedback/
│  ├─ 05-Layout/
│  ├─ 06-Navigation/
│  ├─ 07-Overlays/
│  ├─ 08-Tools/
│  ├─ 09-Domain/
│  ├─ 10-Patterns/
│  └─ 99-Deprecated/
│
└─ tests/
   ├─ storybook/
   ├─ accessibility/
   └─ visual/
```

---

# 4. Storybook 导航结构

建议 Story 标题统一使用：

```text
00 Introduction/Overview
01 Foundations/Colors
01 Foundations/Typography
01 Foundations/Spacing
01 Foundations/Radius
01 Foundations/Motion

02 Primitives/Button
02 Primitives/IconButton
02 Primitives/Checkbox
02 Primitives/RadioGroup
02 Primitives/Switch

03 Forms/TextInput
03 Forms/NumberInput
03 Forms/UnitInput
03 Forms/Select
03 Forms/Field
03 Forms/SearchInput

04 Feedback/Badge
04 Feedback/Alert
04 Feedback/Toast
04 Feedback/EmptyState
04 Feedback/LoadingSkeleton
04 Feedback/ErrorState

05 Layout/Card
05 Layout/Panel
05 Layout/PublicHeader
05 Layout/WorkspaceHeader

06 Navigation/Tabs
06 Navigation/Accordion
06 Navigation/Breadcrumb
06 Navigation/FilterBar

07 Overlays/Modal
07 Overlays/Drawer
07 Overlays/Tooltip
07 Overlays/Popover
07 Overlays/DropdownMenu

08 Tools/ToolCard
08 Tools/ResultMetricCard
08 Tools/FormulaBlock
08 Tools/CalculationSteps
08 Tools/ExportMenu

09 Domain/EngineeringValue
09 Domain/ValidityBadge
09 Domain/PermissionGate
09 Domain/ProjectPicker
09 Domain/SaveStatus

10 Patterns/ToolCenter
10 Patterns/BasicToolPage
10 Patterns/PermissionPreview
10 Patterns/PageStates
```

---

# 5. Story 文件规范

每个组件目录建议包含：

```text
Button/
├─ Button.tsx
├─ Button.module.css
├─ Button.types.ts
├─ Button.stories.tsx
├─ Button.test.tsx
├─ Button.a11y.test.tsx
└─ index.ts
```

Story 文件使用 CSF，并统一：

```ts
const meta = {
  title: "02 Primitives/Button",
  component: Button,
  parameters: {
    layout: "centered"
  },
  tags: ["autodocs"]
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;
```

不在 Story 中复制组件实现。

---

# 6. 全局 Decorators

建议配置以下 Decorator：

## 6.1 ThemeDecorator

支持：

```text
Light
Dark
System
```

作用：

- 注入主题类或`data-theme`；
- 切换Logo版本；
- 更新图表颜色；
- 更新页面背景。

## 6.2 DensityDecorator

支持：

```text
Comfortable
Compact
```

作用：

- 输入高度；
- 面板内边距；
- 表格行高；
- 工具栏高度。

## 6.3 LocaleDecorator

支持：

```text
zh-CN
en-US
```

第一阶段默认 `zh-CN`。

## 6.4 EngineeringContextDecorator

提供统一上下文：

- 单位注册表；
- 数值格式；
- 状态翻译；
- 示例项目；
- 权限套餐；
- Toast容器；
- ThemeProvider。

## 6.5 RouterDecorator

供以下组件使用：

- Breadcrumb；
- ToolCard；
- PublicHeader；
- FilterBar；
- 页面模式。

---

# 7. 全局 Toolbar

Storybook 顶部工具栏建议包含：

```text
主题：浅色 / 深色 / 跟随系统
密度：舒适 / 紧凑
语言：中文 / English
套餐：游客 / 免费 / 专业 / 团队 / 企业
视口：手机 / 平板 / 1366 / 1440 / 1920
数据状态：VALID / CAUTION / INCONSISTENT / INVALID / STALE
```

这能快速验证组件在不同产品条件下的表现。

---

# 8. 视口配置

建议预设：

| 名称 | 宽度 | 高度 |
|---|---:|---:|
| Mobile 390 | 390 | 844 |
| Tablet 768 | 768 | 1024 |
| Desktop 1024 | 1024 | 768 |
| Desktop 1366 | 1366 | 768 |
| Desktop 1440 | 1440 | 900 |
| Desktop 1920 | 1920 | 1080 |

关键页面模式必须在 1366×768 和 390×844 下测试。

---

# 9. 每个组件必须包含的 Stories

## 9.1 通用 Story

```text
Default
Variants
Sizes
States
DarkTheme
Responsive
Accessibility
EngineeringExample
```

## 9.2 表单组件

增加：

```text
ZeroValue
NullValue
Warning
Error
Disabled
Readonly
Keyboard
```

## 9.3 工程结果组件

增加：

```text
FlowValue
DensityValue
PercentageValue
Zero
Missing
ScientificNotation
Caution
Inconsistent
```

## 9.4 权限组件

增加：

```text
Guest
Free
ProfessionalPreview
TeamBlocked
Enterprise
QuotaExceeded
```

## 9.5 状态组件

增加：

```text
Initial
Loading
Success
Warning
Error
Offline
ServiceUnavailable
StaleData
```

---

# 10. 工程示例数据

Story 中不得仅使用 `Lorem ipsum`。

建议公共 fixtures：

```text
drySolidsNormal
drySolidsZeroFlow
drySolidsWarningDensity
drySolidsInconsistent
toolCardFree
toolCardProfessional
toolCardReviewing
instrumentFlowValid
instrumentDensityStale
projectListExample
```

示例：

```ts
export const drySolidsNormal = {
  slurryVolumeFlow: { value: 118.37, unit: "m3/h" },
  slurryDensity: { value: 1.38, unit: "t/m3" },
  solidsMassFraction: { value: 42, unit: "%" },
  result: {
    slurryMassFlow: 163.35,
    drySolidsRate: 68.61,
    waterMassFlow: 94.74,
    validity: "VALID"
  }
};
```

---

# 11. Autodocs 页面结构

每个组件自动文档应包含：

1. 组件用途；
2. 不适用场景；
3. Anatomy；
4. Props；
5. 变体；
6. 状态；
7. 键盘；
8. 可访问性；
9. 响应式；
10. 深色主题；
11. 工程示例；
12. 错误用法；
13. 测试要求；
14. 版本记录。

---

# 12. 交互测试

关键 Story 使用 `play` 测试：

- Button 点击；
- Loading 防重复提交；
- Tabs 键盘切换；
- Modal 焦点锁定；
- Drawer Escape关闭；
- Select 键盘选择；
- UnitInput 单位切换；
- ProjectPicker 项目搜索；
- PermissionGate 权限切换；
- Toast 队列；
- FilterBar 清除条件。

示例目标：

```ts
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, userEvent }) => {
    // 聚焦并使用键盘操作
  }
};
```

---

# 13. 无障碍检查

每个 P0 组件必须通过：

- 可访问性插件检查；
- 键盘操作；
- 可见焦点；
- 语义角色；
- Label关联；
- 错误关联；
- 对比度；
- 状态文字；
- 44px触控区域。

重点组件：

```text
UnitInput
Tabs
Modal
Drawer
Select
PermissionGate
ValidityBadge
ErrorState
```

---

# 14. 视觉回归

Storybook 是视觉回归截图源。

必须建立：

```text
Button_AllVariants_Light
Button_AllVariants_Dark
UnitInput_AllStates
ToolCard_AllAccessLevels
ResultMetricCard_ZeroNullWarning
ValidityBadge_AllStates
Modal_SaveProject
PermissionGate_ProfessionalPreview
ToolCenter_1366
BasicToolPage_1366
BasicToolPage_Mobile
```

任何以下修改都触发回归：

- Logo；
- 主色；
- 字体；
- 间距；
- 圆角；
- Button；
- UnitInput；
- ToolCard；
- ResultMetricCard；
- Header；
- 主题令牌。

---

# 15. Storybook 首页

首页建议展示：

```text
MineWorks UI V0.1
当前版本
组件数量
P0完成率
主题
设计原则
快速入口
工程示例
开发红线
```

首页必须明确：

> MineWorks UI 是矿业工程专业设计系统，不是通用后台模板。

---

# 16. 发布策略

建议环境：

```text
本地开发：http://localhost:6006
测试环境：内部受限访问
正式文档：随前端版本发布
```

每次发布记录：

- 版本号；
- 新增组件；
- 修改组件；
- 破坏性变更；
- 迁移说明；
- 测试结果；
- 视觉回归结果。

---

# 17. Storybook 里程碑

## M1：基础可运行

- Storybook工程；
- ThemeDecorator；
- DensityDecorator；
- Colors；
- Typography；
- Button；
- Input；
- Badge。

## M2：工具页面组件

- UnitInput；
- ToolCard；
- ResultMetricCard；
- EngineeringValue；
- ValidityBadge；
- FormulaBlock；
- CalculationSteps。

## M3：状态与权限

- EmptyState；
- LoadingSkeleton；
- ErrorState；
- PermissionGate；
- ProjectPicker；
- ExportMenu。

## M4：页面模式

- ToolCenter；
- BasicToolPage；
- PermissionPreview；
- PageStates；
- 1366与手机截图。

---

# 18. 验收标准

Storybook V0.1 验收：

- P0组件全部可查看；
- 每个组件有Autodocs；
- 浅色和深色可切换；
- 舒适和紧凑可切换；
- 工程示例真实；
- 0与null状态正确；
- 关键交互有play测试；
- 无障碍检查无严重问题；
- 1366与手机视口可用；
- 视觉回归基线建立；
- 不显示第三方默认主题风格。

---

# 19. 设计红线

1. 不用纯展示截图代替真实组件；
2. 不用Lorem ipsum代替工程示例；
3. 不跳过深色主题；
4. 不跳过0和null；
5. 不用颜色单独表达状态；
6. 不把页面业务请求写进组件Story；
7. 不在Story中复制组件实现；
8. 不跳过键盘和焦点测试；
9. 不让第三方组件默认样式直接暴露；
10. 不在视觉回归未通过时发布组件版本。

---

# 20. 下一步

Storybook结构确认后，进入：

```text
初始化Next.js工程
→ 建立设计令牌
→ 初始化Storybook
→ 实现ThemeProvider
→ 开发P0基础组件
→ 开发工具领域组件
→ 建立BasicToolPage模式
→ 接入干固体量工具
```
