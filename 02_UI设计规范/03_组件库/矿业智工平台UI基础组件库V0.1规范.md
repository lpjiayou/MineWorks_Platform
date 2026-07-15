# 矿业智工平台 UI 基础组件库 V0.1 规范

> 项目名称：矿业智工平台  
> 英文名称：MineWorks Platform  
> 文档类型：设计系统规范＋组件库规范＋前端实施约束  
> 文档版本：V0.1  
> 编制日期：2026-07-14  
> 当前阶段：网页核心组件设计阶段  
> 对应页面：
>
> 1. 工具中心高保真视觉原型 V0.1  
> 2. 干固体量计算工具高保真视觉原型 V0.1  
> 3. 首页高保真视觉原型 V0.4  
>
> 上位依据：
>
> 1. 《矿业智工平台总体实施计划.md》
> 2. 《矿业智工平台产品需求与技术实施规范.md》
> 3. 《矿业智工平台网页信息架构与UI设计系统规范.md》
> 4. 《矿业智工平台工具中心与基础工具详情页设计规范.md》
> 5. 《矿业智工平台Logo标准制图与品牌使用规范.md》

---

# 1. 文档目的

本规范用于建立矿业智工平台第一阶段网页组件库的统一标准，确保首页、工具中心、工具详情页、项目工作台、知识库、AI工程助手和后续高级分析页面在视觉、交互、代码结构和专业表达上保持一致。

本规范重点解决：

1. 不同页面是否使用统一颜色、间距、圆角和字体；
2. 按钮、输入框、卡片、状态和提示是否重复设计；
3. 选矿、采矿、自动化、电气等专业页面如何共享组件；
4. 工程数值、单位、公式和数据有效性如何统一展示；
5. 免费、专业会员、团队和企业权限如何统一表达；
6. 加载、空数据、错误、警告和服务不可用状态如何统一；
7. 组件如何支持浅色、深色、响应式和无障碍；
8. Next.js开发时如何避免样式散落和页面硬编码；
9. 如何建立Storybook、视觉回归和组件验收流程；
10. 如何使后续几十个工程工具在同一标准下快速扩展。

组件库的目标不是制作一批“漂亮控件”，而是建立：

```text
品牌语言
＋
工程交互规则
＋
专业数据表达
＋
权限与状态体系
＋
可复用前端代码
```

---

# 2. 组件库定位

组件库暂定名称：

```text
MineWorks UI
```

第一阶段版本：

```text
MineWorks UI V0.1
```

服务范围：

- 公共门户；
- 工具中心；
- 基础计算工具；
- 项目工作台；
- 工程知识库；
- AI工程助手；
- 动态工艺；
- 高级分析；
- 企业管理后台。

MineWorks UI不是通用互联网组件库，而是面向矿业工程场景的专业设计系统。

---

# 3. 设计原则

## 3.1 专业优先

组件必须优先保证：

- 数值清晰；
- 单位准确；
- 状态明确；
- 输入可追溯；
- 结果可复核；
- 风险可识别。

不得为了视觉效果牺牲工程信息。

## 3.2 一致优先

同类操作使用同类组件：

- 所有主操作使用同一Button体系；
- 所有数值输入使用NumberInput或UnitInput；
- 所有有效性使用ValidityBadge；
- 所有会员权限使用PermissionGate；
- 所有计算过程使用CalculationSteps。

## 3.3 低认知负担

用户应快速理解：

- 现在处于什么页面；
- 哪些字段必填；
- 哪些按钮可操作；
- 当前结果是否有效；
- 当前功能是否需要会员；
- 错误应如何修复。

## 3.4 克制的视觉

平台默认采用：

```text
浅色工程主题
青蓝主色
铜色会员辅助色
深色专业工作台作为补充
```

禁止：

- 大面积霓虹；
- 过强玻璃拟态；
- 多种高饱和色同时使用；
- 为卡片大量添加厚重阴影；
- 以动画替代信息层级。

## 3.5 渐进复杂度

```text
基础输入
→ 核心结果
→ 计算过程
→ 高级参数
→ 专业诊断
```

## 3.6 可访问性默认开启

所有组件从第一版开始支持：

- 键盘；
- 焦点；
- 屏幕阅读器；
- 高对比；
- 减少动态效果；
- 200%缩放；
- 移动端触控。

---

# 4. 组件系统分层

## 4.1 Foundations

- 颜色；
- 字体；
- 间距；
- 圆角；
- 阴影；
- 边框；
- 尺寸；
- 动效；
- 断点；
- 层级。

## 4.2 Primitives

- Button；
- Input；
- Select；
- Checkbox；
- Radio；
- Switch；
- Icon；
- Text；
- Divider；
- Tooltip。

## 4.3 Components

