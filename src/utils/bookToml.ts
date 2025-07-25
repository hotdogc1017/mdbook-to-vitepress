import path from "node:path";
import fs from "node:fs";
import process from "node:process";
import { parseTOML } from "confbox";

export const DEFAULT_BOOK_CONFIG: BookConfig = {
  book: {
    title: "文档",
    src: "src",
  },
};

/**
 * 从`book.toml`中解析配置。
 * @param basePath `book.toml`所在目录。如果未指定，解析器将尝试向下遍历文件树，并查找离当前工作目录最近的`book.toml`
 */
export function parseBookToml(basePath?: string): BookConfig {
  let bookConfig = DEFAULT_BOOK_CONFIG;
  const bookTomlPath = findBookTomlPath(basePath);
  if (bookTomlPath) {
    const bookTomlContent = fs.readFileSync(bookTomlPath, {
      encoding: "utf-8",
    });
    bookConfig = parseTOML(bookTomlContent);
  }

  bookConfig.book.src = path.join(
    process.cwd(),
    bookConfig.book.src ?? DEFAULT_BOOK_CONFIG.book.src,
  );
  return bookConfig;
}

export function findBookTomlPath(destPath?: string): string | undefined {
  destPath ??= process.cwd();
  // 如果当前目录下已存在book.toml文件则直接返回
  if (fs.existsSync(path.join(destPath, "book.toml"))) {
    return path.join(destPath, "book.toml");
  }
  let bookTomlPath: string | undefined;
  for (const file of fs.readdirSync(destPath)) {
    const fileState = fs.statSync(path.join(destPath, file));
    if (!fileState.isDirectory()) {
      continue;
    }
    const targetPath = findBookTomlPath(path.join(destPath, file));
    if (!targetPath) {
      continue;
    } else {
      bookTomlPath = targetPath;
    }
  }
  return bookTomlPath;
}

/**
 * 从指定路径开始，向上递归查找 `book.toml` 文件。
 */
export function reverseFindBookTomlPath(destPath: string): string | undefined {
  if (destPath === process.cwd()) {
    throw new Error(`无法找到book.toml文件`);
  }
  if (!path.isAbsolute(destPath)) {
    destPath = path.join(process.cwd(), destPath);
  }
  // 如果当前目录下已存在book.toml文件则直接返回
  if (fs.existsSync(path.join(destPath, "book.toml"))) {
    return path.join(destPath, "book.toml");
  }

  // 返回上级目录继续查找，若没有找到，则递归
  const stat = fs.statSync(destPath);
  if (stat.isDirectory()) {
    return reverseFindBookTomlPath(path.join(destPath, ".."));
  } else {
    return reverseFindBookTomlPath(path.join(path.dirname(destPath), ".."));
  }
}

export interface BookConfig {
  /**
   * 元数据
   */
  book: {
    /**
     * 源文件目录，默认为 "src"，在解析时会转换为绝对路径。
     */
    src: string;
    title?: string;
    authors?: string[];
    /**
     * 对书籍的描述，会在每一页的 html <head> 元信息中添加
     */
    description?: string;
    /**
     * 这也用于推断文本的方向（从右到左、从左到右）在书籍中的方向。
     */
    language?: string;
    /**
     * [暂不支持]
     */
    "text-direction"?: "ltr" | "rtl";
  };
  /**
   * [暂不支持]
   * Rust 相关的配置
   */
  rust?: {
    /**
     * 默认值为 "2015" 。单个代码块可以通过 edition2015 、 edition2018 、 edition2021 或 edition2024 注释进行控制。
     * @example
     * ```rust,edition2015
     * // This only works in 2015.
     *let try = true;
     * ```
     */
    edition?: "2015" | "2018" | "2021";
  };
  /**
   * [暂不支持] 如果启用此选项，可能会在用户不知情的情况下构建vitepress时出现意料之外的效果。
   * TODO: 考虑以命令行参数的方式或者通过其他配置来控制该行为。
   * 控制书籍的构建过程。
   */
  build?: {
    /**
     * 构建输出目录，默认为 "book"
     */
    "build-dir"?: string;
    /**
     * 是否自动创建 SUMMARY.md 中缺失的文件，默认为 true
     */
    "create-missing"?: boolean;
    /**
     * 是否使用默认的预处理器，默认为 true
     */
    "use-default-preprocessors"?: boolean;
    /**
     * 额外的需要监视变化的目录列表
     */
    "extra-watch-dirs"?: string[];
  };
  /**
   * [暂不支持]
   * 预处理器配置
   */
  preprocessor?: {
    [key: string]: any;
  };
  /**
   * [暂不支持]
   * 输出格式的配置
   */
  output?: {
    /**
     * HTML 输出的配置
     */
    html?: {
      /**
       * 额外的 CSS 文件列表
       */
      "additional-css"?: string[];
      /**
       * 搜索功能的配置
       * @deprecated vitepress内置
       */
      search?: {
        /**
         * 限制搜索结果的数量
         */
        "limit-results"?: number;
      };
    };
  };
}
