import fs from "node:fs";
import path from "node:path";
import type { UserConfig, DefaultTheme } from "vitepress";

export type VitepressConfig = UserConfig<DefaultTheme.Config>;
export type VitepressSidebar = DefaultTheme.Sidebar;
export type VitepressSidebarItem = DefaultTheme.SidebarItem;

export type Chapter = {
  _level: number;
  items: Chapter[];
} & VitepressSidebarItem;

export function parseSummaryMd(
  sourcePath: string,
  baseDir?: string,
): VitepressSidebar {
  baseDir ??= "";
  const summaryPath = path.resolve(sourcePath, "SUMMARY.md");

  if (!fs.existsSync(summaryPath)) {
    console.warn("Not found SUMMARY.md");
    return [];
  }
  try {
    const summaryContent = fs.readFileSync(summaryPath, "utf-8");
    return extractChaptersToSidebar(summaryContent, baseDir);
  } catch (error) {
    console.error("Error parsing SUMMARY.md:", error);
    return [];
  }
}

export function extractChaptersToSidebar(
  summaryContent: string,
  baseDir: string,
) {
  const parsedChapters = summaryContent
    .split("\n")
    .filter(isChapter)
    .map(statChapter);
  if (parsedChapters.length === 0) return [];

  const group = (chapters: Chapter[]) => {
    // if each level is the same, return the chapters
    if (
      Array.from(new Set(chapters.map(({ _level }) => _level))).length === 1
    ) {
      return chapters.map(({ items, _level, ...rest }) => ({
        ...rest,
        link: baseDir ? `${baseDir}/${rest.link}` : rest.link,
      }));
    }
    const minLevel = Math.min(...chapters.map(({ _level }) => _level));
    let flatChapters: Chapter[] = [];
    let currentChapter: Chapter | undefined;
    for (const chapter of chapters) {
      if (chapter._level === minLevel) {
        currentChapter = chapter;
        flatChapters.push(chapter);
      } else {
        currentChapter?.items.push(chapter);
      }
    }

    // @ts-ignore
    flatChapters = flatChapters.map((chapter) => {
      const { _level, ...rest } = chapter;
      return {
        ...rest,
        link: baseDir ? `${baseDir}/${rest.link}` : rest.link,
        items: group(chapter.items),
      };
    });

    return flatChapters;
  };

  return group(parsedChapters);
}

export function statChapter(chapter: string): Chapter {
  if (!isChapter(chapter)) {
    throw new Error(`${chapter} is not a chapter`);
  }
  const [_, text, link] = chapter.match(/\[([^\]]+)\]\(([^)]*)\)/) ?? [];
  return {
    _level: chapter.match(/^\s*/g)?.[0]?.length ?? 0,
    text,
    link,
    items: [],
  };
}

export function isChapter(input: string) {
  return /^\s*(\-\s)?\[[\s\S]+\]\([\s\S]*\)$/.test(input);
}

export function isSeparator(input: string) {
  return /\-{3,}/.test(input);
}
