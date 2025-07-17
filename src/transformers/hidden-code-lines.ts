import { MarkdownTransformer } from './types';

/**
 * 隐藏代码行转换器
 * 将 mdBook 的隐藏代码行语法转换为 VitePress 兼容的格式
 * 
 * mdBook: # 这是隐藏的代码行
 * VitePress: // 这是隐藏的代码行
 * 
 * 注意：目前仅支持默认的 # 前缀，暂不支持以下功能：
 * 1. 全局自定义隐藏前缀 (book.toml 中的 hide-code-lines-prefix 配置)
 * 2. 局部自定义隐藏前缀 (```rust,prefix_lines=// 语法)
 * 
 * 这些功能将在未来版本中添加。
 */
export class HiddenCodeLinesTransformer implements MarkdownTransformer {
  name = 'hiddenCodeLines';
  description = '将 mdBook 的隐藏代码行语法转换为注释，仅支持默认的 # 前缀';

  transform(content: string): string {
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
  
  transformLine(line: string): string {
    // 注意：这个方法只应该在确定当前行在代码块内时调用
    if (line.trim().startsWith('#') && !line.trim().startsWith('#!')) {
      return '// ' + line.trim().substring(1);
    }
    return line;
  }
}