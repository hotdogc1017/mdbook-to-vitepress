#!/usr/bin/env node
import { Command } from "commander";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { copyFileSync, existsSync as existsSync$1, readFileSync as readFileSync$1, readdirSync, statSync, writeFileSync } from "fs";
import { basename, extname, join as join$1 } from "path";
import { ensureDir } from "fs-extra";

//#region src/toml-parser.ts
function parse(tomlContent) {
	const result = {};
	const lines = tomlContent.split("\n");
	let currentSection = result;
	for (let line of lines) {
		line = line.trim();
		if (!line || line.startsWith("#")) continue;
		const sectionMatch = line.match(/^\[([^\]]+)\]$/);
		if (sectionMatch) {
			const sectionPath = sectionMatch[1].split(".");
			currentSection = result;
			for (const part of sectionPath) {
				if (!currentSection[part]) currentSection[part] = {};
				currentSection = currentSection[part];
			}
			continue;
		}
		const kvMatch = line.match(/^([^=]+)=(.+)$/);
		if (kvMatch) {
			const key = kvMatch[1].trim();
			let value = kvMatch[2].trim();
			if (value.startsWith("\"") && value.endsWith("\"") || value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
			if (value.startsWith("[") && value.endsWith("]")) {
				const arrayContent = value.slice(1, -1);
				if (arrayContent.trim()) value = arrayContent.split(",").map((item) => {
					item = item.trim();
					if (item.startsWith("\"") && item.endsWith("\"") || item.startsWith("'") && item.endsWith("'")) return item.slice(1, -1);
					return item;
				});
				else value = [];
			}
			if (value === "true") value = true;
			if (value === "false") value = false;
			currentSection[key] = value;
		}
	}
	return result;
}

//#endregion
//#region src/parser.ts
var MdBookParser = class {
	sourcePath;
	constructor(sourcePath) {
		this.sourcePath = sourcePath;
	}
	parseConfig() {
		const configPath = join$1(this.sourcePath, "book.toml");
		if (!existsSync$1(configPath)) {
			console.warn("未找到 book.toml，使用默认配置");
			return this.getDefaultConfig();
		}
		try {
			const configContent = readFileSync$1(configPath, "utf-8");
			return parse(configContent);
		} catch (error) {
			console.error("解析 book.toml 时出错:", error);
			return this.getDefaultConfig();
		}
	}
	parseSummary() {
		const summaryPath = join$1(this.sourcePath, "src", "SUMMARY.md");
		if (!existsSync$1(summaryPath)) {
			console.warn("未找到 SUMMARY.md");
			return [];
		}
		try {
			const summaryContent = readFileSync$1(summaryPath, "utf-8");
			return this.extractChaptersWithStructure(summaryContent);
		} catch (error) {
			console.error("解析 SUMMARY.md 时出错:", error);
			return [];
		}
	}
	getDefaultConfig() {
		return { book: {
			title: "文档",
			src: "src"
		} };
	}
	extractChaptersWithStructure(summaryContent) {
		const chapters = [];
		const lines = summaryContent.split("\n");
		const stack = [{
			items: chapters,
			level: 0
		}];
		for (const line of lines) {
			if (!line.trim()) continue;
			const indentMatch = line.match(/^(\s*)/);
			const indent = indentMatch ? indentMatch[1].length : 0;
			const level = Math.floor(indent / 2) + 1;
			const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
			if (match) {
				const title = match[1];
				const link = match[2];
				const chapter = {
					title,
					link,
					level,
					items: []
				};
				while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
				stack[stack.length - 1].items.push(chapter);
				stack.push({
					items: chapter.items,
					level
				});
			}
		}
		return chapters;
	}
};

//#endregion
//#region src/transformers/hidden-code-lines.ts
/**
* 隐藏代码行转换器
* 将 mdBook 的隐藏代码行语法转换为 VitePress 兼容的格式
* 
* mdBook: # 这是隐藏的代码行
* VitePress: // 这是隐藏的代码行
*/
var HiddenCodeLinesTransformer = class {
	name = "hiddenCodeLines";
	description = "将 mdBook 的隐藏代码行语法转换为注释";
	transform(content) {
		const lines = content.split("\n");
		let inCodeBlock = false;
		const transformedLines = lines.map((line) => {
			if (line.trim().startsWith("```")) {
				inCodeBlock = !inCodeBlock;
				return line;
			}
			if (inCodeBlock) {
				if (line.trim().startsWith("#") && !line.trim().startsWith("#!")) return "// " + line.trim().substring(1);
			}
			return line;
		});
		return transformedLines.join("\n");
	}
	transformLine(line) {
		if (line.trim().startsWith("#") && !line.trim().startsWith("#!")) return "// " + line.trim().substring(1);
		return line;
	}
};

