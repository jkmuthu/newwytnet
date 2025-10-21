import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'WytNet DevDoc',
  description: 'Complete Developer Documentation for WytNet Platform',
  
  base: '/devdoc/',
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/devdoc/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/devdoc/wytnet-logo.png' }]
  ],
  
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Core Concepts', link: '/en/core-concepts' },
          { text: 'WytApps', link: '/en/wytapps/' },
          { text: 'WytSuites', link: '/en/wytsuites/' },
          { text: 'WytModules', link: '/en/wytmodules/' },
          { text: 'Architecture', link: '/en/architecture/' },
          { text: 'API Reference', link: '/en/api/' }
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
              text: 'Platform Foundation',
              collapsed: true,
              items: [
                { text: 'WytPass Authentication', link: '/en/architecture/rbac#wytpass-authentication' },
                { text: 'RBAC & Permissions', link: '/en/architecture/rbac' },
                { text: 'Multi-Tenancy & RLS', link: '/en/architecture/multi-tenancy' },
                { text: 'WytAI Agent', link: '/en/project/documentation-status#wytai-agent' },
                { text: 'Audit Logs', link: '/en/project/documentation-status#audit-logs' },
                { text: 'PWA Support', link: '/en/project/documentation-status#pwa' }
              ]
            },
            {
              text: 'WytApps',
              collapsed: false,
              items: [
                { text: 'WytApps Overview', link: '/en/wytapps/' },
                { text: 'Apps Catalog (39 apps)', link: '/en/wytapps/apps-catalog' }
              ]
            },
            {
              text: 'WytSuites',
              collapsed: false,
              items: [
                { text: 'WytSuites Overview', link: '/en/wytsuites/' },
                { text: 'WytWorks Bundle', link: '/en/wytsuites/wytworks' },
                { text: 'WytStax Bundle', link: '/en/wytsuites/wytstax' },
                { text: 'WytCRM Bundle', link: '/en/wytsuites/wytcrm' }
              ]
            },
            {
              text: 'WytModules',
              collapsed: false,
              items: [
                { text: 'WytModules Overview', link: '/en/wytmodules/' },
                { text: 'Modules Catalog (51 modules)', link: '/en/wytmodules/modules-catalog' }
              ]
            },
            {
              text: 'WytHubs',
              collapsed: false,
              items: [
                { text: 'WytHubs Overview', link: '/en/wythubs/' }
              ]
            },
            {
              text: 'Architecture',
              items: [
                { text: 'Database Schema', link: '/en/architecture/database-schema' },
                { text: 'Multi-tenancy & RLS', link: '/en/architecture/multi-tenancy' },
                { text: 'Module Manifest Specification', link: '/en/architecture/module-manifest' },
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
                { text: 'Replit Assistant Guide', link: '/en/implementation/replit-guide' },
                { text: 'VitePress Editing Guide', link: '/en/implementation/vitepress-guide' }
              ]
            },
            {
              text: 'Admin Panels',
              collapsed: true,
              items: [
                { text: 'Engine Admin Panel', link: '/en/admin/engine-admin' },
                { text: 'Hub Admin Panel', link: '/en/admin/hub-admin' },
                { text: 'MyPanel (User Panel)', link: '/en/admin/mypanel' },
                { text: 'OrgPanel (Organization Panel)', link: '/en/admin/orgpanel' }
              ]
            },
            {
              text: 'Project Management',
              items: [
                { text: 'Features Checklist System', link: '/en/project/features-checklist' },
                { text: 'Documentation Status', link: '/en/project/documentation-status' }
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
            },
            {
              text: 'திட்ட மேலாண்மை',
              items: [
                { text: 'அம்சங்கள் சரிபார்ப்பு அமைப்பு', link: '/ta/project/features-checklist' }
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