- UnitInput；
- ResultCard；
- ToolCard；
- Alert；
- Modal；
- Drawer；
- Tabs；
- Table；
- Pagination；
- Skeleton。

## 4.4 Domain Components

- FormulaBlock；
- CalculationSteps；
- ValidityBadge；
- EngineeringValue；
- UnitSelector；
- ToolStatusBadge；
- ProcessStateBadge；
- PermissionGate；
- ProjectPicker；
- InstrumentTag；
- EquipmentStatus；
- AlarmSeverityBadge。

## 4.5 Patterns and Templates

- 工具中心；
- 基础工具详情；
- 高级分析；
- 动态工艺；
- 项目工作台；
- 资料库；
- AI工程助手；
- 企业管理后台。

---

# 5. 技术实现原则

推荐技术体系：

```text
Next.js
React
TypeScript
设计令牌驱动样式
Storybook
Playwright
视觉回归测试
```

允许使用成熟的无障碍基础组件库作为底层交互支撑，但必须满足：

- 外观由MineWorks UI控制；
- 不直接暴露第三方默认样式；
- 不让第三方组件决定业务数据结构；
- 不绕过权限和状态规范；
- 后续可替换。

组件库必须独立于页面业务。

---

# 6. 项目目录建议

```text
apps/web/
├─ app/
├─ components/
│  ├─ brand/
│  ├─ layout/
│  ├─ navigation/
│  ├─ forms/
│  ├─ feedback/
│  ├─ data-display/
│  ├─ overlays/
│  ├─ charts/
│  ├─ tools/
│  ├─ projects/
│  ├─ permissions/
│  └─ domain/
├─ design-system/
│  ├─ tokens/
│  ├─ themes/
│  ├─ foundations/
│  ├─ utilities/
│  └─ index.ts
├─ stories/
├─ tests/
└─ public/brand/

packages/ui/
├─ src/
│  ├─ primitives/
│  ├─ components/
│  ├─ domain/
│  ├─ patterns/
│  ├─ hooks/
│  ├─ tokens/
│  └─ index.ts
├─ stories/
└─ tests/
```

初期可先放在`apps/web/components`，稳定后迁移到`packages/ui`。

---

# 7. 命名规范

## 7.1 React组件

使用PascalCase：

```text
BrandLogo
PrimaryButton
UnitInput
ResultMetricCard
ValidityBadge
CalculationSteps
```

## 7.2 文件名

```text
BrandLogo.tsx
BrandLogo.module.css
BrandLogo.test.tsx
BrandLogo.stories.tsx
```

## 7.3 Props

使用camelCase：

```text
isLoading
isDisabled
accessLevel
validationState
onValueChange
```

布尔属性优先：

```text
isLoading
isOpen
isSelected
hasWarning
```

不使用含义模糊的：

```text
active
flag
status1
type2
```

## 7.4 CSS变量

统一前缀：

```text
--mw-color-brand-primary
--mw-space-4
--mw-radius-md
--mw-shadow-sm
```

---

# 8. 设计令牌

## 8.1 浅色主题

| 令牌 | 色值 | 用途 |
|---|---|---|
| `--mw-color-bg-page` | `#F3F7F9` | 页面背景 |
| `--mw-color-bg-soft` | `#EAF2F5` | 柔和区域 |
| `--mw-color-surface` | `#FFFFFF` | 面板和卡片 |
| `--mw-color-surface-soft` | `#F8FBFC` | 次级面板 |
| `--mw-color-border` | `#CFDEE4` | 常规边框 |
| `--mw-color-border-strong` | `#A9C2CB` | 强调边框 |
| `--mw-color-text-primary` | `#10252E` | 主文字 |
| `--mw-color-text-secondary` | `#425D68` | 次文字 |
| `--mw-color-text-muted` | `#738891` | 辅助文字 |
| `--mw-color-brand-primary` | `#148E9D` | 品牌主色 |
| `--mw-color-brand-secondary` | `#2F7DA3` | 品牌辅助色 |
| `--mw-color-brand-dark` | `#0F6470` | 品牌深色 |
| `--mw-color-brand-soft` | `#DFF2F4` | 品牌浅背景 |
| `--mw-color-copper` | `#B8792D` | 会员和企业辅助色 |
| `--mw-color-copper-soft` | `#F4EADC` | 铜色浅背景 |

## 8.2 深色主题

| 令牌 | 色值 |
|---|---|
| `--mw-color-bg-page` | `#08131B` |
| `--mw-color-bg-soft` | `#0C1821` |
| `--mw-color-surface` | `#0F1E28` |
| `--mw-color-surface-soft` | `#132630` |
| `--mw-color-border` | `#294653` |
| `--mw-color-border-strong` | `#3C6270` |
| `--mw-color-text-primary` | `#EAF5F7` |
| `--mw-color-text-secondary` | `#ADC1C9` |
| `--mw-color-text-muted` | `#7C949F` |
| `--mw-color-brand-primary` | `#27C2CF` |
| `--mw-color-brand-secondary` | `#5AAADE` |

