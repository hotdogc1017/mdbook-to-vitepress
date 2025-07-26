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

interface MigrationOptions {}

const cwd = process.cwd();

export function migrate(
  sourcePath: string,
  destPath: string,
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

  const bookConfig = parseBookToml(sourcePath);

  const templatePath = path.resolve(
    import.meta.dirname,
    "..",
    "template-vitepress",
  );

  const complileTemplateConfig = (content: string) => {
    const mapping = {
      bookConfig,
      title: bookConfig.book.title,
      description: bookConfig.book.description,
      lang: bookConfig.book.language,
      sidebar: parseSummaryMd(resolvedSourcePath, bookConfig),
    };
    const lines = content.split("\n");
    return lines
      .filter((line) => !/\s*\/\/ @ts-expect-error\s*/.test(line))
      .map((line) => fillRegion(line, mapping))
      .join("\n");
  };

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

function fillRegion(input: string, regionMapping: Record<string, any> = {}) {
  const RE = /\"__@(.*)__\"/;
  const [, region] = RE.exec(input) || [];

  let result = input;
  if (Object.keys(regionMapping).includes(region)) {
    result = input.replace(
      RE,
      util.inspect(regionMapping[region], { depth: null }),
    );
  }

  return result;
}
