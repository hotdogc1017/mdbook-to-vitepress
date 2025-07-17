import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  statSync,
} from "fs";
import { join, dirname, relative, extname, basename } from "path";
import { copy, ensureDir } from "fs-extra";
import * as YAML from "yaml";
import { MdBookParser } from "./parser.js";
import { MdBookSyntaxConverter } from "./converter.js";
import type {
  VitePressConfig,
  MigrationOptions,
  SidebarItem,
} from "./types.js";

export class MdBookToVitePressConverter {
  private options: MigrationOptions;
  private parser: MdBookParser;
  private syntaxConverter: MdBookSyntaxConverter;

  constructor(options: MigrationOptions) {
    this.options = options;
    this.parser = new MdBookParser(options.sourcePath);
    this.syntaxConverter = new MdBookSyntaxConverter();
  }

  async migrate(): Promise<void> {
    if (this.options.onlyConvertFiles) {
      console.log("开始转换 markdown 文件...");
      await this.convertFilesOnly();
      console.log("文件转换完成！");
      return;
    }

    console.log("开始从 mdbook 迁移到 VitePress...");

    // 1. 解析 mdbook 配置
    const mdBookConfig = this.parser.parseConfig();
    if (!mdBookConfig) {
      throw new Error("解析 mdbook 配置失败");
    }

    // 2. 创建目标目录结构
    await this.createTargetStructure();

    // 3. 复制 markdown 文件
    await this.copyMarkdownFiles();

    // 4. 生成 VitePress 配置
    await this.generateVitePressConfig(mdBookConfig);

    // 5. 为 VitePress 创建 package.json
    await this.createVitePressPackageJson();

    console.log("迁移成功完成！");
  }

  private async createTargetStructure(): Promise<void> {
    const docsDir = join(this.options.targetPath, "docs");
    const vitepressDir = join(docsDir, ".vitepress");

    await ensureDir(docsDir);
    await ensureDir(vitepressDir);

    console.log("已创建目标目录结构");
  }
  
  private async createDefaultHomePage(docsDir: string, chapters: any[] = [], title: string = "", description: string = ""): Promise<void> {
    const indexPath = join(docsDir, "index.md");
    
    // 如果没有传入标题和描述，从配置中获取
    if (!title || !description) {
      const mdBookConfig = this.parser.parseConfig();
      title = title || mdBookConfig?.book?.title || "文档";
      description = description || mdBookConfig?.book?.description || "使用 VitePress 构建的文档站点";
    }
    
    // 获取第一个章节的链接
    let firstChapterLink = "/README";
    if (chapters && chapters.length > 0 && chapters[0].link) {
      firstChapterLink = `/${chapters[0].link.replace(".md", "")}`;
    }
    
    // 创建 VitePress 风格的首页
    const homePageContent = `---
layout: home

hero:
  name: "${title}"
  text: "${description}"
  tagline: 欢迎访问文档站点
  actions:
    - theme: brand
      text: 开始阅读
      link: ${firstChapterLink}
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com

features:
  - title: 简单易用
    details: 清晰的文档结构，易于导航和阅读
  - title: 功能丰富
    details: 支持搜索、代码高亮、暗黑模式等功能
  - title: 性能优秀
    details: 基于 VitePress 构建，加载迅速，体验流畅
---
`;

    writeFileSync(indexPath, homePageContent, "utf-8");
    console.log("已创建默认首页");
  }

  private async copyMarkdownFiles(): Promise<void> {
    const sourceDir = join(this.options.sourcePath, "src");
    const docsDir = join(this.options.targetPath, "docs");
    const publicDir = join(this.options.targetPath, "docs", "public");

    if (!existsSync(sourceDir)) {
      console.warn("未找到源目录:", sourceDir);
      return;
    }

    // 确保 public 目录存在
    await ensureDir(publicDir);

    // 分别处理 markdown 文件和静态资源
    await this.copyFilesRecursively(sourceDir, docsDir, publicDir);

    console.log("已复制 markdown 文件和静态资源");
  }

