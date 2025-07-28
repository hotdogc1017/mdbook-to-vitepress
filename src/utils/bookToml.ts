import path from "node:path";
import fs from "node:fs";
import process from "node:process";
import { parseTOML } from "confbox";

export const DEFAULT_BOOK_CONFIG: BookConfig = {
  book: {
    src: "src",
    language: "en",
  },
};

export function parseBookToml(basePath?: string): BookConfig {
  let bookConfig = DEFAULT_BOOK_CONFIG;
  const bookTomlPath = findBookTomlPath(basePath);

  if (bookTomlPath) {
    const bookTomlContent = fs.readFileSync(bookTomlPath, {
      encoding: "utf-8",
    });
    bookConfig = parseTOML(bookTomlContent);
  }

  return bookConfig;
}

export function findBookTomlPath(destPath?: string): string | undefined {
  destPath ??= process.cwd();
  const tomlPath = path.resolve(destPath, "book.toml");
  if (fs.existsSync(tomlPath)) {
    return tomlPath;
  }
  let bookTomlPath: string | undefined;
  for (const file of fs.readdirSync(destPath)) {
    const fileState = fs.statSync(path.join(destPath, file));
    if (!fileState.isDirectory()) {
      continue;
    }
    const targetPath = findBookTomlPath(path.resolve(destPath, file));
    if (!targetPath) {
      continue;
    } else {
      bookTomlPath = targetPath;
    }
  }

  return bookTomlPath;
}

export function reverseFindBookTomlPath(destPath: string): string | undefined {
  if (destPath === process.cwd()) {
    throw new Error(`Not found the book.toml file`);
  }
  if (!path.isAbsolute(destPath)) {
    destPath = path.join(process.cwd(), destPath);
  }

  if (fs.existsSync(path.join(destPath, "book.toml"))) {
    return path.join(destPath, "book.toml");
  }

  const stat = fs.statSync(destPath);
  if (stat.isDirectory()) {
    return reverseFindBookTomlPath(path.join(destPath, ".."));
  } else {
    return reverseFindBookTomlPath(path.join(path.dirname(destPath), ".."));
  }
}

export interface BookConfig {
  book: {
    src: string;
    title?: string;
    authors?: string[];
    description?: string;
    language?: string;
    "text-direction"?: "ltr" | "rtl";
  };
  rust?: {
    edition?: "2015" | "2018" | "2021";
  };
  build?: {
    "build-dir"?: string;
    "create-missing"?: boolean;
    "use-default-preprocessors"?: boolean;
    "extra-watch-dirs"?: string[];
  };
  preprocessor?: {
    [key: string]: any;
  };
  output?: {
    html?: {
      "additional-css"?: string[];
      search?: {
        "limit-results"?: number;
      };
    };
  };
}
