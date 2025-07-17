import { MarkdownTransformer } from './types';
/**
 * 包含文件转换器
 * 将 mdBook 的包含文件语法转换为 VitePress 兼容的格式
 *
 * mdBook: {{#include file.rs}} 或 {{#include file.rs:10:20}}
 * VitePress: <<< file.rs 或 <<< file.rs{10-20}
 */
export declare class IncludeFilesTransformer implements MarkdownTransformer {
    name: string;
    description: string;
    transform(content: string): string;
    transformLine(line: string): string;
    private convertIncludeSyntax;
}
//# sourceMappingURL=include-files.d.ts.map