  private async copyFilesRecursively(
    sourceDir: string,
    docsTargetDir: string,
    publicTargetDir: string
  ): Promise<void> {
    const items = readdirSync(sourceDir);

    for (const item of items) {
      const sourcePath = join(sourceDir, item);
      const stat = statSync(sourcePath);

      if (stat.isDirectory()) {
        // 递归处理子目录
        const docsSubDir = join(docsTargetDir, item);
        const publicSubDir = join(publicTargetDir, item);

        await ensureDir(docsSubDir);
        await ensureDir(publicSubDir);

        await this.copyFilesRecursively(sourcePath, docsSubDir, publicSubDir);
      } else {
        const ext = extname(item).toLowerCase();

        if (ext === ".md") {
          // markdown 文件复制到 docs 目录并转换内容
          const targetPath = join(docsTargetDir, item);
          await this.convertMarkdownFile(sourcePath, targetPath);
        } else if (this.isStaticAsset(ext)) {
          // 静态资源复制到 public 目录
          const targetPath = join(publicTargetDir, item);
          copyFileSync(sourcePath, targetPath);
        } else if (this.isDocumentFile(ext)) {
          // 文档文件复制到 docs 目录
          const targetPath = join(docsTargetDir, item);
          copyFileSync(sourcePath, targetPath);
        }
      }
    }
  }

  private isStaticAsset(ext: string): boolean {
    const staticExtensions = [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".webp",
      ".ico",
      ".pdf",
    ];
    return staticExtensions.includes(ext);
  }

  private isDocumentFile(ext: string): boolean {
    const docExtensions = [".txt", ".json", ".yaml", ".yml", ".toml"];
    return docExtensions.includes(ext);
  }

  private async generateVitePressConfig(mdBookConfig: any): Promise<void> {
    const chapters = this.parser.parseSummary();
    const sidebar = this.generateSidebar(chapters);

    // 从 book.toml 中获取标题和描述
    const title = mdBookConfig.book?.title || "文档";
    const description = mdBookConfig.book?.description || "文档站点";
    const language = mdBookConfig.book?.language || "zh-CN";

    // 获取基本配置
    const vitePressConfig: VitePressConfig = {
      title: title,
      description: description,
      lang: language,
      themeConfig: {
        sidebar,
      },
    };
    
    // 添加 MathJax 配置
    const mathJaxConfig = this.syntaxConverter.getVitePressConfig();
    Object.assign(vitePressConfig, mathJaxConfig);

    if (this.options.generateNav) {
      vitePressConfig.themeConfig.nav = this.generateNav(chapters);
    }

    const configPath = join(
      this.options.targetPath,
      "docs",
      ".vitepress",
      "config.ts"
    );
    const configContent = this.generateConfigFile(vitePressConfig);

    writeFileSync(configPath, configContent, "utf-8");
    
    // 创建默认首页
    const docsDir = join(this.options.targetPath, "docs");
    await this.createDefaultHomePage(docsDir, chapters, title, description);
    
    console.log("已生成 VitePress 配置");
  }

  private generateSidebar(chapters: any[]): SidebarItem[] {
    const sidebar: SidebarItem[] = [];

    // 递归处理章节结构
    const processChapters = (items: any[]): SidebarItem[] => {
      return items.map(item => {
        const result: SidebarItem = {
          text: item.title,
          link: `/${item.link.replace(".md", "")}`
        };
        
        // 如果有子项，递归处理
        if (item.items && item.items.length > 0) {
          result.items = processChapters(item.items);
          result.collapsed = false; // 默认展开
        }
        
        return result;
      });
    };

    return processChapters(chapters);
  }

  private generateNav(chapters: any[]): any[] {
    // 获取第一个章节的链接
    let firstChapterLink = "guide";
    if (chapters.length > 0 && chapters[0].link) {
      firstChapterLink = chapters[0].link.replace(".md", "");
    }
    
    return [
      { text: "首页", link: "/" },
      { text: "指南", link: `/${firstChapterLink}` },
    ];
  }

