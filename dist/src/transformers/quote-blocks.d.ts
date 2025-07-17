import { MarkdownTransformer } from './types';
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
export declare class QuoteBlocksTransformer implements MarkdownTransformer {
    name: string;
    description: string;
    transform(content: string): string;
    /**
     * 处理引用块内容
     */
    private processQuoteBlock;
    /**
     * 检查是否为警告框格式
     */
    private isAlertBox;
}
//# sourceMappingURL=quote-blocks.d.ts.map