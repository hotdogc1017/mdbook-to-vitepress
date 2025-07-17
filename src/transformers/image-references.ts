import { MarkdownTransformer } from './types';

/**
 * 图片引用转换器
 * 将 mdBook 的图片引用语法转换为 VitePress 兼容的格式
 * 
 * HTML 图片: <img src="./image.png" alt="描述"> -> ![描述](/image.png)
 * Markdown 图片: ![描述](./image.png) -> ![描述](/image.png)
 */
export class ImageReferencesTransformer implements MarkdownTransformer {
  name = 'imageReferences';
  description = '将 mdBook 的图片引用语法转换为 VitePress 兼容的格式';

  transform(content: string): string {
    // 首先转换 HTML img 标签为 Markdown 格式
    content = this.convertImgTagsToMarkdown(content);
    
    // 然后转换 markdown 格式的图片引用路径
    content = content.replace(/!\[([^\]]*)\]\(\.\/([^)]+)\)/g, "![$1](/$2)");
    
    // 转换相对路径的图片引用（不以 ./ 开头但也不是绝对路径或 URL）
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      // 跳过外部链接和已经是绝对路径的图片
      if (src.startsWith("http") || src.startsWith("/") || src.startsWith("#")) {
        return match;
      }
      return `![${alt}](/${src})`;
    });

    return content;
  }
  
  /**
   * 将 HTML img 标签转换为 Markdown 格式
   */
  private convertImgTagsToMarkdown(content: string): string {
    return content.replace(/<img([^>]*?)>/g, (match, attributes) => {
      // 提取 src 属性
      const srcMatch = attributes.match(/\s+src=["']([^"']+)["']/);
      if (!srcMatch) return match; // 如果没有 src 属性，保持原样
      
      let src = srcMatch[1];
      
      // 提取 alt 属性
      const altMatch = attributes.match(/\s+alt=["']([^"']*?)["']/);
      const alt = altMatch ? altMatch[1] : '';
      
      // 转换路径格式
      if (src.startsWith('./')) {
        src = `/${src.substring(2)}`;
      } else if (!src.startsWith('/') && !src.startsWith('http')) {
        src = `/${src}`;
      }
      
      // 返回 Markdown 格式
      return `![${alt}](${src})`;
    });
  }
}