import { readFileSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { MarkdownTransformer } from "./types";

/**
 * 包含文件转换器
 * 将 mdBook 的包含文件语法直接替换为实际的文件内容（硬编码方式）
 *
 * mdBook 语法:
 * - {{#include file.rs}}                 // 包含整个文件
 * - {{#include file.rs:10:20}}           // 包含指定行范围
 * - {{#include file.rs:10}}              // 从指定行到文件末尾
 * - {{#include file.rs::10}}             // 从文件开头到指定行
 * - {{#include file.rs:component}}       // 包含锚点标记的内容
 * - {{#rustdoc_include file.rs}}         // 包含 Rust 文档注释
 *
 * 转换方式:
 * 直接将 {{#include}} 语法替换为实际的文件内容，避免路径转换的复杂性
 *
 * 锚点标记格式:
 * - // ANCHOR: name
 *   // 要包含的代码
 *   // ANCHOR_END: name
 *
 * - // #region name
 *   // 要包含的代码
 *   // #endregion name
 */
export class IncludeFilesTransformer implements MarkdownTransformer {
  name = "includeFiles";
  description =
    "将 mdBook 的包含文件语法直接替换为实际的文件内容（硬编码方式）";

  // 当前处理的文件路径和所在目录
  private filePath: string | undefined;
  private currentDir: string = process.cwd();

  /**
   * 构造函数
   * @param filePath 要转换的文件路径，用于解析相对路径
   */
  constructor(filePath?: string) {
    this.filePath = filePath;
  }

  // ========================================
  // 公共接口方法
  // ========================================

  /**
   * 转换整个文档内容
   * 如果提供了内容参数，则使用该内容
   * 否则从文件路径读取内容
   * @param content 可选的原始 Markdown 内容
   * @returns 转换后的内容
   */
  transform(content?: string): string {
    // 如果未提供了内容参数, 则从文件路径读取内容
    if (!content) {
      if (!this.filePath) {
        throw new Error("未设置文件路径，无法读取文件内容");
      }
      try {
        content = readFileSync(this.filePath, "utf-8");
      } catch (error) {
        console.error(`读取文件失败: ${this.filePath}`, error);
        return `// 错误: 无法读取文件 ${this.filePath}`;
      }
    }

    // 处理代码块中的 {{#include}} 语法
    content = this.processCodeBlockIncludes(content);

    // 处理普通文本中的 {{#include}} 语法
    content = this.processTextIncludes(content);

    return content;
  }

  /**
   * 转换单行内容
   */
  transformLine(line: string): string {
    // 处理 {{#include file.rs}} 语法
    line = line.replace(
      /\{\{#include\s+([^}]+)\}\}/g,
      (_: string, filePath: string) => {
        return this.extractFileContent(filePath);
      }
    );

    // 处理 {{#rustdoc_include file.rs}} 语法
    line = line.replace(
      /\{\{#rustdoc_include\s+([^}]+)\}\}/g,
      (_: string, filePath: string) => {
        return this.extractFileContent(filePath);
      }
    );

    return line;
  }

  // ========================================
  // 主要处理方法
  // ========================================

  // 已通过构造函数设置当前目录，不再需要单独的更新方法

  /**
   * 处理普通文本中的包含语法
   */
  private processTextIncludes(content: string): string {
    // 处理 {{#include}} 语法
    content = content.replace(
      /\{\{#include\s+([^}]+)\}\}/g,
      (_: string, includePath: string) => {
        return this.extractFileContent(includePath);
      }
    );

    // 处理 {{#rustdoc_include}} 语法
    content = content.replace(
      /\{\{#rustdoc_include\s+([^}]+)\}\}/g,
      (_: string, includePath: string) => {
        return this.extractFileContent(includePath);
      }
    );

    return content;
  }

  /**
   * 处理代码块中的 {{#include}} 语法
   * 例如：```rust\n{{#include file.rs:component}}\n```
   */
  private processCodeBlockIncludes(content: string): string {
    const codeBlockRegex = /```([^\n]*)\n([\s\S]*?)```/g;

    return content.replace(
      codeBlockRegex,
      (match, codeBlockInfo, codeBlockContent) => {
        if (!codeBlockContent.includes("{{#include")) {
          return match;
        }

        const processedContent = codeBlockContent.replace(
          /\{\{#include\s+([^}]+)\}\}/g,
          (_: string, includePath: string) => {
            return this.extractFileContent(includePath);
          }
        );

        if (processedContent !== codeBlockContent) {
          return "```" + codeBlockInfo + "\n" + processedContent + "```";
        }

        return match;
      }
    );
  }

  /**
   * 解析文件路径，支持相对路径
   * 始终以当前处理的文件所在目录为起始点解析相对路径
   */
  private resolvePath(filePath: string): string {
    // 所有路径都相对于当前处理的文件所在目录解析
    // 这样可以确保在目录结构变化时路径仍然有效
    return resolve(this.currentDir, filePath);
  }

  /**
   * 从文件内容中提取锚点标记的内容
   * 支持 ANCHOR/ANCHOR_END 和 #region/#endregion 两种格式
   */
  private extractAnchorContent(
    content: string,
    anchorName: string
  ): string | null {
    // 尝试匹配 ANCHOR/ANCHOR_END 格式
    const anchorRegex = new RegExp(
      `ANCHOR:\\s*${anchorName}[^\\n]*\\n([\\s\\S]*?)ANCHOR_END:\\s*${anchorName}`,
      "i"
    );
    const anchorMatch = content.match(anchorRegex);

    if (anchorMatch && anchorMatch[1]) {
      return anchorMatch[1].trim();
    }

    // 尝试匹配 #region/#endregion 格式
    const regionRegex = new RegExp(
      `#region\\s+${anchorName}[^\\n]*\\n([\\s\\S]*?)#endregion\\s+${anchorName}`,
      "i"
    );
    const regionMatch = content.match(regionRegex);

    if (regionMatch && regionMatch[1]) {
      return regionMatch[1].trim();
    }

    return null;
  }

  /**
   * 提取文件内容，支持锚点和行范围
   * 用于处理代码块中的 {{#include}} 语法
   */
  private extractFileContent(includePath: string): string {
    try {
      // 解析包含路径
      const parts = includePath.split(":");
      const includedFilePath = parts[0];

      // 解析文件路径
      const dir = dirname(resolve(process.cwd(), this.filePath!))
      const resolvedPath = join(dir, includedFilePath);
      if (!existsSync(resolvedPath)) {
        return `// 错误: 文件 ${includedFilePath} 不存在`;
      }

      // 读取文件内容
      const fileContent = readFileSync(resolvedPath, "utf-8");

      // 如果只有文件路径，返回整个文件内容
      if (parts.length === 1) {
        return fileContent;
      }

      // 首先判断是行引用还是锚点引用
      if (this.isLineReference(parts)) {
        return this.extractLineContent(fileContent, parts);
      } else {
        return (
          this.extractAnchorContent(fileContent, parts[1]) ||
          `// 错误: 在文件 ${includedFilePath} 中未找到锚点 '${parts[1]}'`
        );
      }
    } catch (error) {
      console.error(`提取文件内容时出错: ${includePath}`, error);
      return `// 错误: 处理 ${includePath} 时出错`;
    }
  }

  /**
   * 判断是否为行引用
   * 行引用格式: file.rs:10, file.rs:10:20, file.rs::10
   */
  private isLineReference(parts: string[]): boolean {
    // 特殊情况: file.rs::10 (从文件开头到第10行)
    if (
      parts.length === 2 &&
      parts[1].startsWith(":") &&
      /^\d+$/.test(parts[1].substring(1))
    ) {
      return true;
    }

    // 常规情况: file.rs:10 (从第10行到文件末尾)
    if (parts.length === 2 && /^\d+$/.test(parts[1])) {
      return true;
    }

    // 行范围: file.rs:10:20
    if (
      parts.length === 3 &&
      /^\d+$/.test(parts[1]) &&
      /^\d+$/.test(parts[2])
    ) {
      return true;
    }

    return false;
  }

  /**
   * 提取指定行范围的内容
   */
  private extractLineContent(fileContent: string, parts: string[]): string {
    const lines = fileContent.split("\n");

    // 特殊情况: file.rs::10 (从文件开头到第10行)
    if (parts.length === 2 && parts[1].startsWith(":")) {
      const endLine = parseInt(parts[1].substring(1), 10);

      if (endLine > lines.length) {
        return `// 错误: 行号 ${endLine} 超出文件范围`;
      }

      return lines.slice(0, endLine).join("\n");
    }

    // 常规情况: file.rs:10 (从第10行到文件末尾)
    if (parts.length === 2) {
      const startLine = parseInt(parts[1], 10);

      if (startLine > lines.length) {
        return `// 错误: 行号 ${startLine} 超出文件范围`;
      }

      return lines.slice(startLine - 1).join("\n");
    }

    // 行范围: file.rs:10:20
    if (parts.length === 3) {
      const startLine = parseInt(parts[1], 10);
      const endLine = parseInt(parts[2], 10);

      if (startLine > lines.length || endLine > lines.length) {
        return `// 错误: 行号范围 ${startLine}:${endLine} 超出文件范围`;
      }

      return lines.slice(startLine - 1, endLine).join("\n");
    }

    return fileContent; // 默认返回整个文件内容
  }
}
