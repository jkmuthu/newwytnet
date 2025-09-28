import { db } from "../server/db";
import { plans } from "../shared/schema";

const samplePlans = [
  {
    name: "Starter",
    description: "Perfect for individuals getting started with WytNet",
    price: "299.00",
    currency: "INR",
    interval: "monthly",
    features: [
      "5 WytTools modules",
      "1 Custom WytApp", 
      "Basic Analytics",
      "Email Support",
      "5GB Storage"
    ],
    limits: {
      modules: 5,
      apps: 1,
      storage: "5GB",
      support: "email"
    },
    isActive: true
  },
  {
    name: "Professional", 
    description: "For growing businesses and teams",
    price: "799.00",
    currency: "INR",
    interval: "monthly",
    features: [
      "Unlimited WytTools",
      "10 Custom WytApps",
      "Advanced Analytics", 
      "Priority Support",
      "50GB Storage",
      "API Access",
      "Custom Branding"
    ],
    limits: {
      modules: -1, // unlimited
      apps: 10,
      storage: "50GB",
      support: "priority"
    },
    isActive: true
  },
  {
    name: "Enterprise",
    description: "For large organizations with advanced needs", 
    price: "1999.00",
    currency: "INR",
    interval: "monthly",
    features: [
      "Everything in Professional",
      "Unlimited WytApps",
      "White-label Solution",
      "Dedicated Support",
      "500GB Storage", 
      "Custom Integrations",
      "SLA Guarantee",
      "Advanced Security"
    ],
    limits: {
      modules: -1, // unlimited
      apps: -1, // unlimited
      storage: "500GB", 
      support: "dedicated"
    },
    isActive: true
  }
];

async function addSamplePlans() {
  try {
    console.log("🔧 Adding sample plans to database...");
    
    // Check if plans already exist
    const existingPlans = await db.select().from(plans);
    if (existingPlans.length > 0) {
      console.log("✅ Sample plans already exist, skipping...");
      return;
    }
    
    // Insert sample plans
    for (const plan of samplePlans) {
      await db.insert(plans).values(plan);
      console.log(`✅ Added plan: ${plan.name}`);
    }
    
    console.log("🎉 Sample plans added successfully!");
  } catch (error) {
    console.error("❌ Error adding sample plans:", error);
  }
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  addSamplePlans();
}

export { addSamplePlans };