## 8.3 状态颜色

| 状态 | 主色 | 浅背景 |
|---|---|---|
| 正常 | `#2F9F6F` | `#E4F5EC` |
| 提示 | `#397EA5` | `#E5F0F6` |
| 警告 | `#D88A2B` | `#FFF3DF` |
| 危险 | `#D94F51` | `#FDE8E9` |
| 团队权限 | `#7154B6` | `#EEE9FB` |
| 未知/停用 | `#738891` | `#EEF2F4` |

状态颜色只能表达语义，不用于装饰。

## 8.4 字体

中文：

```text
Microsoft YaHei
PingFang SC
Noto Sans CJK SC
system-ui
```

英文和数字：

```text
Inter
system-ui
```

公式和代码：

```text
Consolas
JetBrains Mono
monospace
```

## 8.5 字号

| 令牌 | 大小 | 用途 |
|---|---:|---|
| `text-xs` | 11px | 辅助状态 |
| `text-sm` | 12px | 表格、说明 |
| `text-md` | 14px | 正文、表单 |
| `text-lg` | 16px | 面板标题 |
| `text-xl` | 18px | 卡片标题 |
| `text-2xl` | 22px | 区块标题 |
| `text-3xl` | 28px | 页面次标题 |
| `text-4xl` | 34px | 页面主标题 |
| `result-lg` | 28～32px | 核心结果 |

基础正文不得低于12px。

## 8.6 间距

采用4px基准：

| 令牌 | 值 |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |

## 8.7 圆角

| 令牌 | 值 | 用途 |
|---|---:|---|
| `radius-xs` | 6px | 小标签 |
| `radius-sm` | 10px | 小按钮 |
| `radius-md` | 12px | 输入、按钮 |
| `radius-lg` | 16px | 卡片 |
| `radius-xl` | 20px | 面板 |
| `radius-2xl` | 24px | 页面重点容器 |
| `radius-round` | 999px | 徽章、胶囊 |

## 8.8 Z-index

| 层级 | 数值 |
|---|---:|
| 页面内容 | 0 |
| 粘性工具栏 | 30 |
| 顶部导航 | 100 |
| Popover/Dropdown | 200 |
| Modal/Drawer | 300 |
| Toast | 400 |
| 全局阻断层 | 500 |

禁止随意使用9999。

---

# 9. 响应式令牌

建议断点：

```text
sm：560px
md：720px
lg：980px
xl：1280px
2xl：1536px
```

重点验收：

```text
390×844
768×1024
1024×768
1366×768
1440×900
1920×1080
```

内容容器：

```text
公共门户：最大1500～1600px
工具页面：最大1540px
长文页面：最大980px
```

---

# 10. 动效规范

## 10.1 时长

```text
快速反馈：120ms
常规交互：180ms
浮层：220ms
复杂展开：260ms
```

## 10.2 允许

- hover轻微上移；
- 输入焦点；
- Accordion展开；
- Modal淡入；
- Toast进入；
- 图表更新；
- 工艺流程流动。

## 10.3 禁止

- 大幅弹跳；
- 持续闪烁；
- 数值频繁滚动；
- 旋转Logo；
- 影响阅读的背景动画。

必须支持：

```css
@media (prefers-reduced-motion: reduce)
```

---

# 11. 图标规范

图标必须来自统一图标集或项目自绘SVG。

禁止：

- 混用多套风格；
- 使用Emoji作为正式图标；
- 使用位图小图标；
- 各页面自行绘制风格不一致图标。

尺寸：

```text
小：16px
常规：20px
按钮：18～20px
卡片：24px
工具图标容器：40～48px
```

需要逐步建立的专业图标：

- 破碎机；
- 球磨机；
- 旋流器；
- 浮选机；
- 浓密机；
- 压滤机；
- 泵；
- 电机；
- 阀门；
- 仪表；
- PLC；
- PID；
- 报告；
- 物料平衡；
- 金属平衡。

---

# 12. Button组件

组件名称：

```text
Button
```

变体：

```text
primary
secondary
tertiary
ghost
danger
link
```

尺寸：

```text
sm：34px
md：42px
lg：48px
```

状态：

- 默认；
- hover；
- active；
- focus；
- disabled；
- loading；
- success。

Props建议：

```ts
type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "ghost"
  | "danger"
  | "link";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  isDisabled?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
};
```

规则：

- 同一区域只设置一个主按钮；
- 删除和不可逆操作使用danger；
- loading时防止重复提交；
- disabled需要原因说明；
- 图标按钮必须有`aria-label`。

---

# 13. IconButton组件

