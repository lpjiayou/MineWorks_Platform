# 工具中心 Typed Routes 热修复说明 V0.5.1

> 项目：矿业智工平台  
> 工程：mineworks-web  
> 修复版本：V0.5.1  
> 修复日期：2026-07-14

## 一、错误现象

执行工具中心验证时，TypeScript报告：

```text
Type '"/tools"' is not assignable to type 'UrlObject | RouteImpl<"/tools">'
```

涉及文件：

```text
src/app/page.tsx
src/app/tools/[slug]/page.tsx
src/components/layout/public-header/public-header.tsx
```

## 二、根因

工程启用了：

```ts
typedRoutes: true
```

V0.5新增了：

```text
/tools
/tools/[slug]
```

但是本机 `.next/types` 仍是上一版本生成的旧路由类型。

原脚本直接执行：

```text
tsc --noEmit
```

导致TypeScript使用旧的路由联合类型，错误地认为 `/tools` 不存在。

这不是页面路由代码错误，也不需要把 `href="/tools"` 强制断言成任意类型。

## 三、永久修复

`package.json` 已修改为：

```json
{
  "scripts": {
    "typegen": "next typegen",
    "typecheck": "next typegen && tsc --noEmit"
  }
}
```

以后新增页面、动态路由或路由组后，执行：

```text
npm run typecheck
```

会先重新生成路由类型，再进行TypeScript检查。

## 四、一次性修复步骤

关闭正在运行的Next.js和Storybook窗口，然后双击：

```text
09_FIX_TYPED_ROUTES_AND_VERIFY.cmd
```

脚本执行：

```text
删除旧 .next
生成最新路由类型
TypeScript检查
ESLint
Vitest
Next.js生产构建
Storybook生产构建
```

成功标志：

```text
TYPED_ROUTES_FIX_VERIFY_OK
```

## 五、验证结果

V0.5.1修复已完成以下验证：

```text
next typegen：通过
TypeScript：通过
ESLint：通过
Vitest：28个测试文件、49项测试通过
Next.js生产构建：通过
Storybook生产构建：通过
```

Next.js路由：

```text
/
/_not-found
/design-system
/tools
/tools/[slug]
```

## 六、禁止的临时修复

不要采用：

```ts
href={"/tools" as any}
```

也不要关闭：

```ts
typedRoutes: true
```

这些做法只是绕过类型安全，不能解决路由类型未生成的问题。
