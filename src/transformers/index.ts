import { HiddenCodeLinesTransformer } from './hidden-code-lines';
import { HtmlAttributesTransformer } from './html-attributes';
import { ImageReferencesTransformer } from './image-references';
import { IncludeFilesTransformer } from './include-files';
import { MathJaxTransformer } from './mathjax';
import { QuoteBlocksTransformer } from './quote-blocks';
import { RustPlaygroundTransformer } from './rust-playground';
import { MarkdownTransformer, TransformerRegistry } from './types';

/**
 * 创建转换器注册表
 * 包含所有可用的 Markdown 转换器构造函数
 */
export function createTransformerRegistry(): TransformerRegistry {
  return {
    // 隐藏代码行
    'hidden-code-lines': HiddenCodeLinesTransformer,
    
    // 包含文件
    'include-files': IncludeFilesTransformer,
    
    // Rust Playground 集成
    'rust-playground': RustPlaygroundTransformer,
    
    // HTML 属性
    'html-attributes': HtmlAttributesTransformer,
    
    // MathJax 支持
    'mathjax': MathJaxTransformer,
    
    // 引用块
    'quote-blocks': QuoteBlocksTransformer,
    
    // 图片引用
    'image-references': ImageReferencesTransformer,
  };
}

/**
 * 使用所有转换器转换 Markdown 内容
 * @param content 原始 Markdown 内容
 * @param filePath 当前处理的文件路径，用于解析相对路径
 * @returns 转换后的内容
 */
export function transformMarkdown(content: string, filePath?: string): string {
  const registry = createTransformerRegistry();
  let transformedContent = content;
  
  // 按顺序应用所有转换器
  for (const key in registry) {
    // 创建转换器实例，传入文件路径
    const transformer = new registry[key](filePath);
    
    // 调用实例的 transform 方法，传入内容参数
    transformedContent = transformer.transform(transformedContent);
  }
  
  return transformedContent;
}

export * from './types';
export { HiddenCodeLinesTransformer } from './hidden-code-lines';
export { HtmlAttributesTransformer } from './html-attributes';
export { ImageReferencesTransformer } from './image-references';
export { IncludeFilesTransformer } from './include-files';
export { MathJaxTransformer } from './mathjax';
export { QuoteBlocksTransformer } from './quote-blocks';
export { RustPlaygroundTransformer } from './rust-playground';