//#endregion
//#region src/transformers/html-attributes.ts
/**
* HTML 属性转换器
* 将 mdBook 特有的 HTML 属性语法转换为 VitePress 兼容的格式
* 
* mdBook: {#id .class1 .class2 key=val}
* VitePress: 保留 {#id} 语法，其他属性添加注释
*/
var HtmlAttributesTransformer = class {
	name = "htmlAttributes";
	description = "将 mdBook 的 HTML 属性语法转换为 VitePress 兼容的格式";
	transform(content) {
		content = content.replace(/^(#+)\s+(.*?)\s+\{#([^}]+)\}/gm, (_, hashes, title, id) => {
			return `${hashes} ${title} {#${id}}`;
		});
		content = content.replace(/\{([^{}]+)\}/g, (match, attributes) => {
			if (/^#[a-zA-Z0-9_-]+$/.test(attributes.trim())) return match;
			const classMatch = attributes.match(/\.[a-zA-Z0-9_-]+/g);
			const classes = classMatch ? classMatch.map((c) => c.substring(1)).join(" ") : "";
			const otherAttrs = attributes.replace(/\.[a-zA-Z0-9_-]+/g, "").trim();
			return `<!-- mdBook 属性: ${match} -->
<!-- VitePress 不完全支持此语法，请考虑使用 HTML 标签: -->
<!-- 例如: <div class="${classes}" ${otherAttrs}> 内容 </div> -->`;
		});
		return content;
	}
};

//#endregion
//#region src/transformers/image-references.ts
/**
* 图片引用转换器
* 将 mdBook 的图片引用语法转换为 VitePress 兼容的格式
* 
* HTML 图片: <img src="./image.png" alt="描述"> -> ![描述](/image.png)
* Markdown 图片: ![描述](./image.png) -> ![描述](/image.png)
*/
var ImageReferencesTransformer = class {
	name = "imageReferences";
	description = "将 mdBook 的图片引用语法转换为 VitePress 兼容的格式";
	transform(content) {
		content = this.convertImgTagsToMarkdown(content);
		content = content.replace(/!\[([^\]]*)\]\(\.\/([^)]+)\)/g, "![$1](/$2)");
		content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
			if (src.startsWith("http") || src.startsWith("/") || src.startsWith("#")) return match;
			return `![${alt}](/${src})`;
		});
		return content;
	}
	/**
	* 将 HTML img 标签转换为 Markdown 格式
	*/
	convertImgTagsToMarkdown(content) {
		return content.replace(/<img([^>]*?)>/g, (match, attributes) => {
			const srcMatch = attributes.match(/\s+src=["']([^"']+)["']/);
			if (!srcMatch) return match;
			let src = srcMatch[1];
			const altMatch = attributes.match(/\s+alt=["']([^"']*?)["']/);
			const alt = altMatch ? altMatch[1] : "";
			if (src.startsWith("./")) src = `/${src.substring(2)}`;
			else if (!src.startsWith("/") && !src.startsWith("http")) src = `/${src}`;
			return `![${alt}](${src})`;
		});
	}
};

