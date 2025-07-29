import { defineConfig, type MarkdownEnv } from "vitepress";
import { mdBookPlugin } from "markdown-it-mdbook";
import path from "node:path";

const bookConfig = "__@bookConfig__";

export default defineConfig({
  title: "__@title__",
  description: "__@description__",
  lang: "__@lang__",
  locales: {
    root: {
      label: "",
      lang: "__@lang__",
    },
    "__@lang__": {
      label: "",
      lang: "__@lang__",
      link: "/__#lang__/",
    },
  },
  rewrites: {
    "__#baseUrl__/index.md": "__#lang__/index.md",
    "__#baseUrl__/title-page.md": "__#lang__/index.md",
    "__#baseUrl__/:path": "__#lang__/:path",
  },
  markdown: {
    config(md) {
      md.use(mdBookPlugin, {
        // @ts-expect-error
        ...bookConfig,
        getRelatedPath: (env: MarkdownEnv) => {
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
