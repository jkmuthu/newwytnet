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
          { text: '⚠️ Standards', link: '/en/production-standards/' },
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
              text: '⚠️ Production Standards (READ FIRST)',
              collapsed: false,
              items: [
                { text: 'Enterprise Commitment & Quality Standards', link: '/en/production-standards/' }
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
              text: 'Use Case Flows & Diagrams',
              collapsed: false,
              items: [
                { text: 'Overview & Guide', link: '/en/use-case-flows/' },
                { text: '1. Public Pages & Unauthorized Visitor', link: '/en/use-case-flows/public-pages-unauthorized-visitor' },
                { text: '2. Unified Header Authentication', link: '/en/use-case-flows/unified-header-authentication' },
                { text: '3. WytPass Authentication System', link: '/en/use-case-flows/wytpass-authentication' },
                { text: '4. Multi-Tenant Architecture', link: '/en/use-case-flows/multi-tenant-architecture' },
                { text: '5. RBAC Permissions', link: '/en/use-case-flows/rbac-permissions' },
                { text: '6. Super Admin Panel Switching', link: '/en/use-case-flows/admin-panel-switching' },
                { text: '7. WytAI Agent Workflow', link: '/en/use-case-flows/wytai-agent-workflow' },
                { text: '8. Module Installation & Activation', link: '/en/use-case-flows/module-installation' },
                { text: '9. App Subscription Flow', link: '/en/use-case-flows/app-subscription-flow' },
                { text: '10. Audit Logs System', link: '/en/use-case-flows/audit-logs-system' }
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
              text: '⚠️ உற்பத்தி தரநிலைகள் (முதலில் படிக்கவும்)',
              collapsed: false,
              items: [
                { text: 'நிறுவன உறுதிமொழி & தர தரநிலைகள்', link: '/en/production-standards/' }
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
              text: 'பயன் வழக்கு ஓட்டங்கள் & வரைபடங்கள்',
              collapsed: false,
              items: [
                { text: 'கண்ணோட்டம் & வழிகாட்டி', link: '/en/use-case-flows/' },
                { text: '1. பொது பக்கங்கள் & அங்கீகாரமற்ற பார்வையாளர்', link: '/en/use-case-flows/public-pages-unauthorized-visitor' },
                { text: '2. ஒருங்கிணைந்த Header அங்கீகாரம்', link: '/en/use-case-flows/unified-header-authentication' },
                { text: '3. WytPass அங்கீகார அமைப்பு', link: '/en/use-case-flows/wytpass-authentication' },
                { text: '4. Multi-Tenant கட்டமைப்பு', link: '/en/use-case-flows/multi-tenant-architecture' },
                { text: '5. RBAC அனுமதிகள்', link: '/en/use-case-flows/rbac-permissions' },
                { text: '6. Super Admin பேனல் மாற்றம்', link: '/en/use-case-flows/admin-panel-switching' },
                { text: '7. WytAI Agent பணி ஓட்டம்', link: '/en/use-case-flows/wytai-agent-workflow' },
                { text: '8. Module நிறுவல் & செயல்படுத்தல்', link: '/en/use-case-flows/module-installation' },
                { text: '9. App சந்தா ஓட்டம்', link: '/en/use-case-flows/app-subscription-flow' },
                { text: '10. Audit Logs அமைப்பு', link: '/en/use-case-flows/audit-logs-system' }
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
