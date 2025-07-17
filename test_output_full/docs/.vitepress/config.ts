import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Test Documentation',
  description: 'A test documentation site',
  lang: 'zh-CN',
  markdown: {
    math: true
  },
  themeConfig: {
    sidebar: [
      {
        text: 'Introduction',
        link: '/README'
      },
      {
        text: 'Getting Started',
        link: '/getting-started',
        items: [
          {
            text: 'Installation',
            link: '/installation'
          },
          {
            text: 'Configuration',
            link: '/configuration'
          }
        ],
        collapsed: false
      },
      {
        text: 'Advanced Topics',
        link: '/advanced/index',
        items: [
          {
            text: 'Custom Themes',
            link: '/advanced/themes'
          },
          {
            text: 'Plugins',
            link: '/advanced/plugins'
          }
        ],
        collapsed: false
      },
      {
        text: 'FAQ',
        link: '/faq'
      }
    ],
    nav: [
      {
        text: '首页',
        link: '/'
      },
      {
        text: '指南',
        link: '/README'
      }
    ]
  }
})