用于：

- 收藏；
- 关闭；
- 主题切换；
- 搜索；
- 菜单；
- 更多操作。

要求：

```text
最小点击区域44×44px
图标尺寸18～20px
必须提供aria-label
```

收藏状态：

```text
未收藏：灰色
已收藏：铜色
```

---

# 14. Input组件

类型：

```text
TextInput
NumberInput
PasswordInput
SearchInput
```

默认高度：

```text
44px
```

状态：

- 默认；
- hover；
- focus；
- filled；
- disabled；
- readonly；
- error；
- warning；
- success。

结构：

```text
FieldLabel
Input
FieldHelp
FieldError
```

禁止仅使用placeholder替代Label。

---

# 15. NumberInput组件

必须支持：

- 正数；
- 负数；
- 0；
- 小数；
- 最大值；
- 最小值；
- 步长；
- 小数位；
- 空值；
- 键盘输入；
- 粘贴；
- 科学计数法开关。

规则：

- 0不能被当作空值；
- 空值与0必须区分；
- 不自动静默截断；
- 超出典型范围可警告；
- 超出数学范围应阻止；
- 输入期间不得频繁格式化导致光标跳动。

Props建议：

```ts
type NumberInputProps = {
  value: number | null;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  allowNegative?: boolean;
  allowScientific?: boolean;
  validationState?: "default" | "warning" | "error";
  onValueChange: (value: number | null) => void;
};
```

---

# 16. UnitInput组件

UnitInput是MineWorks UI核心领域组件。

结构：

```text
数值输入＋单位选择＋字段说明＋校验状态
```

必须支持：

- 单位切换；
- 数值保持或转换；
- 原始值记录；
- 标准单位值；
- 单位类型约束；
- 异常单位提示；
- 键盘导航。

数据结构：

```ts
type UnitValue = {
  value: number | null;
  unit: string;
};

type NormalizedUnitValue = {
  original: UnitValue;
  normalizedValue: number | null;
  normalizedUnit: string;
};
```

规则：

- 页面展示原始输入；
- 计算核心使用标准单位；
- 保存原始单位和标准化值；
- 切换单位必须明确是否换算；
- 不允许跨物理量选择单位；
- 禁止每个工具各自实现单位转换。

---

# 17. Select组件

支持：

- 单选；
- 搜索；
- 分组；
- 禁用项；
- 加载；
- 无结果；
- 键盘。

大量选项使用可搜索Select，不使用超长原生下拉。

---

# 18. Checkbox、Radio和Switch

Checkbox用于多选筛选和独立确认。

Radio用于互斥选项，例如项目保存位置。

Switch仅用于即时开关，例如：

- 显示仪表；
- 启用实时计算；
- 开启深色主题。

不得用Switch执行不可逆操作。

---

# 19. Field组件体系

统一字段结构：

```text
Field
├─ FieldLabel
├─ FieldRequiredMark
├─ FieldControl
├─ FieldHelp
├─ FieldWarning
└─ FieldError
```

错误优先级：

```text
Error > Warning > Help
```

错误信息必须说明：

- 什么错误；
- 正确范围；
- 如何修复。

---

# 20. SearchInput组件

用于：

- 全站搜索；
- 工具搜索；
- 资料搜索；
- 项目搜索；
- 设备搜索。

支持：

- 清空；
- 快捷键；
- 搜索建议；
- 最近搜索；
- 无结果；
- 搜索中。

工具中心快捷键：

```text
Ctrl+K
```

---

# 21. Badge组件

类型：

```text
StatusBadge
MembershipBadge
ToolTypeBadge
VersionBadge
CategoryBadge
```

权益：

- 免费：青蓝；
- 专业：铜色；
- 团队/企业：紫色。

审核：

- 已验证：绿色；
- 技术审核中：橙色；
- 教学示例：蓝色；
- 已停用：灰色；
- 无效：红色。

Badge不得只靠颜色，必须显示文字。

---

# 22. Alert组件

变体：

```text
info
success
warning
error
```

结构：

- 图标；
- 标题；
- 说明；
- 可选操作；
- 可选关闭。

使用场景：

- 单位提示；
- 工程范围警告；
- 数据不一致；
- 服务不可用；
- 权限不足。

---

# 23. Toast组件

用于短暂反馈：

- 已复制；
- 已保存；
- 已收藏；
- 导出完成；
- 设置更新。

不用于：

- 关键错误；
- 权限不足；
- 数据无效；
- 需要用户决策的内容。

默认显示2～4秒。

---

# 24. Card与Panel

Card变体：

```text
default
interactive
highlighted
outlined
danger
```

要求：

- 圆角统一；
- 标题、正文、底部操作结构统一；
- interactive有hover和focus；
- 普通卡片不全部浮起；
- 卡片内部不得层层嵌套。

