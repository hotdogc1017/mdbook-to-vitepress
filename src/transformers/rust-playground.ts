import { CodeBlockInfo, MarkdownTransformer, parseCodeBlockInfo } from './types';

/**
 * Rust Playground 集成转换器
 * 将 mdBook 的 Rust Playground 语法转换为 VitePress 兼容的格式
 * 
 * mdBook: ```rust,editable 或 ```rust,noplayground
 * VitePress: ```rust
 */
export class RustPlaygroundTransformer implements MarkdownTransformer {
  name = 'rustPlayground';
  description = '将 mdBook 的 Rust Playground 语法转换为标准代码块';

  transform(content: string): string {
    const lines = content.split('\n');
    const transformedLines: string[] = [];
    let inCodeBlock = false;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // 检查是否是代码块开始
      if (line.trim().startsWith('```') && !inCodeBlock) {
        inCodeBlock = true;
        
        // 提取代码块信息
        const infoString = line.trim().substring(3).trim();
        if (infoString) {
          const info = parseCodeBlockInfo(infoString);
          
          // 处理 Rust Playground 选项
          if (info.language === 'rust' && 
              (info.options.includes('editable') || 
               info.options.includes('noplayground') || 
               info.options.includes('ignore'))) {
            // 移除 mdBook 特有的标记，保留 rust 语言标记
            line = '```rust';
          }
        }
      } 
      // 检查是否是代码块结束
      else if (line.trim() === '```' && inCodeBlock) {
        inCodeBlock = false;
      }
      
      transformedLines.push(line);
    }
    
    return transformedLines.join('\n');
  }
}