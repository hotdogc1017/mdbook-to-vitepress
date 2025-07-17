/**
 * 解析代码块信息
 * @param info 代码块信息字符串，如 "rust,editable"
 * @returns 解析后的代码块信息对象
 */
export function parseCodeBlockInfo(info) {
    const parts = info.trim().split(',');
    return {
        language: parts[0] || '',
        options: parts.slice(1)
    };
}
//# sourceMappingURL=types.js.map