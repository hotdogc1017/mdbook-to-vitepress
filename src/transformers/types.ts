/**
 * Markdown 转换器接口
 * 定义了 Markdown 转换器的基本结构
 */
export interface MarkdownTransformer {
  /**
   * 转换整个文档内容
   * @param content 原始 Markdown 内容
   * @returns 转换后的内容
   */
  transform(content: string): string;
  
  /**
   * 转换单行内容
   * @param line 单行内容
   * @returns 转换后的内容
   */
  transformLine?(line: string): string;
  
  /**
   * 转换器的名称
   */
  name: string;
  
  /**
   * 转换器的描述
   */
  description: string;
}

/**
 * 转换器注册表类型
 * 用于存储所有可用的转换器
 */
export type TransformerRegistry = Record<string, MarkdownTransformer>;

/**
 * 代码块信息类型
 */
export interface CodeBlockInfo {
  language: string;
  options: string[];
}

/**
 * 解析代码块信息
 * @param info 代码块信息字符串，如 "rust,editable"
 * @returns 解析后的代码块信息对象
 */
export function parseCodeBlockInfo(info: string): CodeBlockInfo {
  const parts = info.trim().split(',');
  return {
    language: parts[0] || '',
    options: parts.slice(1)
  };
}