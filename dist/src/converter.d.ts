/**
 * MdBook 语法转换器
 * 负责将 mdbook 特有的语法转换为 VitePress 兼容的格式
 */
export declare class MdBookSyntaxConverter {
    private transformers;
    /**
     * 转换 markdown 文件内容
     * @param content 原始 markdown 内容
     * @returns 转换后的内容
     */
    convert(content: string): string;
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
//# sourceMappingURL=converter.d.ts.map