import { MarkdownTransformer } from './types';
/**
 * 隐藏代码行转换器
 * 将 mdBook 的隐藏代码行语法转换为 VitePress 兼容的格式
 *
 * mdBook: # 这是隐藏的代码行
 * VitePress: // 这是隐藏的代码行
 */
export declare class HiddenCodeLinesTransformer implements MarkdownTransformer {
    name: string;
    description: string;
    transform(content: string): string;
    transformLine(line: string): string;
}
//# sourceMappingURL=hidden-code-lines.d.ts.map