import { HiddenCodeLinesTransformer } from './hidden-code-lines';
import { HtmlAttributesTransformer } from './html-attributes';
import { ImageReferencesTransformer } from './image-references';
import { IncludeFilesTransformer } from './include-files';
import { MathJaxTransformer } from './mathjax';
import { QuoteBlocksTransformer } from './quote-blocks';
import { RustPlaygroundTransformer } from './rust-playground';
/**
 * 创建转换器注册表
 * 包含所有可用的 Markdown 转换器
 */
export function createTransformerRegistry() {
    return {
        // 隐藏代码行
        'hidden-code-lines': new HiddenCodeLinesTransformer(),
        // 包含文件
        'include-files': new IncludeFilesTransformer(),
        // Rust Playground 集成
        'rust-playground': new RustPlaygroundTransformer(),
        // HTML 属性
        'html-attributes': new HtmlAttributesTransformer(),
        // MathJax 支持
        'mathjax': new MathJaxTransformer(),
        // 引用块
        'quote-blocks': new QuoteBlocksTransformer(),
        // 图片引用
        'image-references': new ImageReferencesTransformer(),
    };
}
/**
 * 使用所有转换器转换 Markdown 内容
 * @param content 原始 Markdown 内容
 * @returns 转换后的内容
 */
export function transformMarkdown(content) {
    const registry = createTransformerRegistry();
    let transformedContent = content;
    // 按顺序应用所有转换器
    for (const key in registry) {
        transformedContent = registry[key].transform(transformedContent);
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
//# sourceMappingURL=index.js.map