  private extractTitleFromFile(filePath: string): string {
    const fullPath = join(this.options.sourcePath, "src", filePath);

    if (!existsSync(fullPath)) {
      return filePath.replace(".md", "").replace(/[-_]/g, " ");
    }

    try {
      const content = readFileSync(fullPath, "utf-8");
      const titleMatch = content.match(/^#\s+(.+)$/m);

      if (titleMatch) {
        return titleMatch[1].trim();
      }
    } catch (error) {
      console.warn(`无法读取文件 ${fullPath}:`, error);
    }

    return filePath.replace(".md", "").replace(/[-_]/g, " ");
  }

  private generateConfigFile(config: VitePressConfig): string {
    // 将配置对象转换为格式化的 TypeScript 代码
    const configString = this.formatConfigObject(config, 0);
    return `import { defineConfig } from 'vitepress'

export default defineConfig(${configString})
`;
  }

  private formatConfigObject(obj: any, indent: number): string {
    const spaces = "  ".repeat(indent);
    const nextSpaces = "  ".repeat(indent + 1);

    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      const items = obj.map(
        (item) => `${nextSpaces}${this.formatConfigObject(item, indent + 1)}`
      );
      return `[\n${items.join(",\n")}\n${spaces}]`;
    }

    if (obj && typeof obj === "object") {
      const entries = Object.entries(obj);
      if (entries.length === 0) return "{}";

      const props = entries.map(([key, value]) => {
        const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
          ? key
          : `'${key}'`;
        return `${nextSpaces}${formattedKey}: ${this.formatConfigObject(
          value,
          indent + 1
        )}`;
      });

      return `{\n${props.join(",\n")}\n${spaces}}`;
    }

    if (typeof obj === "string") {
      return `'${obj.replace(/'/g, "\\'")}'`;
    }

    return JSON.stringify(obj);
  }

  private async createVitePressPackageJson(): Promise<void> {
    // 获取基本的 package.json 配置
    const packageJson = {
      name: "vitepress-docs",
      version: "1.0.0",
      description: "Documentation site built with VitePress",
      type: "module",
      scripts: {
        "docs:dev": "vitepress dev docs",
        "docs:build": "vitepress build docs",
        "docs:preview": "vitepress preview docs",
      },
      devDependencies: {
        vitepress: "^1.0.0",
      },
    };
    
    // 添加转换器需要的依赖
    const additionalDependencies = this.syntaxConverter.getPackageDependencies();
    Object.assign(packageJson.devDependencies, additionalDependencies);

    const packagePath = join(this.options.targetPath, "package.json");
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), "utf-8");

    console.log("已创建 VitePress package.json");
  }

  private async convertFilesOnly(): Promise<void> {
    const sourceDir = join(this.options.sourcePath, "src");

    if (!existsSync(sourceDir)) {
      console.warn("未找到源目录:", sourceDir);
      return;
    }

    // 确保目标目录存在
    await ensureDir(this.options.targetPath);

    // 递归处理所有 markdown 文件
    await this.processDirectory(sourceDir, this.options.targetPath);

    console.log("已完成文件转换和移动");
  }

  private async processDirectory(
    sourceDir: string,
    targetDir: string
  ): Promise<void> {
    const items = readdirSync(sourceDir);

    for (const item of items) {
      const sourcePath = join(sourceDir, item);
      const targetPath = join(targetDir, item);
      const stat = statSync(sourcePath);

      if (stat.isDirectory()) {
        // 递归处理子目录
        await ensureDir(targetPath);
        await this.processDirectory(sourcePath, targetPath);
      } else if (extname(item) === ".md") {
        console.log("start to handle markdown!!!!!")
        // 处理 markdown 文件
        await this.convertMarkdownFile(sourcePath, targetPath);
      } else {
        // 复制其他资源文件（图片、文档等）
        const ext = extname(item).toLowerCase();

        if (this.isStaticAsset(ext) || this.isDocumentFile(ext)) {
          copyFileSync(sourcePath, targetPath);
          console.log(`已复制资源文件: ${basename(sourcePath)}`);
        }
      }
    }
  }

  private async convertMarkdownFile(
    sourcePath: string,
    targetPath: string
  ): Promise<void> {
    try {
      // 读取源文件内容
      let content = readFileSync(sourcePath, "utf-8");
      
      // 打印调试信息
      console.log(`转换文件: ${basename(sourcePath)}`);
      console.log(`文件大小: ${content.length} 字节`);
      
      // 使用语法转换器转换 mdbook 特有的语法到 VitePress 兼容格式
      // 传入源文件路径，用于解析相对路径
      content = this.syntaxConverter.convert(content, sourcePath);
      
      // 写入转换后的文件
      writeFileSync(targetPath, content, "utf-8");
      
      console.log(`已转换: ${basename(sourcePath)}`);
    } catch (error) {
      console.error(`转换文件失败 ${sourcePath}:`, error);
    }
  }
}
