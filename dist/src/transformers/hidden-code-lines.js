/**
 * 隐藏代码行转换器
 * 将 mdBook 的隐藏代码行语法转换为 VitePress 兼容的格式
 *
 * mdBook: # 这是隐藏的代码行
 * VitePress: // 这是隐藏的代码行
 */
export class HiddenCodeLinesTransformer {
    name = 'hiddenCodeLines';
    description = '将 mdBook 的隐藏代码行语法转换为注释';
    transform(content) {
        const lines = content.split('\n');
        let inCodeBlock = false;
        const transformedLines = lines.map(line => {
            // 检查是否在代码块中
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                return line;
            }
            // 如果在代码块中，处理隐藏代码行
            if (inCodeBlock) {
                // 处理隐藏代码行，但不处理 shebang (#!)
                if (line.trim().startsWith('#') && !line.trim().startsWith('#!')) {
                    return '// ' + line.trim().substring(1);
                }
            }
            return line;
        });
        return transformedLines.join('\n');
    }
    transformLine(line) {
        // 注意：这个方法只应该在确定当前行在代码块内时调用
        if (line.trim().startsWith('#') && !line.trim().startsWith('#!')) {
            return '// ' + line.trim().substring(1);
        }
        return line;
    }
}
//# sourceMappingURL=hidden-code-lines.js.map