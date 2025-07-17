import { MarkdownTransformer } from './types';

/**
 * MathJax 转换器
 * 处理 mdBook 中的数学公式语法
 * 
 * mdBook 和 VitePress 都使用 $ 和 $$ 分隔符，所以不需要转换
 * 但需要确保 VitePress 配置中启用了 mathjax
 */
export class MathJaxTransformer implements MarkdownTransformer {
  name = 'mathjax';
  description = '处理 MathJax 数学公式语法';

  transform(content: string): string {
    // VitePress 默认支持 $ 和 $$ 分隔符的 MathJax 语法
    // 我们只需要确保在配置中启用 mathjax
    // 这个转换器不需要修改内容，只是为了完整性而存在
    return content;
  }
  
  /**
   * 获取 VitePress 配置中需要添加的 MathJax 配置
   */
  getVitePressConfig(): { markdown: { math: boolean } } {
    return {
      markdown: {
        math: true
      }
    };
  }
  
  /**
   * 获取需要添加到 package.json 的依赖
   */
  getPackageDependencies(): Record<string, string> {
    return {
      'markdown-it-mathjax3': '^4.3.2'
    };
  }
}