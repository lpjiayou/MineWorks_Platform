# 矿业智工平台网页首页 Logo 接入设计规范

> 项目名称：矿业智工平台  
> 文档版本：V1.1  
> 编制日期：2026-07-13  
> 对应首页原型：V0.4  
> 当前Logo状态：已确认栅格基准，矢量重绘待完成

---

## 1. 设计目标

本任务将已确认的矿业智工平台Logo接入当前首页设计框架，并建立正式前端接入规则。

目标：

1. 首页使用真实品牌Logo，不再使用临时CSS图形；
2. 浅色主题与深色主题自动切换Logo版本；
3. 桌面端、平板端和手机端显示正确；
4. Logo清晰、不变形、不裁切；
5. 导航栏高度保持克制；
6. Logo与菜单、搜索和工作台按钮形成稳定布局；
7. 后续SVG矢量母版完成后可以无缝替换；
8. 页面性能和可访问性不受影响。

---

## 2. 当前接入资源

当前开发阶段使用：

```text
logo-header-light.png
logo-header-dark.png
logo-symbol.png
favicon.ico
```

用途：

| 文件 | 用途 |
|---|---|
| `logo-header-light.png` | 浅色顶部导航、登录页、浅色页脚 |
| `logo-header-dark.png` | 深色顶部导航、动态工艺工作台、深色页脚 |
| `logo-symbol.png` | 手机端、折叠侧栏、加载页、品牌水印 |
| `favicon.ico` | 浏览器标签和测试环境 |

矢量重绘完成后替换为：

```text
logo-horizontal-light.svg
logo-horizontal-dark.svg
logo-symbol-compact.svg
favicon.svg
```

组件接口和布局不变。

---

## 3. 首页顶部导航接入

### 3.1 桌面端

使用横向组合标志。

建议：

- 导航栏高度：72px；
- Logo实际显示高度：44～48px；
- 最大显示宽度：300px；
- 左侧页面边距：24px以上；
- Logo与导航菜单间距：28～36px；
- 不显示额外重复的平台名称文字；
- 不把Logo放进有色按钮或厚重卡片。

### 3.2 1366×768

建议：

- Logo显示宽度：230～250px；
- 低优先级导航项目隐藏；
- 保留工具中心、动态工艺、资料库和企业服务；
- Logo不能因导航拥挤被压缩变形。

### 3.3 1920×1080

建议：

- Logo显示宽度：250～285px；
- 保持完整横向组合；
- 不盲目放大；
- 页面容器最大宽度与首页内容一致。

### 3.4 平板

- 横向时可显示完整横向Logo；
- 宽度不足时切换图形标志；
- 菜单收进抽屉；
- Logo点击返回首页。

### 3.5 手机

使用：

```text
logo-symbol.png
```

建议显示：

- 40～44px；
- 不在导航内同时显示完整中文长名称；
- 平台名称可放入菜单抽屉顶部；
- 保持触控面积不低于44px。

---

## 4. 深浅主题切换

### 4.1 浅色主题

使用：

```text
logo-header-light.png
```

适用背景：

- 白色；
- 浅灰蓝；
- 浅色玻璃导航。

### 4.2 深色主题

使用：

```text
logo-header-dark.png
```

适用背景：

- 深蓝；
- 深灰；
- 动态工艺工作台；
- PID与高级分析页面。

### 4.3 切换规则

主题变化时：

- Logo立即切换；
- 不出现闪烁；
- 不改变Logo占位尺寸；
- 不导致导航布局跳动；
- 图片预加载；
- 保留相同`width`与`height`属性。

---

## 5. 首页首屏接入

顶部导航是Logo主要出现位置。

首屏主视觉中不重复放完整主标志，避免品牌堆叠。

允许在首屏工程工作台视觉中使用：

- 图形标志作为淡水印；
- 透明度3%～6%；
- 不影响数据和流程可读性。

禁止：

