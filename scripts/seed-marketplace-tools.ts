import { db } from "../server/db";
import { marketplaceTools, toolPricing } from "../shared/schema";

const defaultTools = [
  {
    name: "QR Generator",
    slug: "qr-generator",
    description: "Generate QR codes for URLs, text, and more with customization options",
    category: "utilities",
    icon: "QrCode",
    pricing: [
      { pricingType: "free", price: "0.00", usageLimit: 5 },
      { pricingType: "pay_per_use", price: "2.00", usageLimit: 1 },
      { pricingType: "monthly", price: "50.00", usageLimit: null },
    ]
  },
  {
    name: "AI Directory",
    slug: "ai-directory",
    description: "Curated collection of AI tools and services for various use cases",
    category: "ai-tools",
    icon: "Bot",
    pricing: [
      { pricingType: "free", price: "0.00", usageLimit: null },
    ]
  },
  {
    name: "DISC Assessment",
    slug: "disc-assessment",
    description: "Professional personality assessment using DISC methodology",
    category: "assessment",
    icon: "Activity",
    pricing: [
      { pricingType: "free", price: "0.00", usageLimit: 1 },
      { pricingType: "one_time", price: "299.00", usageLimit: null },
      { pricingType: "pay_per_use", price: "99.00", usageLimit: 1 },
    ]
  },
  {
    name: "Business Card Designer",
    slug: "business-card-designer",
    description: "Create professional business cards with customizable templates",
    category: "design",
    icon: "CreditCard",
    pricing: [
      { pricingType: "pay_per_use", price: "25.00", usageLimit: 1 },
      { pricingType: "monthly", price: "199.00", usageLimit: null },
    ]
  },
  {
    name: "Expense Calculator",
    slug: "expense-calculator",
    description: "Track and calculate personal and business expenses",
    category: "finance",
    icon: "Calculator",
    pricing: [
      { pricingType: "free", price: "0.00", usageLimit: 10 },
      { pricingType: "monthly", price: "149.00", usageLimit: null },
    ]
  },
  {
    name: "Invoice Generator",
    slug: "invoice-generator",
    description: "Generate professional invoices for your business",
    category: "business",
    icon: "FileText",
    pricing: [
      { pricingType: "free", price: "0.00", usageLimit: 3 },
      { pricingType: "pay_per_use", price: "15.00", usageLimit: 1 },
      { pricingType: "monthly", price: "99.00", usageLimit: null },
    ]
  }
];

async function seedMarketplaceTools() {
  try {
    console.log("🔧 Seeding marketplace tools...");
    
    // Check if tools already exist
    const existingTools = await db.select().from(marketplaceTools);
    if (existingTools.length > 0) {
      console.log("✅ Marketplace tools already exist, skipping...");
      return;
    }
    
    // Insert tools and their pricing
    for (const toolData of defaultTools) {
      const { pricing, ...tool } = toolData;
      
      // Insert tool
      const insertedTool = await db.insert(marketplaceTools).values(tool).returning();
      const toolId = insertedTool[0].id;
      
      console.log(`✅ Added tool: ${tool.name}`);
      
      // Insert pricing options for this tool
      for (const price of pricing) {
        await db.insert(toolPricing).values({
          toolId,
          ...price,
        });
        
        console.log(`   💰 Added pricing: ${price.pricingType} - ₹${price.price}`);
      }
    }
    
    console.log("🎉 Marketplace tools seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding marketplace tools:", error);
  }
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  seedMarketplaceTools();
}

export { seedMarketplaceTools };