Panel结构：

```text
Panel
├─ PanelHeader
├─ PanelToolbar
├─ PanelBody
└─ PanelFooter
```

PanelHeader高度建议56～64px。

---

# 25. ToolCard组件

字段：

```ts
type ToolCardData = {
  toolId: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  subcategory: string;
  toolType: string;
  accessLevel: "free" | "professional" | "team";
  status: "validated" | "reviewing" | "teaching" | "disabled";
  updatedAt: string;
  isFavorite: boolean;
};
```

状态：

- 默认；
- hover；
- focus；
- 收藏；
- 最近使用；
- 新增；
- 专业锁定；
- 团队锁定；
- 已停用；
- 加载骨架。

视图：

```text
card
compact
list
```

三个视图共享同一数据结构。

---

# 26. ResultMetricCard组件

字段：

- 名称；
- 数值；
- 单位；
- 状态；
- 公式摘要；
- 复制；
- 小数位；
- 无数据状态。

数据结构：

```ts
type EngineeringResultValue = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  precision?: number;
  state?: "default" | "valid" | "warning" | "invalid";
  note?: string;
};
```

规则：

- `0`显示为0；
- `null`显示为“—”；
- 不显示无意义小数；
- 单位与数值不可分离；
- 状态色只用于边框或小标记；
- 不使用红绿大面积背景。

---

# 27. EngineeringValue组件

统一显示：

```text
数值＋单位＋精度＋状态
```

支持：

```text
68.61 t/h
42.00 %
<0.01 mg/L
1.25×10⁻³
—
```

---

# 28. ValidityBadge组件

状态：

```text
VALID
CAUTION
INCONSISTENT
INVALID
STALE
NOT_CALCULATED
```

| 代码 | 中文 |
|---|---|
| VALID | 数据有效 |
| CAUTION | 结果需复核 |
| INCONSISTENT | 数据不一致 |
| INVALID | 数据无效 |
| STALE | 数据已过期 |
| NOT_CALCULATED | 尚未计算 |

ValidityBadge必须与说明文字一起出现。

---

# 29. FormulaBlock组件

用于：

- 公式；
- 单位换算；
- 代入过程；
- 计算步骤；
- 代码式表达。

支持：

- 多行；
- 复制；
- 横向滚动；
- 变量高亮；
- 公式版本；
- 屏幕阅读器说明。

不建议第一阶段引入复杂公式编辑器。

---

# 30. CalculationSteps组件

结构：

```text
CalculationSteps
├─ StepTitle
├─ FormulaBlock
├─ IntermediateValue
└─ StepNote
```

数据：

```ts
type CalculationStep = {
  id: string;
  title: string;
  formula: string;
  substitutedExpression?: string;
  result?: EngineeringResultValue;
  note?: string;
};
```

---

# 31. Tabs与Accordion

Tabs类型：

```text
line
card
segmented
```

使用：

- 计算过程/警告/JSON；
- 原理/公式/适用范围/版本；
- 工具分类；
- 设备详情。

要求：

- 支持键盘左右切换；
- 激活状态清晰；
- 小屏横向滚动；
- 不超过6个主Tab。

Accordion用于：

- 高级参数；
- 详细说明；
- FAQ；
- 版本记录；
- 复杂诊断。

不得隐藏关键结果。

---

# 32. Modal与Drawer

Modal用于：

- 保存到项目；
- 确认删除；
- 会员升级；
- 导出设置；
- 高风险确认。

要求：

- 焦点锁定；
- Escape关闭；
- 标题明确；
- 主按钮唯一；
- 小屏接近全屏。

Drawer用于：

- 手机筛选；
- 设备详情；
- 公式说明；
- 项目选择；
- AI上下文。

手机优先使用BottomDrawer。

---

# 33. Dropdown、Popover和Tooltip

Dropdown用于操作菜单。

Popover用于：

- 单位说明；
- 变量说明；
- 图表点详情；
- 工具快捷操作。

Tooltip用于：

- 图标按钮；
- 缩写；
- 状态说明；
- 禁用原因。

Tooltip不得替代字段说明、错误提示和关键专业说明。

---

# 34. Table组件

用于：

- 工具列表；
- 计算历史；
- 项目清单；
- 仪表清单；
- I/O清单；
- 版本记录。

必须支持：

- 排序；
- 筛选；
- 固定表头；
- 列宽；
- 数值右对齐；
- 单位列；
- 空状态；
- 加载；
- 行选择；
- 键盘。

复杂表格使用DataGrid。

---

# 35. DataGrid组件

用于：

- 大型I/O清单；
- 设备清单；
- 仪表清单；
- 多节点平衡数据；
- 生产数据。

第一阶段要求：

- 虚拟滚动；
- 列固定；
- 列隐藏；
- 批量选择；
- 单元格编辑；
- 校验；
- 导出；
- 权限。

