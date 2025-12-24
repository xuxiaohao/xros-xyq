# XROS-XYQ Monorepo

这是一个基于 pnpm workspace 的 monorepo 项目。

## 项目结构

```
xros-xyq/
├── packages/
│   ├── web/      # Web 前端应用
│   ├── serve/    # 后端服务应用
│   └── share/    # 共享工具库
├── pnpm-workspace.yaml
└── package.json
```

## 安装依赖

```bash
pnpm install
```

## 开发

运行所有子项目的开发脚本：

```bash
pnpm dev
```

运行特定子项目的开发脚本：

```bash
pnpm --filter @xros-xyq/web dev
pnpm --filter @xros-xyq/serve dev
pnpm --filter @xros-xyq/share dev
```

## 构建

构建所有子项目：

```bash
pnpm build
```

构建特定子项目：

```bash
pnpm --filter @xros-xyq/web build
pnpm --filter @xros-xyq/serve build
pnpm --filter @xros-xyq/share build
```

## 测试

运行所有测试：

```bash
pnpm test
```

## 代码检查

运行所有 lint：

```bash
pnpm lint
```

## 清理

清理所有构建产物：

```bash
pnpm clean
```

## 子项目说明

### @xros-xyq/web
Web 前端应用

### @xros-xyq/serve
后端服务应用

### @xros-xyq/share
共享工具库，供其他子项目使用