- 在标题旁重复放大Logo；
- 在首屏背景中使用高透明大Logo；
- 使用旋转或动态Logo作为装饰；
- 让Logo动画抢过工具搜索入口。

---

## 6. 页脚接入

浅色页脚：

- 使用横向全彩Logo；
- 建议宽度220～260px。

深色页脚：

- 使用白色横向Logo；
- 建议宽度220～260px。

页脚可保留：

- 中文品牌；
- 英文名称；
- 一句话定位。

不要再次重复大型图形。

---

## 7. 登录与注册页接入

登录页建议：

- 使用主标志或横向组合；
- 显示宽度260～340px；
- 放在左上或表单上方；
- 保持足够留白；
- 背景使用浅色工程主题。

手机登录页：

- 使用图形标志；
- 下方使用文本显示“矿业智工平台”；
- 不加载过大的完整主标志。

---

## 8. 动态工艺与专业工作台接入

深色工作台顶部：

- 使用白色横向Logo；
- 显示高度38～44px；
- 侧栏折叠时使用图形简化版；
- 不使用全彩深色文字Logo。

工程画布内：

- 默认不显示Logo；
- 导出PNG或报告截图时，可在右下角添加低透明水印；
- 水印透明度5%～8%；
- 不覆盖设备和数据。

---

## 9. Logo组件设计

建议建立统一组件：

```tsx
<BrandLogo
  variant="horizontal"
  theme="auto"
  size="md"
  priority
  href="/"
/>
```

接口：

```ts
type BrandLogoVariant =
  | "horizontal"
  | "primary"
  | "symbol";

type BrandLogoTheme =
  | "light"
  | "dark"
  | "auto";

type BrandLogoSize =
  | "sm"
  | "md"
  | "lg";
```

禁止页面直接散落图片路径。

---

## 10. Next.js组件草案

```tsx
import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "horizontal" | "symbol";
  theme?: "light" | "dark" | "auto";
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  href?: string;
  className?: string;
};

const sizes = {
  sm: { width: 210, height: 70 },
  md: { width: 260, height: 86 },
  lg: { width: 320, height: 106 },
};

export function BrandLogo({
  variant = "horizontal",
  theme = "auto",
  size = "md",
  priority = false,
  href = "/",
  className,
}: BrandLogoProps) {
  const dimension = sizes[size];

  if (variant === "symbol") {
    return (
      <Link href={href} aria-label="矿业智工平台首页" className={className}>
        <Image
          src="/brand/logo-symbol.png"
          alt=""
          width={48}
          height={48}
          priority={priority}
        />
      </Link>
    );
  }

  return (
    <Link href={href} aria-label="矿业智工平台首页" className={className}>
      <picture>
        {theme === "auto" && (
          <source
            media="(prefers-color-scheme: dark)"
            srcSet="/brand/logo-header-dark.png"
          />
        )}
        <Image
          src={
            theme === "dark"
              ? "/brand/logo-header-dark.png"
              : "/brand/logo-header-light.png"
          }
          alt="矿业智工平台 MineWorks Platform"
          width={dimension.width}
          height={dimension.height}
          priority={priority}
        />
      </picture>
    </Link>
  );
}
```

正式项目若使用应用内主题切换，不应只依赖`prefers-color-scheme`，应读取平台主题状态。

---

## 11. CSS设计草案

```css
.brandLogo {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  line-height: 0;
}

.brandLogo img {
  display: block;
  width: auto;
  height: 46px;
  object-fit: contain;
}

@media (max-width: 1366px) {
  .brandLogo img {
    height: 42px;
  }
}

@media (max-width: 820px) {
  .brandLogoHorizontal {
    display: none;
  }

  .brandLogoSymbol {
    display: inline-flex;
  }
}

@media (min-width: 821px) {
  .brandLogoSymbol {
    display: none;
  }
}
```

---

## 12. 图片性能要求

### 当前PNG阶段

- 横向Logo控制在100KB以内为目标；
- 使用透明PNG；
- 不使用原始大尺寸参考图；
- 设置明确宽高；
- 首页导航Logo使用`priority`；
- 深色版本预加载；
- 避免CSS缩放超出原始像素。

