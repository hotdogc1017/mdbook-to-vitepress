import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import util from "node:util";
import pc from "picocolors";
import {
  parseBookToml,
  DEFAULT_BOOK_CONFIG,
  type BookConfig,
} from "@/utils/bookToml";
import { parseSummaryMd } from "@/utils/summaryMd";
import deepmerge from "deepmerge";

interface MigrationOptions {
  /**
   * Including files directory, which based on the mdbook project directory
   */
  includingFilesDir?: string;
}

const cwd = process.cwd();

export function migrate(
  destPath: string,
  sourcePath: string,
  options?: MigrationOptions,
): void {
  if (!destPath) {
    console.log(pc.red("Destination path is required"));
    process.exit(1);
  }
  const resolvedDestPath = path.resolve(cwd, destPath);
  const resolvedSourcePath = sourcePath ? path.resolve(cwd, sourcePath) : cwd;

  if (!fs.existsSync(resolvedSourcePath)) {
    console.log(pc.red(`Source path ${sourcePath} does not exist`));
    process.exit(1);
  }

  const bookConfig = deepmerge(DEFAULT_BOOK_CONFIG, parseBookToml(sourcePath));

  const templatePath = path.resolve(
    import.meta.dirname,
    "..",
    "template-vitepress",
  );

  const LANG = bookConfig?.book?.language ?? "en";

  // Set the destination directory where the source files are located
  // By default, it is configured with an i18n structure
  const destSrcPath = path.join(LANG, bookConfig?.book?.src);

  const complileTemplateConfig = (content: string) => {
    const baseUrl = `${destSrcPath}`;
    const config = { ...(bookConfig ?? {}), ...DEFAULT_BOOK_CONFIG };
    const mapping = {
      bookConfig: config,
      title: config?.book?.title,
      description: config?.book?.description,
      lang: LANG,
      baseUrl,
      sidebar: parseSummaryMd(
        path.resolve(resolvedSourcePath, bookConfig?.book?.src),
        LANG,
      ),
    };
    const lines = content.split("\n");
    return lines
      .filter((line) => !/\s*\/\/ @ts-expect-error\s*/.test(line))
      .map((line) => fillRegion(line, mapping))
      .map((line) => fillRegionWithString(line, mapping))
      .join("\n");
  };

  // Copy the template-vitepress directory and compile configuration file
  copyDir(
    templatePath,
    resolvedDestPath,
    (filepath: string, _destpath: string) => {
      if (/\.vitepress\/config\.ts$/.test(filepath)) {
        const content = complileTemplateConfig(
          fs.readFileSync(filepath, { encoding: "utf-8" }),
        );
        fs.writeFileSync(_destpath, content);
      } else {
        fs.copyFileSync(filepath, _destpath);
      }
    },
  );

  // Copy source files
  copyDir(
    path.resolve(resolvedSourcePath, bookConfig.book.src),
    // Keep the original directory structure
    path.resolve(resolvedDestPath, destSrcPath),
    (filepath: string, _destpath: string) => {
      const content = fs.readFileSync(filepath, { encoding: "utf-8" });
      const RE = /src=\"([^\"]*)/g;
      if (RE.test(content)) {
        const replacedContent = content.replace(RE, (entire, url) => {
          if (!/^\.?\//.test(url)) {
            return `src="./${url}`;
          } else {
            return entire;
          }
        });
        fs.writeFileSync(_destpath, replacedContent, { encoding: "utf-8" });
      } else {
        fs.copyFileSync(filepath, _destpath);
      }
    },
  );

  const includingFilesDir = options?.includingFilesDir;
  if (includingFilesDir) {
    copyDir(
      path.resolve(resolvedSourcePath, includingFilesDir),
      path.resolve(resolvedDestPath, destSrcPath, "..", includingFilesDir),
      (filepath: string, _destpath: string) => {
        fs.copyFileSync(filepath, _destpath);
      },
    );
  }
}

function copyDir(
  filepath: string,
  _destpath: string,
  copyCallback: (filepath: string, _destpath: string) => void,
) {
  const stat = fs.statSync(filepath);
  if (stat.isDirectory()) {
    if (!fs.existsSync(_destpath)) {
      fs.mkdirSync(_destpath, { recursive: true });
    }

    const children = fs.readdirSync(filepath, {
      encoding: "utf-8",
    });
    for (const child of children) {
      const destFullpath = path.resolve(_destpath, child);
      const fullpath = path.resolve(filepath, child);
      const stat = fs.statSync(fullpath);
      if (stat.isDirectory()) {
        copyDir(fullpath, destFullpath, copyCallback);
      } else {
        copyCallback(fullpath, destFullpath);
      }
    }
  } else {
    copyCallback(filepath, _destpath);
  }
}

// For object
function fillRegion(input: string, regionMapping: Record<string, any> = {}) {
  const RE = /\"__@([a-zA-Z0-9]*)__\"/g;
  const [, region] = RE.exec(input) || [];

  let result = input;
  if (Object.keys(regionMapping).includes(region)) {
    result = input.replace(RE, (_, region) => {
      return util.inspect(regionMapping[region], { depth: null });
    });
  }

  return result;
}

// For string
function fillRegionWithString(
  input: string,
  regionMapping: Record<string, any> = {},
) {
  const RE = /__#([a-zA-Z0-9]*)__/g;
  const [, region] = RE.exec(input) || [];

  let result = input;
  if (Object.keys(regionMapping).includes(region)) {
    result = input.replace(RE, (_, region) => {
      return regionMapping[region];
    });
  }

  return result;
}
