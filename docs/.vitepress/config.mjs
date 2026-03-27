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
        text: 'Guides',
        items: [
          { text: 'Introduction', link: '/introduction' },
          { text: 'Installation', link: '/installation' },
          { text: 'Server Setup', link: '/server-setup' },
          { text: 'Tools', link: '/tools' },
          { text: 'Serialization', link: '/serialization' },
          { text: 'Memory Management', link: '/memory' },
          { text: 'Sessions', link: '/sessions' },
          { text: 'Authentication', link: '/authentication' },
          { text: 'Resources', link: '/resources' },
          { text: 'Connecting LLM Clients', link: '/clients' },
          { text: 'Testing', link: '/testing' },
          { text: 'JSON-RPC', link: '/jrpc' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/delphi-blocks/MCPConnect' }
    ]
  }
})
