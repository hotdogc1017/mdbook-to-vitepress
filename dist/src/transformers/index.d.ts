import { TransformerRegistry } from './types';
/**
 * 创建转换器注册表
 * 包含所有可用的 Markdown 转换器
 */
export declare function createTransformerRegistry(): TransformerRegistry;
/**
 * 使用所有转换器转换 Markdown 内容
 * @param content 原始 Markdown 内容
 * @returns 转换后的内容
 */
export declare function transformMarkdown(content: string): string;
export * from './types';
export { HiddenCodeLinesTransformer } from './hidden-code-lines';
export { HtmlAttributesTransformer } from './html-attributes';
export { ImageReferencesTransformer } from './image-references';
export { IncludeFilesTransformer } from './include-files';
export { MathJaxTransformer } from './mathjax';
export { QuoteBlocksTransformer } from './quote-blocks';
export { RustPlaygroundTransformer } from './rust-playground';
//# sourceMappingURL=index.d.ts.map