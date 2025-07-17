import { MarkdownTransformer } from './types';
/**
 * MathJax 转换器
 * 处理 mdBook 中的数学公式语法
 *
 * mdBook 和 VitePress 都使用 $ 和 $$ 分隔符，所以不需要转换
 * 但需要确保 VitePress 配置中启用了 mathjax
 */
export declare class MathJaxTransformer implements MarkdownTransformer {
    name: string;
    description: string;
    transform(content: string): string;
    /**
     * 获取 VitePress 配置中需要添加的 MathJax 配置
     */
    getVitePressConfig(): {
        markdown: {
            math: boolean;
        };
    };
    /**
     * 获取需要添加到 package.json 的依赖
     */
    getPackageDependencies(): Record<string, string>;
}
//# sourceMappingURL=mathjax.d.ts.map