### SVG完成后

- 优先使用SVG；
- 压缩无用元数据；
- 不嵌入位图；
- 不嵌入字体；
- 保留`viewBox`；
- 小于20KB为优化目标，但不能以破坏路径为代价。

---

## 13. 可访问性

- Logo链接必须有`aria-label="矿业智工平台首页"`；
- 完整Logo图片可使用品牌名称作为`alt`；
- 图形Logo若旁边已有文字，`alt=""`避免重复朗读；
- 键盘焦点清晰；
- 点击区域不低于44px；
- 主题切换后对比度保持合格。

---

## 14. SEO与结构化品牌信息

网站元数据建议：

```ts
export const metadata = {
  title: "矿业智工平台｜专业矿业工程在线工具与知识工作台",
  description:
    "面向选矿、采矿、矿山自动化和工程设计人员的在线工具、动态工艺、高级分析与项目工作台。",
  icons: {
    icon: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
};
```

后续可增加Organization结构化数据，并使用正式Logo URL。

---

## 15. 需要避免的问题

1. 不使用原始棋盘格参考图；
2. 不用CSS把Logo压扁；
3. 不重复显示Logo与相同文字；
4. 不在导航中使用过高Logo导致页面头部臃肿；
5. 不把完整版Logo用于16px favicon；
6. 不在深色背景使用深色标准字；
7. 不给Logo增加额外阴影和发光；
8. 不让深浅主题切换造成布局跳动；
9. 不在每个页面硬编码路径；
10. 不在矢量版未确认前删除栅格V1.0资源。

---

## 16. 首页V0.4接入说明

随本规范提供：

```text
矿业智工平台首页Logo接入原型_V0.4.html
```

V0.4相对V0.3的变化：

- 顶部导航使用真实横向Logo；
- 手机端使用真实图形标志；
- 页脚使用真实Logo；
- 深浅主题自动切换Logo；
- favicon接入当前临时图标；
- 移除原来的CSS临时Logo图形；
- 保持首页整体信息架构不变。

---

## 17. 验收清单

### 桌面端

- 1366×768显示完整；
- 1920×1080显示完整；
- Logo不变形；
- Logo不影响导航；
- 点击返回首页；
- 浅色主题使用全彩；
- 深色主题使用白色。

### 平板与手机

- 手机切换图形标志；
- 菜单按钮仍可用；
- 点击区域足够；
- 无水平滚动；
- Logo不裁切。

### 性能

- 首屏Logo及时显示；
- 无布局跳动；
- 深色Logo已预加载；
- 资源路径无404；
- favicon正常。

### 可访问性

- 键盘可聚焦；
- aria-label正确；
- alt不重复；
- 深浅主题对比度合格。

---

## 18. 文件目录建议

正式项目：

```text
apps/web/public/brand/
├─ logo-header-light.svg
├─ logo-header-dark.svg
├─ logo-symbol.svg
├─ favicon.svg
├─ favicon.ico
├─ apple-touch-icon.png
├─ pwa-192.png
└─ pwa-512.png

apps/web/components/brand/
├─ BrandLogo.tsx
├─ BrandLogo.module.css
└─ index.ts
```

---

## 19. 上线前停止线

以下事项未完成，不进入正式品牌上线：

1. 矢量重绘未验收；
2. SVG未测试；
3. favicon未做像素级优化；
4. 中文名称存在错误；
5. 深色版本不清晰；
6. 1366×768导航拥挤；
7. Logo路径存在404；
8. Logo组件未统一；
9. 商标近似检索未开始；
10. 项目负责人未确认最终显示效果。

---

## 20. 下一步

本轮完成后，执行顺序：

```text
确认首页V0.4接入效果
→ 启动Logo矢量重绘
→ 建立BrandLogo React组件
→ 完成工具中心高保真
→ 完成工具详情页高保真
→ 建立设计系统V0.1
```
