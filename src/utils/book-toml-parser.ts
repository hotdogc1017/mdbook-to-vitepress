import path from "node:path";
import fs from "node:fs";
import process from "node:process";
import { parseTOML } from "confbox"
import type { MdBookConfig } from "../types"

const DEFAULT_BOOK_CONFIG = {
  book: {
    title: '文档',
    src: 'src'
  }
}

/**
 * 从`book.toml`中解析配置。
 * @param basePath `book.toml`所在目录。如果未指定，解析器将尝试向下遍历文件树，并查找离当前工作目录最近的`book.toml`
 */
export function parseBookToml(basePath?: string): MdBookConfig {
  let bookConfig = DEFAULT_BOOK_CONFIG;
  const bookTomlPath = findBookTomlPath(basePath)
  if (bookTomlPath) {
    const bookTomlContent = fs.readFileSync(bookTomlPath, { encoding: "utf-8" })
    bookConfig = parseTOML(bookTomlContent)
  }

  bookConfig.book.src = path.join(process.cwd(), bookConfig.book.src ?? DEFAULT_BOOK_CONFIG.book.src)
  return bookConfig
}

export function findBookTomlPath(destPath?: string): string | undefined {
  destPath ??= process.cwd();
  // 如果当前目录下已存在book.toml文件则直接返回
  if (fs.existsSync(path.join(destPath, "book.toml"))) {
    return path.join(destPath, "book.toml");
  }
  let bookTomlPath: string | undefined
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
  return bookTomlPath
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
