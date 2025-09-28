import { db } from "../server/db";
import { marketplaceHubs, hubItems } from "../shared/schema";

const defaultHubs = [
  {
    name: "AI Directory",
    slug: "ai-directory",
    description: "Discover the best AI tools and services for every use case. From content creation to data analysis, find the perfect AI solution for your needs.",
    category: "ai-tools",
    icon: "Bot",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop",
    isActive: true,
    isFeatured: true,
    items: [
      {
        title: "ChatGPT",
        description: "Advanced AI chatbot for conversations, content creation, and problem-solving",
        url: "https://chat.openai.com",
        category: "conversational-ai",
        tags: ["chatbot", "content", "assistant"],
        order: 1
      },
      {
        title: "Midjourney",
        description: "AI-powered image generation tool for creating stunning artwork and designs",
        url: "https://www.midjourney.com",
        category: "image-generation",
        tags: ["images", "art", "design", "generation"],
        order: 2
      },
      {
        title: "Stable Diffusion",
        description: "Open-source AI model for generating high-quality images from text descriptions",
        url: "https://stability.ai/stable-diffusion",
        category: "image-generation",
        tags: ["open-source", "images", "text-to-image"],
        order: 3
      },
      {
        title: "Claude",
        description: "Anthropic's AI assistant for analysis, research, and complex reasoning tasks",
        url: "https://claude.ai",
        category: "conversational-ai",
        tags: ["assistant", "research", "analysis"],
        order: 4
      },
      {
        title: "Notion AI",
        description: "Integrated AI writing assistant for enhanced productivity in Notion workspaces",
        url: "https://www.notion.so/product/ai",
        category: "productivity",
        tags: ["writing", "productivity", "workspace"],
        order: 5
      }
    ]
  },
  {
    name: "Design Resources",
    slug: "design-resources",
    description: "Curated collection of design tools, templates, and resources for creatives and professionals.",
    category: "design",
    icon: "Palette",
    coverImage: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&h=400&fit=crop",
    isActive: true,
    isFeatured: true,
    items: [
      {
        title: "Figma",
        description: "Collaborative interface design tool for teams",
        url: "https://www.figma.com",
        category: "ui-design",
        tags: ["design", "collaboration", "ui", "prototyping"],
        order: 1
      },
      {
        title: "Unsplash",
        description: "High-quality free photos for any project",
        url: "https://unsplash.com",
        category: "photography",
        tags: ["photos", "free", "stock"],
        order: 2
      },
      {
        title: "Adobe Creative Cloud",
        description: "Complete suite of creative applications",
        url: "https://www.adobe.com/creativecloud.html",
        category: "creative-suite",
        tags: ["adobe", "creative", "professional"],
        order: 3
      },
      {
        title: "Canva",
        description: "Easy-to-use design platform for everyone",
        url: "https://www.canva.com",
        category: "graphic-design",
        tags: ["templates", "easy", "social-media"],
        order: 4
      },
      {
        title: "Dribbble",
        description: "Design inspiration and portfolio platform",
        url: "https://dribbble.com",
        category: "inspiration",
        tags: ["inspiration", "portfolio", "community"],
        order: 5
      }
    ]
  },
  {
    name: "Developer Tools",
    slug: "developer-tools",
    description: "Essential tools and resources for developers. From code editors to deployment platforms.",
    category: "development",
    icon: "Code",
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=400&fit=crop",
    isActive: true,
    isFeatured: false,
    items: [
      {
        title: "GitHub",
        description: "Version control and collaboration platform for developers",
        url: "https://github.com",
        category: "version-control",
        tags: ["git", "collaboration", "open-source"],
        order: 1
      },
      {
        title: "Visual Studio Code",
        description: "Free code editor with powerful features and extensions",
        url: "https://code.visualstudio.com",
        category: "editor",
        tags: ["editor", "free", "extensions"],
        order: 2
      },
      {
        title: "Vercel",
        description: "Platform for frontend frameworks and static sites",
        url: "https://vercel.com",
        category: "deployment",
        tags: ["hosting", "frontend", "serverless"],
        order: 3
      },
      {
        title: "Stack Overflow",
        description: "Q&A platform for programmers and developers",
        url: "https://stackoverflow.com",
        category: "community",
        tags: ["questions", "community", "help"],
        order: 4
      },
      {
        title: "Postman",
        description: "API development and testing platform",
        url: "https://www.postman.com",
        category: "api-tools",
        tags: ["api", "testing", "development"],
        order: 5
      }
    ]
  },
  {
    name: "Business Tools",
    slug: "business-tools",
    description: "Productivity and business management tools for entrepreneurs and teams.",
    category: "business",
    icon: "Briefcase",
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop",
    isActive: true,
    isFeatured: false,
    items: [
      {
        title: "Slack",
        description: "Team communication and collaboration platform",
        url: "https://slack.com",
        category: "communication",
        tags: ["team", "chat", "collaboration"],
        order: 1
      },
      {
        title: "Trello",
        description: "Visual project management with boards and cards",
        url: "https://trello.com",
        category: "project-management",
        tags: ["kanban", "organization", "visual"],
        order: 2
      },
      {
        title: "Zoom",
        description: "Video conferencing and online meeting platform",
        url: "https://zoom.us",
        category: "video-conferencing",
        tags: ["meetings", "video", "remote"],
        order: 3
      },
      {
        title: "Google Workspace",
        description: "Integrated suite of productivity and collaboration tools",
        url: "https://workspace.google.com",
        category: "productivity-suite",
        tags: ["productivity", "collaboration", "cloud"],
        order: 4
      },
      {
        title: "HubSpot",
        description: "All-in-one CRM and marketing platform",
        url: "https://www.hubspot.com",
        category: "crm",
        tags: ["crm", "marketing", "sales"],
        order: 5
      }
    ]
  },
  {
    name: "Marketing Resources",
    slug: "marketing-resources",
    description: "Tools and resources for digital marketing, analytics, and growth hacking.",
    category: "marketing",
    icon: "TrendingUp",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop",
    isActive: true,
    isFeatured: false,
    items: [
      {
        title: "Google Analytics",
        description: "Web analytics service for tracking and reporting website traffic",
        url: "https://analytics.google.com",
        category: "analytics",
        tags: ["analytics", "tracking", "data"],
        order: 1
      },
      {
        title: "Mailchimp",
        description: "Email marketing and automation platform",
        url: "https://mailchimp.com",
        category: "email-marketing",
        tags: ["email", "automation", "newsletters"],
        order: 2
      },
      {
        title: "Buffer",
        description: "Social media management and scheduling tool",
        url: "https://buffer.com",
        category: "social-media",
        tags: ["social", "scheduling", "automation"],
        order: 3
      },
      {
        title: "SEMrush",
        description: "SEO and digital marketing toolkit",
        url: "https://www.semrush.com",
        category: "seo",
        tags: ["seo", "keywords", "competition"],
        order: 4
      },
      {
        title: "Hotjar",
        description: "Heatmaps and user behavior analytics",
        url: "https://www.hotjar.com",
        category: "user-analytics",
        tags: ["heatmaps", "user-experience", "analytics"],
        order: 5
      }
    ]
  }
];

