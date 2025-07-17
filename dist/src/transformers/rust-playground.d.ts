import { MarkdownTransformer } from './types';
/**
 * Rust Playground 集成转换器
 * 将 mdBook 的 Rust Playground 语法转换为 VitePress 兼容的格式
 *
 * mdBook: ```rust,editable 或 ```rust,noplayground
 * VitePress: ```rust
 */
export declare class RustPlaygroundTransformer implements MarkdownTransformer {
    name: string;
    description: string;
    transform(content: string): string;
}
//# sourceMappingURL=rust-playground.d.ts.map