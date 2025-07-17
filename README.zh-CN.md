# mdbook-to-vitepress

将 mdbook 项目迁移到 VitePress 的工具。

[English](README.md) | 简体中文

## 安装

```bash
npm install -g mdbook-to-vitepress
```

## 使用方法

### 迁移现有的 mdbook 项目

```bash
# 完整迁移（包含 VitePress 配置和结构）
# 从当前目录迁移
mdbook-to-vitepress migrate /path/to/vitepress/project

# 从指定目录迁移
mdbook-to-vitepress migrate /path/to/vitepress/project /path/to/mdbook/project

# 仅转换 markdown 文件（从当前目录）
mdbook-to-vitepress migrate /path/to/output/directory --files-only

# 仅转换 markdown 文件（从指定目录）
mdbook-to-vitepress migrate /path/to/output/directory /path/to/mdbook/project --files-only
```

### 选项

- `-p, --preserve-structure`: 保持原始目录结构
- `-n, --generate-nav`: 生成导航菜单 (默认: true)
- `-f, --files-only`: 仅转换文件，不生成 VitePress 结构

## 功能特性

- 将 mdbook 的 `book.toml` 配置转换为 VitePress 配置
- 从 mdbook 的 `src/` 目录迁移 markdown 文件
- 从 `SUMMARY.md` 生成 VitePress 侧边栏
- 为 VitePress 项目创建合适的 `package.json`
- 支持基本的 TOML 解析用于 mdbook 配置
- **仅文件转换模式**：支持仅转换 markdown 文件而不生成完整的 VitePress 项目结构
- **静态资源处理**：按照 VitePress 规范处理静态资源，图片等文件复制到 `public` 目录
- **图片引用转换**：自动转换 markdown 和 HTML 中的图片引用路径
- **正确的配置生成**：生成格式正确的 VitePress 配置文件
- **mdBook 扩展语法支持**：
  - 隐藏代码行 (`# 注释` → `// 注释`)
  - 包含文件 (`{{#include file.rs}}` → `<<< file.rs`)
  - Rust 文档注释包含 (`{{#rustdoc_include file.rs}}` → `<<< file.rs`)
  - MathJax 数学公式支持 (自动配置 VitePress)
  - HTML 属性处理 (保留标题 ID，添加其他属性的注释)

### 文件转换功能

当使用 `--files-only` 参数时，工具会：

- 转换 mdbook 特有的链接语法到标准 markdown 格式
- 将 HTML `<img>` 标签转换为 Markdown 格式，并修正图片路径
- 将 mdbook 的 `{{#include}}` 语法转换为 VitePress 的代码片段导入语法
- 转换 mdbook 的警告框语法到 VitePress 自定义容器格式
- 将引用块转换为 VitePress 提示框
- 按照 VitePress 规范处理静态资源：图片复制到 `public` 目录
- 保持目录结构并递归处理所有文件
- **不会**创建 VitePress 配置文件和项目结构

这个功能特别适合将 mdbook 项目作为现有 VitePress 项目的一个模块进行集成，只需要转换文件内容而不需要创建新的 VitePress 配置。

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式运行
npm run dev

# 测试 CLI
npm run start migrate ./example-mdbook ./example-vitepress
```

## 项目结构

```
src/
├── cli.ts          # 命令行接口
├── index.ts        # 主入口文件
├── migrator.ts     # 迁移逻辑
├── parser.ts       # mdbook 配置解析器
├── converter.ts    # mdbook 语法转换器（主类）
├── toml-parser.ts  # TOML 解析器
├── types.ts        # 类型定义
└── transformers/   # 模块化的 Markdown 转换器
    ├── index.ts                # 转换器注册表和导出
    ├── types.ts                # 转换器类型定义
    ├── hidden-code-lines.ts    # 隐藏代码行转换器
    ├── html-attributes.ts      # HTML 属性转换器
    ├── image-references.ts     # 图片引用转换器
    ├── include-files.ts        # 包含文件转换器
    ├── mathjax.ts              # MathJax 支持
    ├── quote-blocks.ts         # 引用块转换器
    └── rust-playground.ts      # Rust Playground 集成
```

## 许可证

MIT