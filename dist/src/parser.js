import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseToml } from './toml-parser.js';
export class MdBookParser {
    sourcePath;
    constructor(sourcePath) {
        this.sourcePath = sourcePath;
    }
    parseConfig() {
        const configPath = join(this.sourcePath, 'book.toml');
        if (!existsSync(configPath)) {
            console.warn('未找到 book.toml，使用默认配置');
            return this.getDefaultConfig();
        }
        try {
            const configContent = readFileSync(configPath, 'utf-8');
            return parseToml(configContent);
        }
        catch (error) {
            console.error('解析 book.toml 时出错:', error);
            return this.getDefaultConfig();
        }
    }
    parseSummary() {
        const summaryPath = join(this.sourcePath, 'src', 'SUMMARY.md');
        if (!existsSync(summaryPath)) {
            console.warn('未找到 SUMMARY.md');
            return [];
        }
        try {
            const summaryContent = readFileSync(summaryPath, 'utf-8');
            return this.extractChaptersWithStructure(summaryContent);
        }
        catch (error) {
            console.error('解析 SUMMARY.md 时出错:', error);
            return [];
        }
    }
    getDefaultConfig() {
        return {
            book: {
                title: '文档',
                src: 'src'
            }
        };
    }
    extractChaptersWithStructure(summaryContent) {
        const chapters = [];
        const lines = summaryContent.split('\n');
        // 用于构建嵌套结构
        const stack = [{ items: chapters, level: 0 }];
        for (const line of lines) {
            // 跳过空行
            if (!line.trim())
                continue;
            // 计算缩进级别（每个缩进算作2个空格）
            const indentMatch = line.match(/^(\s*)/);
            const indent = indentMatch ? indentMatch[1].length : 0;
            const level = Math.floor(indent / 2) + 1; // 从1开始计数
            // 提取链接和标题
            const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (match) {
                const title = match[1];
                const link = match[2];
                // 创建章节对象
                const chapter = {
                    title,
                    link,
                    level,
                    items: []
                };
                // 找到合适的父级
                while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }
                // 添加到父级的 items 中
                stack[stack.length - 1].items.push(chapter);
                // 将当前章节作为可能的父级
                stack.push({ items: chapter.items, level });
            }
        }
        return chapters;
    }
}
//# sourceMappingURL=parser.js.map