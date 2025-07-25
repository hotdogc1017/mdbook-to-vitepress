import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import util from "node:util";
import {
  parseBookToml,
  DEFAULT_BOOK_CONFIG,
  type BookConfig,
} from "@/utils/bookToml";
import { buildVitepressConfig } from "@/utils/vitepress";

interface MigrationOptions {}

const cwd = process.cwd();

export function migrate(
  destPath: string,
  sourcePath?: string,
  options?: MigrationOptions,
): void {
  if (!destPath) {
    console.error("Destination path is required");
    process.exit(1);
  }
  const resolvedDestPath = path.resolve(cwd, destPath);
  const resolvedSourcePath = sourcePath ? path.resolve(cwd, sourcePath) : cwd;
  if (!fs.existsSync(resolvedSourcePath)) {
    console.error(`Source path ${sourcePath} does not exist`);
    process.exit(1);
  }
  const bookConfig = parseBookToml(sourcePath);
  createVitepressStructure(resolvedDestPath, {
    bookConfig,
    isResolvedDestPath: true,
  });
}

/**
 * 创建一个基本的vitepress项目结构，包括：
 * - 配置文件。位于`.vitepress/config.ts`或者`.vitepress/config.js`
 * - package.json文件
 *
 * 如果目标目录已存在vitepress结构，则会跳过创建过程。
 */
function createVitepressStructure(
  destPath: string,
  options?: {
    bookConfig?: BookConfig;
    isResolvedDestPath?: boolean;
    useTypescript?: boolean;
  },
) {
  const {
    isResolvedDestPath = false,
    bookConfig = DEFAULT_BOOK_CONFIG,
    useTypescript = true,
  } = options || {};
  !isResolvedDestPath && (destPath = path.resolve(cwd, destPath));

  const updateConfig = () => {
    const configPath = path.join(
      destPath,
      `.vitepress/config.${useTypescript ? "ts" : "js"}`,
    );
    // 如果配置文件已存在，则跳过创建过程
    if (fs.existsSync(configPath)) return;
    fs.mkdirSync(path.join(destPath, ".vitepress"), { recursive: true });
    const config = buildVitepressConfig(bookConfig);
    const configTemplate = `export default ${util.inspect(config, { compact: false })}`;
    fs.writeFileSync(configPath, configTemplate);
  };

  // 如果目标目录已经存在package.json，则跳过
  // TODO: 考虑在原有package.json的基础上更新内容，但会引入额外的复杂性
  const updatePackageJson = () => {
    if (fs.existsSync(path.join(destPath, "package.json"))) return;
    const packageJson = {
      name: bookConfig.book.title,
      scripts: {
        dev: "vitepress dev",
        build: "vitepress build",
        preview: "vitepress preview",
      },
      dependencies: {
        vitepress: "latest",
        "markdown-it-mdbook": "latest",
      },
    };
    fs.writeFileSync(destPath, JSON.stringify(packageJson));
  };

  updateConfig();
  updatePackageJson();
}