async function seedMarketplaceHubs() {
  try {
    console.log("🌐 Seeding marketplace hubs...");
    
    // Check if hubs already exist
    const existingHubs = await db.select().from(marketplaceHubs);
    if (existingHubs.length > 0) {
      console.log("✅ Marketplace hubs already exist, skipping...");
      return;
    }
    
    // Insert hubs and their items
    for (const hubData of defaultHubs) {
      const { items, ...hub } = hubData;
      
      // Calculate item count
      const hubWithCount = {
        ...hub,
        itemCount: items.length
      };
      
      // Insert hub
      const insertedHub = await db.insert(marketplaceHubs).values(hubWithCount).returning();
      const hubId = insertedHub[0].id;
      
      console.log(`✅ Added hub: ${hub.name} (${items.length} items)`);
      
      // Insert items for this hub
      for (const item of items) {
        await db.insert(hubItems).values({
          hubId,
          title: item.title,
          description: item.description,
          url: item.url,
          category: item.category,
          tags: item.tags,
          isActive: true,
          order: item.order
        });
        
        console.log(`   📌 Added item: ${item.title}`);
      }
    }
    
    console.log("🎉 Marketplace hubs seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding marketplace hubs:", error);
  }
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  seedMarketplaceHubs();
}

export { seedMarketplaceHubs };