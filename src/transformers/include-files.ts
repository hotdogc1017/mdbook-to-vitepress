import { MarkdownTransformer } from "./types";

/**
 * 包含文件转换器
 * 将 mdBook 的包含文件语法转换为 VitePress 兼容的格式
 *
 * mdBook: {{#include file.rs}} 或 {{#include file.rs:10:20}}
 * VitePress: <<< file.rs 或 <<< file.rs{10-20}
 */
export class IncludeFilesTransformer implements MarkdownTransformer {
  name = "includeFiles";
  description = "将 mdBook 的包含文件语法转换为 VitePress 的代码片段导入语法";

  transform(content: string): string {
    // 处理 {{#include file.rs}} 语法
    content = content.replace(/\{\{#include\s+([^}]+)\}\}/g, (_, filePath) => {
      return this.convertIncludeSyntax(filePath);
    });

    // 处理 {{#rustdoc_include file.rs}} 语法
    content = content.replace(
      /\{\{#rustdoc_include\s+([^}]+)\}\}/g,
      (_, filePath) => {
        return this.convertIncludeSyntax(filePath);
      }
    );

    return content;
  }

  transformLine(line: string): string {
    // 处理 {{#include file.rs}} 语法
    line = line.replace(/\{\{#include\s+([^}]+)\}\}/g, (_, filePath) => {
      return this.convertIncludeSyntax(filePath);
    });

    // 处理 {{#rustdoc_include file.rs}} 语法
    line = line.replace(
      /\{\{#rustdoc_include\s+([^}]+)\}\}/g,
      (_, filePath) => {
        return this.convertIncludeSyntax(filePath);
      }
    );

    return line;
  }

  private convertIncludeSyntax(filePath: string): string {
    // 处理特殊情况：file.rs::10 (从文件开头到第10行)
    if (filePath.includes("::")) {
      const [path, endLine] = filePath.split("::");
      
      // 构建基础路径
      let vitePressPath: string;
      if (path.startsWith("./")) {
        vitePressPath = path.substring(2);
      } else {
        vitePressPath = path;
      }
      
      // 格式: file.rs::10 (从文件开头到第10行)
      return `<<< ${vitePressPath}{1-${endLine}}`;
    }
    
    // 处理常规情况
    const parts = filePath.split(":");
    const cleanPath = parts[0];

    // 构建基础路径 - VitePress 使用相对路径，不需要 @ 前缀
    let vitePressPath: string;
    if (cleanPath.startsWith("./")) {
      vitePressPath = cleanPath.substring(2);
    } else {
      vitePressPath = cleanPath;
    }

    // 处理行号范围
    if (parts.length === 3) {
      // 格式: file.rs:10:20
      const startLine = parts[1];
      const endLine = parts[2];
      return `<<< ${vitePressPath}{${startLine}-${endLine}}`;
    } else if (parts.length === 2) {
      // 格式: file.rs:10 (从第10行开始到文件末尾)
      const startLine = parts[1];
      return `<<< ${vitePressPath}{${startLine}-}`;
    } else {
      // 格式: file.rs (整个文件)
      return `<<< ${vitePressPath}`;
    }
  }
}
