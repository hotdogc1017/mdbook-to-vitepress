import { defineConfig, type MarkdownEnv } from "vitepress";
import { mdBookPlugin } from "markdown-it-mdbook";
import path from "node:path";

const bookConfig = "__@bookConfig__";

export default defineConfig({
  title: "__@title__",
  description: "__@description__",
  lang: "__@lang__",
  markdown: {
    config(md) {
      md.use(mdBookPlugin, {
        // @ts-expect-error
        ...bookConfig,
        getRelativePath: (env: MarkdownEnv) => {
          const { realPath, path: _path } = env;
          return path.dirname(realPath ?? _path);
        },
      });
    },
  },
  themeConfig: {
    // @ts-expect-error
    sidebar: "__@sidebar__",
  },
});
