import { createTransformerRegistry, transformMarkdown } from './transformers';
/**
 * MdBook 语法转换器
 * 负责将 mdbook 特有的语法转换为 VitePress 兼容的格式
 */
export class MdBookSyntaxConverter {
    transformers = createTransformerRegistry();
    /**
     * 转换 markdown 文件内容
     * @param content 原始 markdown 内容
     * @returns 转换后的内容
     */
    convert(content) {
        // 使用模块化的转换器处理内容
        return transformMarkdown(content);
    }
    /**
     * 获取 VitePress 配置中需要添加的 MathJax 配置
     */
    getVitePressConfig() {
        return {
            markdown: {
                math: true
            }
        };
    }
    /**
     * 获取需要添加到 package.json 的依赖
     */
    getPackageDependencies() {
        return {
            'markdown-it-mathjax3': '^4.3.2'
        };
    }
}
//# sourceMappingURL=converter.js.map