import fs from "node:fs";
import type { MdBookConfig } from "../types";
import { DefaultTheme } from "vitepress/theme";

type Chapter = {
  _level: number;
  items: Chapter[];
} & DefaultTheme.SidebarItem

function parseSummary(config: MdBookConfig): DefaultTheme.SidebarItem[] {
  const summaryPath = config.book.src;
  if (!fs.existsSync(summaryPath)) {
    console.warn("未找到 SUMMARY.md");
    return [];
  }
  try {
    const summaryContent = fs.readFileSync(summaryPath, "utf-8");
    return extractChaptersToSidebar(summaryContent);
  } catch (error) {
    console.error("解析 SUMMARY.md 时出错:", error);
    return [];
  }
}

function extractChaptersToSidebar(summaryContent: string) {
  const parsedChapters = summaryContent.split("\n").filter(isChapter).map(statChapter)
  if (parsedChapters.length === 0) 
    return []

  const group = (chapters: Chapter[]) => {
    // 如果每个level都相同，则直接返回
    if (Array.from(new Set(chapters.map(({ _level }) => _level))).length === 1) {
      return chapters.map(({items, ...rest}) => rest)
    }
    const minLevel = Math.min(...chapters.map(({ _level }) => _level))
    const flatChapters: Chapter[] = []
    let currentChapter: Chapter | undefined
    for (const chapter of chapters) {
      if (chapter._level === minLevel) {
        currentChapter = chapter
        flatChapters.push(chapter)
      } else {
        currentChapter?.items.push(chapter)
      }
    }

    flatChapters.map((chapter) => {
      return {
        ...chapter,
        items: group(chapter.items)
      }
    })

    return flatChapters
  }

  return group(parsedChapters)
}


function statChapter(chapter: string): Chapter {
  if (!isChapter(chapter)) {
    throw new Error(`${chapter} 不是一个章节`)
  }
  const [_, text, link] = chapter.match(/\[([^\]]+)\]\(([^)]*)\)/) ?? [];
  return {
    _level: chapter.match(/^\s*/g)?.[0]?.length ?? 0,
    text, 
    link,
    items: []
  }
}

function isChapter(input: string) {
  return /^\s*(\-\s)?\[[\s\S]+\]\([\s\S]*\)$/.test(input)
}

function isSeparator(input: string) {
  return /\-{3,}/.test(input)
}

export type { Chapter }
export { parseSummary, extractChaptersToSidebar, statChapter, isChapter, isSeparator }