DataGrid单独立项，不在V0.1完全实现。

---

# 36. Header与Breadcrumb

PublicHeader用于：

- 首页；
- 工具中心；
- 知识库；
- 会员；
- 企业服务。

WorkspaceHeader用于：

- 项目工作台；
- 动态工艺；
- 高级分析；
- 企业空间。

WorkspaceHeader显示：

- 当前项目；
- 保存状态；
- 版本；
- 协作成员；
- 返回入口。

Breadcrumb要求：

- 层级不超过5级；
- 当前页不可点击；
- 手机可折叠；
- 可复用结构化数据。

---

# 37. BrandLogo组件

变体：

```text
horizontal
primary
symbol
```

主题：

```text
light
dark
auto
```

尺寸：

```text
sm
md
lg
```

要求：

- 不硬编码路径；
- 不拉伸；
- 深浅主题自动切换；
- 手机切换symbol；
- 统一aria-label；
- Logo版本由组件库管理。

---

# 38. FilterBar组件

用于工具中心和资料库。

支持：

- 搜索；
- 多选筛选；
- 已选条件；
- 清除；
- 排序；
- 视图切换；
- URL状态；
- 移动端Drawer。

筛选变化不整页刷新。

---

# 39. Empty、Loading与Error

## EmptyState

场景：

- 无工具；
- 无项目；
- 无计算记录；
- 无搜索结果；
- 无权限；
- 无设备数据。

结构：

- 图标；
- 标题；
- 说明；
- 主操作；
- 可选次操作。

不得只显示“暂无数据”。

## LoadingSkeleton

类型：

- 工具卡片；
- 表格；
- 结果卡片；
- 页面；
- 图表。

加载短于300ms时避免闪烁骨架。

## ErrorState

必须显示：

- 错误类型；
- 用户说明；
- 修复建议；
- 重试；
- request_id；
- 可选反馈。

禁止显示后端堆栈。

---

# 40. PermissionGate组件

Props建议：

```ts
type PermissionGateProps = {
  feature: string;
  requiredPlan: "free" | "professional" | "team" | "enterprise";
  currentPlan?: string;
  mode?: "block" | "preview" | "hide";
  children: ReactNode;
  fallback?: ReactNode;
};
```

规则：

- 前端只负责展示；
- 后端必须再次校验；
- 专业功能可预览；
- 不应完全隐藏价值；
- 升级入口说明具体权益。

MembershipBadge统一显示：

```text
免费
专业
团队
企业
```

不使用VIP1、VIP2、SVIP。

---

# 41. ProjectPicker与ExportMenu

ProjectPicker支持：

- 当前项目；
- 最近项目；
- 搜索；
- 新建项目；
- 独立记录；
- 权限。

保存前保留输入，登录跳转后恢复。

ExportMenu第一阶段：

```text
复制文本
Markdown
PNG
打印/PDF
```

专业版：

```text
Excel
Word
正式PDF
批量包
```

---

# 42. SaveStatus与ThemeToggle

SaveStatus状态：

```text
未保存
保存中
已保存
保存失败
有未保存更改
离线草稿
```

ThemeToggle支持：

```text
浅色
深色
跟随系统
```

要求：

- 用户选择优先；
- 本地保存；
- 登录后同步；
- 不产生布局跳动；
- Logo和图表同步更新。

---

# 43. ChartFrame组件

结构：

```text
ChartFrame
├─ ChartHeader
├─ Legend
├─ Toolbar
├─ Plot
├─ Empty/Loading/Error
└─ Footnote
```

必须支持：

- 标题；
- 单位；
- 图例；
- 时间范围；
- 导出；
- 空状态；
- 数据质量；
- 深浅主题。

图表颜色建议：

```text
品牌青蓝
过程蓝
铜色
绿色
紫色
灰蓝
```

警告和危险色只用于状态线。

---

# 44. 趋势图规范

趋势图支持：

- 最新点；
- 时间轴；
- 缩放；
- 十字光标；
- Tooltip；
- 数据质量；
- 单位；
- 目标线；
- 报警线；
- 空数据；
- 暂停；
- 导出。

动态工艺趋势明确：

```text
PV
SP
MV
状态
```

---

# 45. 工程数值规则

```text
0：有效数值
null：无数据
undefined：未提供
NaN：计算错误
```

前端显示：

```text
0 → 0.00
null → —
NaN → 计算错误
```

小数位由字段定义：

```text
流量：2位
密度：3位
浓度：2位
品位：2～4位
百分比：2位
```

---

# 46. 单位系统

建立统一单位注册表：

```ts
type UnitDefinition = {
  id: string;
  symbol: string;
  quantity: string;
  baseUnit: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  precision?: number;
};
```

