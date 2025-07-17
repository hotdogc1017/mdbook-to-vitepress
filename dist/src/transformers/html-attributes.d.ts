import { MarkdownTransformer } from './types';
/**
 * HTML 属性转换器
 * 将 mdBook 特有的 HTML 属性语法转换为 VitePress 兼容的格式
 *
 * mdBook: {#id .class1 .class2 key=val}
 * VitePress: 保留 {#id} 语法，其他属性添加注释
 */
export declare class HtmlAttributesTransformer implements MarkdownTransformer {
    name: string;
    description: string;
    transform(content: string): string;
}
//# sourceMappingURL=html-attributes.d.ts.map