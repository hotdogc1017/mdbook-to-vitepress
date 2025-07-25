import { parseSummaryMd } from "./summaryMd";
import { mdBookPlugin } from "markdown-it-mdbook";
import path from "node:path";
import { type BookConfig } from "./bookToml";
import type { UserConfig, DefaultTheme, MarkdownEnv } from "vitepress";

export type VitepressConfig = UserConfig<DefaultTheme.Config>;
export type VitepressSidebar = DefaultTheme.Sidebar;
export type VitepressSidebarItem = DefaultTheme.SidebarItem;

export function buildVitepressConfig(bookConfig: BookConfig): VitepressConfig {
  const vitepressConfig: VitepressConfig = {
    title: bookConfig.book.title,
    description: bookConfig.book.description,
    lang: bookConfig.book.language,
    markdown: {
      config(md) {
        md.use(mdBookPlugin, {
          ...bookConfig,
          getRelativePath: (env: MarkdownEnv) => {
            const { realPath, path: _path } = env;
            return path.dirname(realPath ?? _path);
          },
        });
      },
    },
    themeConfig: {
      sidebar: parseSummaryMd(bookConfig),
    },
  };
  return vitepressConfig;
}