第一阶段物理量：

- 体积流量；
- 质量流量；
- 密度；
- 浓度；
- 品位；
- 金属量；
- 压力；
- 液位；
- 功率；
- 电流；
- 频率；
- 时间；
- 转速。

单位转换不得散落在组件中。

---

# 47. 状态体系

数据状态：

```text
VALID
CAUTION
INCONSISTENT
INVALID
STALE
MISSING
```

工具状态：

```text
DRAFT
REVIEWING
VALIDATED
TEACHING
DEPRECATED
DISABLED
```

设备状态：

```text
STOPPED
STARTING
RUNNING
STOPPING
FAULT
INTERLOCKED
MAINTENANCE
OFFLINE
```

报警等级：

```text
INFO
WARNING
HIGH
HIGH_HIGH
CRITICAL
```

统一枚举和翻译表。

---

# 48. 页面状态模式

每个页面必须设计：

- 初始；
- 加载；
- 成功；
- 空；
- 警告；
- 错误；
- 权限不足；
- 服务不可用；
- 离线；
- 数据过期。

---

# 49. 表单提交模式

```text
输入
→ 前端基础校验
→ 提交
→ 后端校验
→ 计算
→ 返回结果
→ 显示结果
→ 保存/导出
```

提交时：

- 防止重复提交；
- 保留输入；
- 显示加载；
- 错误不清空；
- request_id可追踪。

---

# 50. 页面模式

基础工具：

```text
ToolHeader
ToolInputPanel
ToolResultPanel
ToolExplanationPanel
ToolActionBar
RelatedTools
RelatedKnowledge
```

工具中心：

```text
ToolCenterHeader
ToolSearch
ToolCategoryNav
ToolFilterBar
RecentTools
RecommendedTools
ToolGrid
ToolDemandCTA
```

项目工作台：

```text
ProjectHeader
ProjectNavigation
ProjectSummary
ProjectModules
SaveStatus
VersionHistory
TeamActivity
```

AI工程助手必须显示：

- 当前上下文；
- 数据来源；
- 引用对象；
- 生成状态；
- 免责声明；
- 保存到项目；
- 重新生成；
- 反馈。

---

# 51. 可访问性

所有组件满足：

- 键盘可达；
- 焦点可见；
- Label关联；
- ARIA属性；
- 错误文本；
- 不只依赖颜色；
- 44px触控；
- 200%缩放；
- 高对比；
- 减少动态效果。

组件Story必须包含键盘演示。

---

# 52. 国际化

第一阶段中文为主，但支持：

```text
zh-CN
en-US
```

要求：

- 不在组件内部硬编码中文；
- 使用翻译键；
- 单位符号遵循国际标准；
- 日期和数字按区域格式化；
- 英文长度增加30%后布局不破坏。

---

# 53. 主题系统

主题变量分为：

```text
global tokens
semantic tokens
component tokens
```

示例：

```css
:root {
  --mw-color-brand-primary: #148e9d;
  --mw-button-primary-bg: var(--mw-color-brand-primary);
  --mw-input-border: var(--mw-color-border);
}
```

组件不得大量写死HEX。

---

# 54. Storybook规范

每个组件至少包含：

- Default；
- Variants；
- States；
- DarkTheme；
- Responsive；
- Accessibility；
- EngineeringExample。

示例：

```text
UnitInput / VolumeFlow
ResultMetricCard / DrySolidsRate
ValidityBadge / Inconsistent
PermissionGate / ProfessionalTool
```

---

# 55. 自动测试

组件测试：

- Props；
- 事件；
- disabled；
- loading；
- 键盘；
- ARIA；
- 状态切换；
- 0值；
- null值；
- 单位显示；
- 权限。

端到端流程：

```text
搜索工具
→ 打开干固体量
→ 输入
→ 单位切换
→ 计算
→ 查看步骤
→ 保存项目
→ 导出
```

视觉回归基线：

- 浅色；
- 深色；
- 1366×768；
- 1920×1080；
- 手机；
- 错误；
- 警告；
- 权限；
- Loading；
- Empty。

---

# 56. 性能与安全

性能：

- 基础组件不引入大型依赖；
- 图标按需加载；
- Modal按需加载；
- 图表按需加载；
- 避免无意义重渲染；
- 输入过程不频繁请求；
- 大表格使用虚拟化；
- 骨架不造成布局跳动。

安全：

- 不渲染未经处理的HTML；
- FormulaBlock默认纯文本；
- Markdown安全渲染；
- 上传校验类型和大小；
- PermissionGate不能替代后端权限；
- 敏感信息不写前端日志；
- 错误不显示后端堆栈。

---

# 57. 组件文档模板

每个组件文档必须包括：

```text
组件名称
用途
不适用场景
结构
变体
尺寸
状态
Props
交互
无障碍
响应式
主题
示例
错误用法
测试
版本
```

