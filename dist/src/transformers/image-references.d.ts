import { MarkdownTransformer } from './types';
/**
 * 图片引用转换器
 * 将 mdBook 的图片引用语法转换为 VitePress 兼容的格式
 *
 * HTML 图片: <img src="./image.png" alt="描述"> -> ![描述](/image.png)
 * Markdown 图片: ![描述](./image.png) -> ![描述](/image.png)
 */
export declare class ImageReferencesTransformer implements MarkdownTransformer {
    name: string;
    description: string;
    transform(content: string): string;
    /**
     * 将 HTML img 标签转换为 Markdown 格式
     */
    private convertImgTagsToMarkdown;
}
//# sourceMappingURL=image-references.d.ts.map