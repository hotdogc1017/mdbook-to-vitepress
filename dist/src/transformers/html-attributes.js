/**
 * HTML 属性转换器
 * 将 mdBook 特有的 HTML 属性语法转换为 VitePress 兼容的格式
 *
 * mdBook: {#id .class1 .class2 key=val}
 * VitePress: 保留 {#id} 语法，其他属性添加注释
 */
export class HtmlAttributesTransformer {
    name = 'htmlAttributes';
    description = '将 mdBook 的 HTML 属性语法转换为 VitePress 兼容的格式';
    transform(content) {
        // 处理标题的 ID 属性
        content = content.replace(/^(#+)\s+(.*?)\s+\{#([^}]+)\}/gm, (_, hashes, title, id) => {
            // VitePress 支持 {#id} 语法，可以直接保留
            return `${hashes} ${title} {#${id}}`;
        });
        // 处理其他元素的类和属性
        // VitePress 不直接支持 {.class key=val} 语法，需要转换为 HTML
        content = content.replace(/\{([^{}]+)\}/g, (match, attributes) => {
            // 如果只包含 ID，保留原样（VitePress 支持）
            if (/^#[a-zA-Z0-9_-]+$/.test(attributes.trim())) {
                return match;
            }
            // 提取类和其他属性
            const classMatch = attributes.match(/\.[a-zA-Z0-9_-]+/g);
            const classes = classMatch ? classMatch.map((c) => c.substring(1)).join(' ') : '';
            // 提取其他属性
            const otherAttrs = attributes.replace(/\.[a-zA-Z0-9_-]+/g, '').trim();
            // 构建 HTML 注释，提示用户手动转换
            return `<!-- mdBook 属性: ${match} -->
<!-- VitePress 不完全支持此语法，请考虑使用 HTML 标签: -->
<!-- 例如: <div class="${classes}" ${otherAttrs}> 内容 </div> -->`;
        });
        return content;
    }
}
//# sourceMappingURL=html-attributes.js.map