import { db } from "../server/db";
import { marketplaceApps, appPricing } from "../shared/schema";

const defaultApps = [
  {
    name: "QR Generator Pro",
    slug: "qr-generator-pro",
    description: "Generate professional QR codes for URLs, text, WiFi, and more with advanced customization options",
    longDescription: "Transform your digital presence with QR Generator Pro, the ultimate tool for creating stunning, professional QR codes. Whether you're a business owner, marketer, or content creator, our advanced generator offers unparalleled customization options including custom colors, logos, frames, and analytics tracking. Perfect for marketing campaigns, business cards, event tickets, and restaurant menus.",
    category: "utilities",
    developer: "WytNet Technologies",
    version: "2.1.0",
    rating: 4.8,
    ratingCount: 1247,
    downloads: 15420,
    size: "12.5 MB",
    lastUpdated: "2024-01-15",
    screenshots: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&h=600&fit=crop"
    ],
    videoUrl: null,
    features: [
      "Custom logo embedding",
      "Unlimited QR codes",
      "Analytics tracking",
      "Batch generation",
      "High-resolution export",
      "WiFi QR codes",
      "vCard support",
      "Custom color schemes"
    ],
    permissions: [
      "Camera access for scanning",
      "Storage access for saving QR codes",
      "Network access for analytics"
    ],
    isVerified: true,
    isPopular: true,
    pricing: [
      { pricingType: "free", price: 0, usageLimit: 5, features: ["Basic QR codes", "Standard templates", "PNG export"] },
      { pricingType: "pay_per_use", price: 25, usageLimit: 1, features: ["Premium templates", "Analytics", "Logo embedding"] },
      { pricingType: "monthly", price: 499, usageLimit: null, features: ["Unlimited QR codes", "Advanced analytics", "Priority support", "Batch generation"] },
    ]
  },
  {
    name: "AI Content Studio",
    slug: "ai-content-studio",
    description: "Comprehensive AI-powered content creation suite for blogs, social media, and marketing materials",
    longDescription: "Revolutionize your content creation workflow with AI Content Studio. Our advanced AI technology helps you generate high-quality blog posts, social media content, product descriptions, and marketing copy in minutes. With built-in SEO optimization, plagiarism checking, and tone adjustment, you'll never run out of engaging content ideas.",
    category: "ai-tools",
    developer: "Creative AI Labs",
    version: "3.2.1",
    rating: 4.9,
    ratingCount: 2156,
    downloads: 28750,
    size: "45.2 MB",
    lastUpdated: "2024-01-20",
    screenshots: [
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop"
    ],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    features: [
      "AI blog post generation",
      "Social media content",
      "SEO optimization",
      "Plagiarism detection",
      "Multiple tone options",
      "Content templates",
      "Team collaboration",
      "Export to multiple formats"
    ],
    permissions: [
      "Network access for AI processing",
      "Storage access for saving content",
      "Clipboard access for easy copying"
    ],
    isVerified: true,
    isPopular: true,
    pricing: [
      { pricingType: "free", price: 0, usageLimit: 3, features: ["Basic AI generation", "3 articles/month", "Standard templates"] },
      { pricingType: "monthly", price: 999, usageLimit: null, features: ["Unlimited generation", "Premium templates", "SEO tools", "Team collaboration"] },
      { pricingType: "yearly", price: 9999, usageLimit: null, features: ["Everything in monthly", "Priority support", "Custom templates", "API access"] },
    ]
  },
  {
    name: "Personal Finance Tracker",
    slug: "finance-tracker",
    description: "Smart expense tracking and budgeting app with AI-powered insights and financial goal setting",
    longDescription: "Take control of your finances with our intelligent tracking system. Our app automatically categorizes expenses, provides personalized budgeting recommendations, and helps you achieve your financial goals. With bank-level security, receipt scanning, and comprehensive reporting, managing your money has never been easier.",
    category: "finance",
    developer: "FinTech Solutions",
    version: "4.1.2",
    rating: 4.7,
    ratingCount: 3842,
    downloads: 52300,
    size: "28.7 MB",
    lastUpdated: "2024-01-18",
    screenshots: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop"
    ],
    videoUrl: null,
    features: [
      "Automatic expense categorization",
      "Receipt scanning with OCR",
      "Budget planning and tracking",
      "Financial goal setting",
      "Investment portfolio tracking",
      "Bill reminders",
      "Spending insights and analytics",
      "Export to Excel/PDF"
    ],
    permissions: [
      "Camera access for receipt scanning",
      "Network access for bank connections",
      "Storage access for data backup",
      "Location access for merchant detection"
    ],
    isVerified: true,
    isPopular: false,
    pricing: [
      { pricingType: "free", price: 0, usageLimit: 50, features: ["Basic tracking", "50 transactions/month", "Simple budgets"] },
      { pricingType: "monthly", price: 299, usageLimit: null, features: ["Unlimited transactions", "Advanced analytics", "Goal tracking", "Receipt scanning"] },
      { pricingType: "yearly", price: 2999, usageLimit: null, features: ["Everything in monthly", "Investment tracking", "Priority support", "Data export"] },
    ]
  },
  {
    name: "Team Project Manager",
    slug: "project-manager",
    description: "Collaborative project management tool with Kanban boards, time tracking, and team communication",
    longDescription: "Streamline your team's productivity with our comprehensive project management solution. Features include customizable Kanban boards, Gantt charts, time tracking, file sharing, and real-time collaboration tools. Perfect for agile teams, creative agencies, and remote workers who need to stay organized and connected.",
    category: "productivity",
    developer: "Productivity Plus",
    version: "5.0.3",
    rating: 4.6,
    ratingCount: 1889,
    downloads: 19650,
    size: "67.3 MB",
    lastUpdated: "2024-01-22",
    screenshots: [
      "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
    ],
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    features: [
      "Kanban and Gantt views",
      "Time tracking and reporting",
      "Team chat and comments",
      "File sharing and storage",
      "Custom workflows",
      "Mobile and desktop sync",
      "Integration with popular tools",
      "Advanced permissions"
    ],
    permissions: [
      "Network access for team sync",
      "Storage access for file management",
      "Notification access for updates",
      "Camera access for document scanning"
    ],
    isVerified: true,
    isPopular: true,
    pricing: [
      { pricingType: "free", price: 0, usageLimit: 3, features: ["Up to 3 projects", "5 team members", "Basic features"] },
      { pricingType: "monthly", price: 1999, usageLimit: null, features: ["Unlimited projects", "50 team members", "Advanced features", "Priority support"] },
      { pricingType: "enterprise", price: 4999, usageLimit: null, features: ["Unlimited everything", "Custom integrations", "Dedicated support", "On-premise option"] },
    ]
  }
];

async function seedMarketplaceApps() {
  try {
    console.log("🔧 Seeding marketplace apps...");
    
    // Check if apps already exist
    const existingApps = await db.select().from(marketplaceApps);
    if (existingApps.length > 0) {
      console.log("✅ Marketplace apps already exist, skipping...");
      return;
    }
    
    // Insert apps and their pricing
    for (const appData of defaultApps) {
      const { pricing, ...app } = appData;
      
      // Insert app
      const insertedApp = await db.insert(marketplaceApps).values({
        ...app,
        screenshots: app.screenshots,
        features: app.features,
        permissions: app.permissions
      }).returning();
      const appId = insertedApp[0].id;
      
      console.log(`✅ Added app: ${app.name}`);
      
      // Insert pricing options for this app
      for (const price of pricing) {
        await db.insert(appPricing).values({
          appId,
          pricingType: price.pricingType,
          price: price.price.toString(),
          usageLimit: price.usageLimit,
          features: price.features
        });
        
        console.log(`   💰 Added pricing: ${price.pricingType} - ₹${price.price}`);
      }
    }
    
    console.log("🎉 Marketplace apps seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding marketplace apps:", error);
  }
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  seedMarketplaceApps();
}

export { seedMarketplaceApps };