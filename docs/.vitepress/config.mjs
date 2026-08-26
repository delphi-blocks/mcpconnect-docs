import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MCPConnect",
  description: "MCPConnect documentation web site",
  lastUpdated: true,
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo-white-square.png",
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/introduction' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Installation', link: '/installation' },
          { text: 'Server Setup', link: '/server-setup' },
          { text: 'Connecting LLM Clients', link: '/clients' },
          { text: 'Testing', link: '/testing' }
        ]
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'Plugin System', link: '/plugins' },
          { text: 'Tools', link: '/tools' },
          { text: 'Resources', link: '/resources' },
          { text: 'Serialization', link: '/serialization' },
          { text: 'Memory Management', link: '/memory' },
          { text: 'Sessions', link: '/sessions' }
        ]
      },
      {
        text: 'Security',
        items: [
          { text: 'CORS & API-Key', link: '/authentication' },
          { text: 'OAuth 2.1', link: '/oauth' }
        ]
      },
      {
        text: 'Advanced',
        items: [
          { text: 'JSON-RPC', link: '/jrpc' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/delphi-blocks/MCPConnect' }
    ]
  }
})