//#endregion
//#region src/transformers/include-files.ts
/**
* 包含文件转换器
* 将 mdBook 的包含文件语法转换为 VitePress 兼容的格式
*
* mdBook: {{#include file.rs}} 或 {{#include file.rs:10:20}}
* VitePress: <<< file.rs 或 <<< file.rs{10-20}
*/
var IncludeFilesTransformer = class {
	name = "includeFiles";
	description = "将 mdBook 的包含文件语法转换为 VitePress 的代码片段导入语法";
	transform(content) {
		content = content.replace(/\{\{#include\s+([^}]+)\}\}/g, (_, filePath) => {
			return this.convertIncludeSyntax(filePath);
		});
		content = content.replace(/\{\{#rustdoc_include\s+([^}]+)\}\}/g, (_, filePath) => {
			return this.convertIncludeSyntax(filePath);
		});
		return content;
	}
	transformLine(line) {
		line = line.replace(/\{\{#include\s+([^}]+)\}\}/g, (_, filePath) => {
			return this.convertIncludeSyntax(filePath);
		});
		line = line.replace(/\{\{#rustdoc_include\s+([^}]+)\}\}/g, (_, filePath) => {
			return this.convertIncludeSyntax(filePath);
		});
		return line;
	}
	convertIncludeSyntax(filePath) {
		if (filePath.includes("::")) {
			const [path, endLine] = filePath.split("::");
			let vitePressPath$1;
			if (path.startsWith("./")) vitePressPath$1 = path.substring(2);
			else vitePressPath$1 = path;
			return `<<< ${vitePressPath$1}{1-${endLine}}`;
		}
		const parts = filePath.split(":");
		const cleanPath = parts[0];
		let vitePressPath;
		if (cleanPath.startsWith("./")) vitePressPath = cleanPath.substring(2);
		else vitePressPath = cleanPath;
		if (parts.length === 3) {
			const startLine = parts[1];
			const endLine = parts[2];
			return `<<< ${vitePressPath}{${startLine}-${endLine}}`;
		} else if (parts.length === 2) {
			const startLine = parts[1];
			return `<<< ${vitePressPath}{${startLine}-}`;
		} else return `<<< ${vitePressPath}`;
	}
};

//#endregion
//#region src/transformers/mathjax.ts
/**
* MathJax 转换器
* 处理 mdBook 中的数学公式语法
* 
* mdBook 和 VitePress 都使用 $ 和 $$ 分隔符，所以不需要转换
* 但需要确保 VitePress 配置中启用了 mathjax
*/
var MathJaxTransformer = class {
	name = "mathjax";
	description = "处理 MathJax 数学公式语法";
	transform(content) {
		return content;
	}
	/**
	* 获取 VitePress 配置中需要添加的 MathJax 配置
	*/
	getVitePressConfig() {
		return { markdown: { math: true } };
	}
	/**
	* 获取需要添加到 package.json 的依赖
	*/
	getPackageDependencies() {
		return { "markdown-it-mathjax3": "^4.3.2" };
	}
};

//#endregion
//#region src/transformers/quote-blocks.ts
/**
* 引用块转换器
* 将 mdBook 的引用块语法转换为 VitePress 的容器语法
* 
* mdBook: > 内容
* VitePress: ::: info\n内容\n:::
* 
* mdBook: > **注意:** 内容
* VitePress: ::: tip 注意\n内容\n:::
*/
var QuoteBlocksTransformer = class {
	name = "quoteBlocks";
	description = "将 mdBook 的引用块语法转换为 VitePress 的容器语法";
	transform(content) {
		const lines = content.split("\n");
		const convertedLines = [];
		let inQuoteBlock = false;
		let quoteContent = [];
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (line.startsWith("> ") || line.startsWith(">") && line.trim() === ">") {
				if (!inQuoteBlock) {
					inQuoteBlock = true;
					quoteContent = [];
				}
				const quoteText = line.startsWith("> ") ? line.substring(2) : "";
				quoteContent.push(quoteText);
			} else {
				if (inQuoteBlock) {
					const processedQuote = this.processQuoteBlock(quoteContent);
					convertedLines.push(...processedQuote);
					inQuoteBlock = false;
					quoteContent = [];
				}
				convertedLines.push(line);
			}
		}
		if (inQuoteBlock && quoteContent.length > 0) {
			const processedQuote = this.processQuoteBlock(quoteContent);
			convertedLines.push(...processedQuote);
		}
		return convertedLines.join("\n");
	}
	/**
	* 处理引用块内容
	*/
	processQuoteBlock(quoteContent) {
		if (quoteContent.length === 0) return [];
		const firstLine = quoteContent[0];
		if (this.isAlertBox(firstLine)) {
			const noteContent = firstLine.replace(/\*\*注意[：:]\*\*\s*/, "").replace(/\*\*Note[：:]\*\*\s*/, "").replace(/\*\*警告[：:]\*\*\s*/, "").replace(/\*\*Warning[：:]\*\*\s*/, "").replace(/\*\*错误[：:]\*\*\s*/, "").replace(/\*\*Error[：:]\*\*\s*/, "");
			if (firstLine.includes("**注意") || firstLine.includes("**Note")) return [
				"::: tip 注意",
				noteContent,
				...quoteContent.slice(1),
				":::"
			];
			else if (firstLine.includes("**警告") || firstLine.includes("**Warning")) return [
				"::: warning 警告",
				noteContent,
				...quoteContent.slice(1),
				":::"
			];
			else if (firstLine.includes("**错误") || firstLine.includes("**Error")) return [
				"::: danger 错误",
				noteContent,
				...quoteContent.slice(1),
				":::"
			];
		}
		return [
			"::: info",
			...quoteContent,
			":::"
		];
	}
	/**
	* 检查是否为警告框格式
	*/
	isAlertBox(line) {
		const alertPatterns = [
			/\*\*注意[：:]\*\*/,
			/\*\*警告[：:]\*\*/,
			/\*\*错误[：:]\*\*/,
			/\*\*Note[：:]\*\*/,
			/\*\*Warning[：:]\*\*/,
			/\*\*Error[：:]\*\*/
		];
		return alertPatterns.some((pattern) => pattern.test(line));
	}
};

//#endregion
//#region src/transformers/types.ts
/**
* 解析代码块信息
* @param info 代码块信息字符串，如 "rust,editable"
* @returns 解析后的代码块信息对象
*/
function parseCodeBlockInfo(info) {
	const parts = info.trim().split(",");
	return {
		language: parts[0] || "",
		options: parts.slice(1)
	};
}

//#endregion
//#region src/transformers/rust-playground.ts
/**
* Rust Playground 集成转换器
* 将 mdBook 的 Rust Playground 语法转换为 VitePress 兼容的格式
* 
* mdBook: ```rust,editable 或 ```rust,noplayground
* VitePress: ```rust
*/
var RustPlaygroundTransformer = class {
	name = "rustPlayground";
	description = "将 mdBook 的 Rust Playground 语法转换为标准代码块";
	transform(content) {
		const lines = content.split("\n");
		const transformedLines = [];
		let inCodeBlock = false;
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (line.trim().startsWith("```") && !inCodeBlock) {
				inCodeBlock = true;
				const infoString = line.trim().substring(3).trim();
				if (infoString) {
					const info = parseCodeBlockInfo(infoString);
					if (info.language === "rust" && (info.options.includes("editable") || info.options.includes("noplayground") || info.options.includes("ignore"))) line = "```rust";
				}
			} else if (line.trim() === "```" && inCodeBlock) inCodeBlock = false;
			transformedLines.push(line);
		}
		return transformedLines.join("\n");
	}
};

//#endregion
//#region src/transformers/index.ts
/**
* 创建转换器注册表
* 包含所有可用的 Markdown 转换器
*/
function createTransformerRegistry() {
	return {
		"hidden-code-lines": new HiddenCodeLinesTransformer(),
		"include-files": new IncludeFilesTransformer(),
		"rust-playground": new RustPlaygroundTransformer(),
		"html-attributes": new HtmlAttributesTransformer(),
		"mathjax": new MathJaxTransformer(),
		"quote-blocks": new QuoteBlocksTransformer(),
		"image-references": new ImageReferencesTransformer()
	};
}
/**
* 使用所有转换器转换 Markdown 内容
* @param content 原始 Markdown 内容
* @returns 转换后的内容
*/
function transformMarkdown(content) {
	const registry = createTransformerRegistry();
	let transformedContent = content;
	for (const key in registry) transformedContent = registry[key].transform(transformedContent);
	return transformedContent;
}

//#endregion
//#region src/converter.ts
/**
* MdBook 语法转换器
* 负责将 mdbook 特有的语法转换为 VitePress 兼容的格式
*/
var MdBookSyntaxConverter = class {
	transformers = createTransformerRegistry();
	/**
	* 转换 markdown 文件内容
	* @param content 原始 markdown 内容
	* @returns 转换后的内容
	*/
	convert(content) {
		return transformMarkdown(content);
	}
	/**
	* 获取 VitePress 配置中需要添加的 MathJax 配置
	*/
	getVitePressConfig() {
		return { markdown: { math: true } };
	}
	/**
	* 获取需要添加到 package.json 的依赖
	*/
	getPackageDependencies() {
		return { "markdown-it-mathjax3": "^4.3.2" };
	}
};

//#endregion
//#region src/migrator.ts
var MdBookToVitePressConverter = class {
	options;
	parser;
	syntaxConverter;
	constructor(options) {
		this.options = options;
		this.parser = new MdBookParser(options.sourcePath);
		this.syntaxConverter = new MdBookSyntaxConverter();
	}
	async migrate() {
		if (this.options.onlyConvertFiles) {
			console.log("开始转换 markdown 文件...");
			await this.convertFilesOnly();
			console.log("文件转换完成！");
			return;
		}
		console.log("开始从 mdbook 迁移到 VitePress...");
		const mdBookConfig = this.parser.parseConfig();
		if (!mdBookConfig) throw new Error("解析 mdbook 配置失败");
		await this.createTargetStructure();
		await this.copyMarkdownFiles();
		await this.generateVitePressConfig(mdBookConfig);
		await this.createVitePressPackageJson();
		console.log("迁移成功完成！");
	}
	async createTargetStructure() {
		const docsDir = join$1(this.options.targetPath, "docs");
		const vitepressDir = join$1(docsDir, ".vitepress");
		await ensureDir(docsDir);
		await ensureDir(vitepressDir);
		console.log("已创建目标目录结构");
	}
	async createDefaultHomePage(docsDir, chapters = [], title = "", description = "") {
		const indexPath = join$1(docsDir, "index.md");
		if (!title || !description) {
			const mdBookConfig = this.parser.parseConfig();
			title = title || mdBookConfig?.book?.title || "文档";
			description = description || mdBookConfig?.book?.description || "使用 VitePress 构建的文档站点";
		}
		let firstChapterLink = "/README";
		if (chapters && chapters.length > 0 && chapters[0].link) firstChapterLink = `/${chapters[0].link.replace(".md", "")}`;
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
	async copyMarkdownFiles() {
		const sourceDir = join$1(this.options.sourcePath, "src");
		const docsDir = join$1(this.options.targetPath, "docs");
		const publicDir = join$1(this.options.targetPath, "docs", "public");
		if (!existsSync$1(sourceDir)) {
			console.warn("未找到源目录:", sourceDir);
			return;
		}
		await ensureDir(publicDir);
		await this.copyFilesRecursively(sourceDir, docsDir, publicDir);
		console.log("已复制 markdown 文件和静态资源");
	}
	async copyFilesRecursively(sourceDir, docsTargetDir, publicTargetDir) {
		const items = readdirSync(sourceDir);
		for (const item of items) {
			const sourcePath = join$1(sourceDir, item);
			const stat = statSync(sourcePath);
			if (stat.isDirectory()) {
				const docsSubDir = join$1(docsTargetDir, item);
				const publicSubDir = join$1(publicTargetDir, item);
				await ensureDir(docsSubDir);
				await ensureDir(publicSubDir);
				await this.copyFilesRecursively(sourcePath, docsSubDir, publicSubDir);
			} else {
				const ext = extname(item).toLowerCase();
				if (ext === ".md") {
					const targetPath = join$1(docsTargetDir, item);
					await this.convertMarkdownFile(sourcePath, targetPath);
				} else if (this.isStaticAsset(ext)) {
					const targetPath = join$1(publicTargetDir, item);
					copyFileSync(sourcePath, targetPath);
				} else if (this.isDocumentFile(ext)) {
					const targetPath = join$1(docsTargetDir, item);
					copyFileSync(sourcePath, targetPath);
				}
			}
		}
	}
	isStaticAsset(ext) {
		const staticExtensions = [
			".png",
			".jpg",
			".jpeg",
			".gif",
			".svg",
			".webp",
			".ico",
			".pdf"
		];
		return staticExtensions.includes(ext);
	}
	isDocumentFile(ext) {
		const docExtensions = [
			".txt",
			".json",
			".yaml",
			".yml",
			".toml"
		];
		return docExtensions.includes(ext);
	}
	async generateVitePressConfig(mdBookConfig) {
		const chapters = this.parser.parseSummary();
		const sidebar = this.generateSidebar(chapters);
		const title = mdBookConfig.book?.title || "文档";
		const description = mdBookConfig.book?.description || "文档站点";
		const language = mdBookConfig.book?.language || "zh-CN";
		const vitePressConfig = {
			title,
			description,
			lang: language,
			themeConfig: { sidebar }
		};
		const mathJaxConfig = this.syntaxConverter.getVitePressConfig();
		Object.assign(vitePressConfig, mathJaxConfig);
		if (this.options.generateNav) vitePressConfig.themeConfig.nav = this.generateNav(chapters);
		const configPath = join$1(this.options.targetPath, "docs", ".vitepress", "config.ts");
		const configContent = this.generateConfigFile(vitePressConfig);
		writeFileSync(configPath, configContent, "utf-8");
		const docsDir = join$1(this.options.targetPath, "docs");
		await this.createDefaultHomePage(docsDir, chapters, title, description);
		console.log("已生成 VitePress 配置");
	}
	generateSidebar(chapters) {
		const sidebar = [];
		const processChapters = (items) => {
			return items.map((item) => {
				const result = {
					text: item.title,
					link: `/${item.link.replace(".md", "")}`
				};
				if (item.items && item.items.length > 0) {
					result.items = processChapters(item.items);
					result.collapsed = false;
				}
				return result;
			});
		};
		return processChapters(chapters);
	}
	generateNav(chapters) {
		let firstChapterLink = "guide";
		if (chapters.length > 0 && chapters[0].link) firstChapterLink = chapters[0].link.replace(".md", "");
		return [{
			text: "首页",
			link: "/"
		}, {
			text: "指南",
			link: `/${firstChapterLink}`
		}];
	}
	extractTitleFromFile(filePath) {
		const fullPath = join$1(this.options.sourcePath, "src", filePath);
		if (!existsSync$1(fullPath)) return filePath.replace(".md", "").replace(/[-_]/g, " ");
		try {
			const content = readFileSync$1(fullPath, "utf-8");
			const titleMatch = content.match(/^#\s+(.+)$/m);
			if (titleMatch) return titleMatch[1].trim();
		} catch (error) {
			console.warn(`无法读取文件 ${fullPath}:`, error);
		}
		return filePath.replace(".md", "").replace(/[-_]/g, " ");
	}
	generateConfigFile(config) {
		const configString = this.formatConfigObject(config, 0);
		return `import { defineConfig } from 'vitepress'

export default defineConfig(${configString})
`;
	}
	formatConfigObject(obj, indent) {
		const spaces = "  ".repeat(indent);
		const nextSpaces = "  ".repeat(indent + 1);
		if (Array.isArray(obj)) {
			if (obj.length === 0) return "[]";
			const items = obj.map((item) => `${nextSpaces}${this.formatConfigObject(item, indent + 1)}`);
			return `[\n${items.join(",\n")}\n${spaces}]`;
		}
		if (obj && typeof obj === "object") {
			const entries = Object.entries(obj);
			if (entries.length === 0) return "{}";
			const props = entries.map(([key, value]) => {
				const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
				return `${nextSpaces}${formattedKey}: ${this.formatConfigObject(value, indent + 1)}`;
			});
			return `{\n${props.join(",\n")}\n${spaces}}`;
		}
		if (typeof obj === "string") return `'${obj.replace(/'/g, "\\'")}'`;
		return JSON.stringify(obj);
	}
	async createVitePressPackageJson() {
		const packageJson = {
			name: "vitepress-docs",
			version: "1.0.0",
			description: "Documentation site built with VitePress",
			type: "module",
			scripts: {
				"docs:dev": "vitepress dev docs",
				"docs:build": "vitepress build docs",
				"docs:preview": "vitepress preview docs"
			},
			devDependencies: { vitepress: "^1.0.0" }
		};
		const additionalDependencies = this.syntaxConverter.getPackageDependencies();
		Object.assign(packageJson.devDependencies, additionalDependencies);
		const packagePath = join$1(this.options.targetPath, "package.json");
		writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), "utf-8");
		console.log("已创建 VitePress package.json");
	}
	async convertFilesOnly() {
		const sourceDir = join$1(this.options.sourcePath, "src");
		if (!existsSync$1(sourceDir)) {
			console.warn("未找到源目录:", sourceDir);
			return;
		}
		await ensureDir(this.options.targetPath);
		await this.processDirectory(sourceDir, this.options.targetPath);
		console.log("已完成文件转换和移动");
	}
	async processDirectory(sourceDir, targetDir) {
		const items = readdirSync(sourceDir);
		for (const item of items) {
			const sourcePath = join$1(sourceDir, item);
			const targetPath = join$1(targetDir, item);
			const stat = statSync(sourcePath);
			if (stat.isDirectory()) {
				await ensureDir(targetPath);
				await this.processDirectory(sourcePath, targetPath);
			} else if (extname(item) === ".md") {
				console.log("start to handle markdown!!!!!");
				await this.convertMarkdownFile(sourcePath, targetPath);
			} else {
				const ext = extname(item).toLowerCase();
				if (this.isStaticAsset(ext) || this.isDocumentFile(ext)) {
					copyFileSync(sourcePath, targetPath);
					console.log(`已复制资源文件: ${basename(sourcePath)}`);
				}
			}
		}
	}
	async convertMarkdownFile(sourcePath, targetPath) {
		try {
			let content = readFileSync$1(sourcePath, "utf-8");
			console.log(`转换文件: ${basename(sourcePath)}`);
			console.log(`文件大小: ${content.length} 字节`);
			content = this.syntaxConverter.convert(content);
			writeFileSync(targetPath, content, "utf-8");
			console.log(`已转换: ${basename(sourcePath)}`);
		} catch (error) {
			console.error(`转换文件失败 ${sourcePath}:`, error);
		}
	}
};

//#endregion
//#region src/cli.ts
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function getVersion() {
	try {
		const packageJsonPath = join(__dirname, "..", "package.json");
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
		return packageJson.version;
	} catch (error) {
		console.warn("无法读取版本信息:", error);
		return "未知版本";
	}
}
const program = new Command();
program.name("mdbook-to-vitepress").description("将 mdbook 项目迁移到 VitePress").version(getVersion(), "-v, --version", "显示版本号");
program.command("migrate").description("将 mdbook 项目迁移到 VitePress").argument("<target>", "目标 VitePress 项目目录路径").argument("[source]", "mdbook 项目目录路径", ".").option("-p, --preserve-structure", "保持原始目录结构", false).option("-n, --generate-nav", "生成导航菜单", true).option("-f, --files-only", "仅转换文件，不生成 VitePress 结构", false).action(async (target, source, options) => {
	try {
		const sourcePath = resolve(source);
		const targetPath = resolve(target);
		if (!existsSync(sourcePath)) {
			console.error(`错误：源目录不存在: ${sourcePath}`);
			process.exit(1);
		}
		const bookTomlPath = resolve(sourcePath, "book.toml");
		if (!existsSync(bookTomlPath)) {
			console.warn(`警告：在 ${sourcePath} 中未找到 book.toml`);
			console.warn("使用默认配置继续...");
		}
		const migrationOptions = {
			sourcePath,
			targetPath,
			preserveStructure: options.preserveStructure,
			generateNav: options.generateNav,
			onlyConvertFiles: options.filesOnly
		};
		const converter = new MdBookToVitePressConverter(migrationOptions);
		await converter.migrate();
		if (options.filesOnly) {
			console.log("\n✅ 文件转换完成！");
			console.log("\n转换后的文件位于:", targetPath);
		} else {
			console.log("\n✅ 迁移成功完成！");
			console.log("\n下一步操作：");
			console.log(`1. cd ${targetPath}`);
			console.log("2. npm install");
			console.log("3. npm run docs:dev");
		}
	} catch (error) {
		console.error("❌ 迁移失败：", error);
		process.exit(1);
	}
});
program.command("init").description("初始化一个新的 VitePress 项目").argument("<target>", "目标目录路径").action(async (target) => {
	console.log(`正在 ${target} 中初始化 VitePress 项目...`);
	console.log("使用 migrate 命令从 mdbook 转换");
});
program.parse();

//#endregion