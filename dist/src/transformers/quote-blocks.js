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
export class QuoteBlocksTransformer {
    name = 'quoteBlocks';
    description = '将 mdBook 的引用块语法转换为 VitePress 的容器语法';
    transform(content) {
        const lines = content.split('\n');
        const convertedLines = [];
        let inQuoteBlock = false;
        let quoteContent = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // 处理引用块的特殊逻辑
            if (line.startsWith('> ') || (line.startsWith('>') && line.trim() === '>')) {
                if (!inQuoteBlock) {
                    inQuoteBlock = true;
                    quoteContent = [];
                }
                const quoteText = line.startsWith('> ') ? line.substring(2) : '';
                quoteContent.push(quoteText);
            }
            else {
                // 结束引用块
                if (inQuoteBlock) {
                    const processedQuote = this.processQuoteBlock(quoteContent);
                    convertedLines.push(...processedQuote);
                    inQuoteBlock = false;
                    quoteContent = [];
                }
                convertedLines.push(line);
            }
        }
        // 处理文件末尾的引用块
        if (inQuoteBlock && quoteContent.length > 0) {
            const processedQuote = this.processQuoteBlock(quoteContent);
            convertedLines.push(...processedQuote);
        }
        return convertedLines.join('\n');
    }
    /**
     * 处理引用块内容
     */
    processQuoteBlock(quoteContent) {
        if (quoteContent.length === 0)
            return [];
        // 检查是否是警告框格式
        const firstLine = quoteContent[0];
        if (this.isAlertBox(firstLine)) {
            // 提取警告框中的实际内容
            const noteContent = firstLine.replace(/\*\*注意[：:]\*\*\s*/, '')
                .replace(/\*\*Note[：:]\*\*\s*/, '')
                .replace(/\*\*警告[：:]\*\*\s*/, '')
                .replace(/\*\*Warning[：:]\*\*\s*/, '')
                .replace(/\*\*错误[：:]\*\*\s*/, '')
                .replace(/\*\*Error[：:]\*\*\s*/, '');
            // 如果是警告框，转换为 VitePress 容器
            if (firstLine.includes('**注意') || firstLine.includes('**Note')) {
                return ['::: tip 注意', noteContent, ...quoteContent.slice(1), ':::'];
            }
            else if (firstLine.includes('**警告') || firstLine.includes('**Warning')) {
                return ['::: warning 警告', noteContent, ...quoteContent.slice(1), ':::'];
            }
            else if (firstLine.includes('**错误') || firstLine.includes('**Error')) {
                return ['::: danger 错误', noteContent, ...quoteContent.slice(1), ':::'];
            }
        }
        // 普通引用块转换为 info 容器
        return ['::: info', ...quoteContent, ':::'];
    }
    /**
     * 检查是否为警告框格式
     */
    isAlertBox(line) {
        const alertPatterns = [
            /\*\*注意[：:]\*\*/,
            /\*\*警告[：:]\*\*/,
            /\*\*错误[：:]\*\*/,
            /\*\*Note[：:]\*\*/,
            /\*\*Warning[：:]\*\*/,
            /\*\*Error[：:]\*\*/,
        ];
        return alertPatterns.some((pattern) => pattern.test(line));
    }
}
//# sourceMappingURL=quote-blocks.js.map