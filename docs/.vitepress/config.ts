import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'WytNet DevDoc',
  description: 'Complete Developer Documentation for WytNet Platform',
  
  ignoreDeadLinks: true,
  
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Core Concepts', link: '/en/core-concepts' },
          { text: 'Features', link: '/en/features/' },
          { text: 'Architecture', link: '/en/architecture/' },
          { text: 'API Reference', link: '/en/api/' },
          { text: 'Implementation', link: '/en/implementation/' }
        ],
        sidebar: {
          '/en/': [
            {
              text: 'Introduction',
              items: [
                { text: 'Platform Overview', link: '/en/overview' },
                { text: 'Core Concepts', link: '/en/core-concepts' }
              ]
            },
            {
              text: 'Features',
              items: [
                { text: 'WytPass Authentication', link: '/en/features/wytpass' },
                { text: 'User Registration & Panel', link: '/en/features/user-registration' },
                { text: 'WytWall', link: '/en/features/wytwall' },
                { text: 'MyWyt Apps', link: '/en/features/mywyt-apps' },
                { text: 'WytLife', link: '/en/features/wytlife' },
                { text: 'AI Directory', link: '/en/features/ai-directory' },
                { text: 'QR Generator', link: '/en/features/qr-generator' },
                { text: 'DISC Assessment', link: '/en/features/disc-assessment' }
              ]
            },
            {
              text: 'Architecture',
              items: [
                { text: 'System Overview', link: '/en/architecture/system-overview' },
                { text: 'Database Schema', link: '/en/architecture/database-schema' },
                { text: 'Multi-tenancy & RLS', link: '/en/architecture/multi-tenancy' },
                { text: 'Frontend Architecture', link: '/en/architecture/frontend' },
                { text: 'Backend Architecture', link: '/en/architecture/backend' },
                { text: 'RBAC System', link: '/en/architecture/rbac' }
              ]
            },
            {
              text: 'API Reference',
              items: [
                { text: 'Authentication APIs', link: '/en/api/authentication' },
                { text: 'User APIs', link: '/en/api/users' },
                { text: 'WytWall APIs', link: '/en/api/wytwall' },
                { text: 'Admin APIs', link: '/en/api/admin' }
              ]
            },
            {
              text: 'Implementation Guide',
              items: [
                { text: 'Replit Assistant Guide', link: '/en/implementation/replit-guide' }
              ]
            },
            {
              text: 'Admin Panels',
              items: [
                { text: 'Engine Admin Panel', link: '/en/admin/engine-admin' },
                { text: 'Hub Admin Panel', link: '/en/admin/hub-admin' }
              ]
            }
          ]
        }
      }
    },
    ta: {
      label: 'தமிழ்',
      lang: 'ta',
      themeConfig: {
        nav: [
          { text: 'முகப்பு', link: '/ta/' },
          { text: 'முக்கிய கருத்துக்கள்', link: '/ta/core-concepts' },
          { text: 'அம்சங்கள்', link: '/ta/features/' },
          { text: 'கட்டமைப்பு', link: '/ta/architecture/' },
          { text: 'API குறிப்பு', link: '/ta/api/' },
          { text: 'செயல்படுத்தல்', link: '/ta/implementation/' }
        ],
        sidebar: {
          '/ta/': [
            {
              text: 'அறிமுகம்',
              items: [
                { text: 'தளம் பற்றிய கண்ணோட்டம்', link: '/ta/overview' },
                { text: 'முக்கிய கருத்துக்கள்', link: '/ta/core-concepts' }
              ]
            },
            {
              text: 'அம்சங்கள்',
              items: [
                { text: 'WytPass அங்கீகாரம்', link: '/ta/features/wytpass' },
                { text: 'பயனர் பதிவு & பேனல்', link: '/ta/features/user-registration' },
                { text: 'WytWall', link: '/ta/features/wytwall' },
                { text: 'MyWyt Apps', link: '/ta/features/mywyt-apps' },
                { text: 'WytLife', link: '/ta/features/wytlife' },
                { text: 'AI Directory', link: '/ta/features/ai-directory' },
                { text: 'QR Generator', link: '/ta/features/qr-generator' },
                { text: 'DISC மதிப்பீடு', link: '/ta/features/disc-assessment' }
              ]
            },
            {
              text: 'கட்டமைப்பு',
              items: [
                { text: 'அமைப்பு கண்ணோட்டம்', link: '/ta/architecture/system-overview' },
                { text: 'தரவுத்தள Schema', link: '/ta/architecture/database-schema' },
                { text: 'Multi-tenancy & RLS', link: '/ta/architecture/multi-tenancy' },
                { text: 'Frontend கட்டமைப்பு', link: '/ta/architecture/frontend' },
                { text: 'Backend கட்டமைப்பு', link: '/ta/architecture/backend' },
                { text: 'RBAC அமைப்பு', link: '/ta/architecture/rbac' }
              ]
            },
            {
              text: 'API குறிப்பு',
              items: [
                { text: 'அங்கீகார APIs', link: '/ta/api/authentication' },
                { text: 'பயனர் APIs', link: '/ta/api/users' },
                { text: 'WytWall APIs', link: '/ta/api/wytwall' },
                { text: 'நிர்வாக APIs', link: '/ta/api/admin' }
              ]
            },
            {
              text: 'செயல்படுத்தல் வழிகாட்டி',
              items: [
                { text: 'Replit Assistant வழிகாட்டி', link: '/ta/implementation/replit-guide' }
              ]
            },
            {
              text: 'நிர்வாக பேனல்கள்',
              items: [
                { text: 'Engine நிர்வாக பேனல்', link: '/ta/admin/engine-admin' },
                { text: 'Hub நிர்வாக பேனல்', link: '/ta/admin/hub-admin' }
              ]
            }
          ]
        }
      }
    }
  },

  themeConfig: {
    logo: '/wytnet-logo.png',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/wytnet' }
    ],
    search: {
      provider: 'local'
    }
  },

  markdown: {
    config: (md) => {
      // Mermaid diagrams are automatically supported in VitePress markdown
    }
  }
})
