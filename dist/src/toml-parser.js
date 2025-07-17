// 用于基本 mdbook 配置的简单 TOML 解析器
export function parse(tomlContent) {
    const result = {};
    const lines = tomlContent.split('\n');
    let currentSection = result;
    for (let line of lines) {
        line = line.trim();
        // 跳过空行和注释
        if (!line || line.startsWith('#')) {
            continue;
        }
        // 处理节 [section.name]
        const sectionMatch = line.match(/^\[([^\]]+)\]$/);
        if (sectionMatch) {
            const sectionPath = sectionMatch[1].split('.');
            currentSection = result;
            for (const part of sectionPath) {
                if (!currentSection[part]) {
                    currentSection[part] = {};
                }
                currentSection = currentSection[part];
            }
            continue;
        }
        // 处理键值对
        const kvMatch = line.match(/^([^=]+)=(.+)$/);
        if (kvMatch) {
            const key = kvMatch[1].trim();
            let value = kvMatch[2].trim();
            // 移除引号
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            // 处理数组
            if (value.startsWith('[') && value.endsWith(']')) {
                const arrayContent = value.slice(1, -1);
                if (arrayContent.trim()) {
                    value = arrayContent.split(',').map((item) => {
                        item = item.trim();
                        if ((item.startsWith('"') && item.endsWith('"')) ||
                            (item.startsWith("'") && item.endsWith("'"))) {
                            return item.slice(1, -1);
                        }
                        return item;
                    });
                }
                else {
                    value = [];
                }
            }
            // 处理布尔值
            if (value === 'true')
                value = true;
            if (value === 'false')
                value = false;
            currentSection[key] = value;
        }
    }
    return result;
}
//# sourceMappingURL=toml-parser.js.map