---

# 58. 版本和治理

版本规则：

```text
0.x：设计和开发阶段
1.0：首个稳定生产版本
```

变更类型：

```text
patch：修复
minor：兼容新增
major：不兼容修改
```

角色：

- 产品负责人；
- UI/UX负责人；
- 前端负责人；
- 专业审核人；
- 测试负责人。

新增组件前判断：

1. 是否已有组件可扩展；
2. 是否为通用模式；
3. 是否属于领域组件；
4. 是否造成重复；
5. 是否经过专业审核。

---

# 59. 第一阶段组件清单

## P0：立即实现

```text
BrandLogo
Button
IconButton
Input
NumberInput
UnitInput
Select
Field
Badge
Alert
Toast
Card
Panel
Tabs
Accordion
Modal
Tooltip
ToolCard
ResultMetricCard
EngineeringValue
ValidityBadge
FormulaBlock
CalculationSteps
EmptyState
LoadingSkeleton
ErrorState
PermissionGate
ProjectPicker
ExportMenu
ThemeToggle
Breadcrumb
PublicHeader
FilterBar
```

## P1：随后实现

```text
Drawer
Popover
Dropdown
Table
Pagination
SaveStatus
ChartFrame
RecentTools
RelatedTools
RelatedKnowledge
```

## P2：高级阶段

```text
DataGrid
ProcessCanvas
EquipmentDetail
PidTrend
AlarmList
InstrumentTable
IoMatrix
WorkflowBuilder
ReportDesigner
```

---

# 60. V0.1实现顺序

```text
设计令牌
→ ThemeProvider
→ Button/Input/Field
→ UnitInput
→ Badge/Alert/Toast
→ Card/Panel
→ Tabs/Accordion/Modal
→ ToolCard
→ ResultMetricCard
→ ValidityBadge
→ FormulaBlock
→ CalculationSteps
→ PermissionGate
→ ProjectPicker
→ Header/FilterBar
→ Storybook
→ 自动测试
```

---

# 61. 验收标准

## 视觉

- 与高保真原型一致；
- 浅色和深色统一；
- Logo使用正确；
- 间距和圆角统一；
- 无浏览器默认样式泄漏。

## 交互

- 键盘可用；
- loading阻止重复提交；
- 错误可修复；
- 0值有效；
- Modal焦点正确；
- 主题切换无布局跳动。

## 工程专业

- 单位正确；
- 数值格式正确；
- 数据有效性明确；
- 警告和错误区分；
- 公式可追溯；
- 工具版本可显示。

## 开发

- TypeScript无隐式any；
- Props清晰；
- 样式令牌化；
- 组件不耦合页面；
- 单元测试通过；
- Storybook完整；
- 视觉回归通过。

---

# 62. 设计红线

1. 不允许页面自行创建相同按钮；
2. 不允许颜色散落硬编码；
3. 不允许0被判定为空；
4. 不允许无单位数值；
5. 不允许会员权限只在前端；
6. 不允许Badge只靠颜色；
7. 不允许错误只显示红框；
8. 不允许Modal缺少焦点管理；
9. 不允许图标混用多套风格；
10. 不允许卡片无限嵌套；
11. 不允许表格压缩几十列；
12. 不允许FormulaBlock直接渲染不安全HTML；
13. 不允许组件直接调用业务API；
14. 不允许每个工具单独写单位转换；
15. 不允许组件内部硬编码工具名称；
16. 不允许使用Emoji替代正式图标；
17. 不允许组件保存敏感数据；
18. 不允许跳过深色和移动端测试；
19. 不允许未经专业审核新增工程状态；
20. 不允许未通过组件验收就批量开发页面。

---

# 63. 本阶段交付物

本规范完成后，继续形成：

```text
01_UI组件展示高保真原型.html
02_工具页面状态设计说明.md
03_设计令牌JSON
04_组件清单JSON
05_Storybook结构草案
06_组件库开发任务清单.md
```

---

# 64. 下一步执行

下一步建议：

> 编写《矿业智工平台工具页面状态设计说明.md》

并同步建立：

> UI基础组件展示高保真原型 V0.1

用于在进入Next.js开发前确认：

```text
组件外观
＋
组件状态
＋
深浅主题
＋
响应式
＋
权限
＋
错误与空状态
```

---

# 65. 结论

MineWorks UI V0.1是矿业智工平台从视觉原型进入正式前端开发的关键边界。

后续所有页面必须建立在同一组件系统之上：

```text
页面不重复造控件
工具不重复造单位系统
专业状态不重复定义
权限不重复判断
结果不重复格式化
```

组件库的长期目标是让矿业智工平台持续增加新工具、新流程和新知识模块，同时保持统一、专业、稳定和可维护。
