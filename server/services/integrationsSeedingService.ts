import { db } from "../db";
import { sql } from "drizzle-orm";

async function generateDisplayId(prefix: string): Promise<string> {
  const sequenceName = `${prefix.toLowerCase()}_seq`;
  const result = await db.execute(sql`
    SELECT nextval('${sql.raw(sequenceName)}') as next_id
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${prefix}${String(nextId).padStart(7, '0')}`;
}

const DEFAULT_INTEGRATIONS = [
  {
    name: "Razorpay",
    slug: "razorpay",
    description: "Payment gateway for India - accept payments, subscriptions, and more",
    category: "payment",
    provider: "Razorpay",
    configFields: { keyId: "text", keySecret: "password" },
    iconUrl: "https://razorpay.com/favicon.png",
    documentationUrl: "https://razorpay.com/docs/",
  },
  {
    name: "Stripe",
    slug: "stripe",
    description: "Global payment processing platform",
    category: "payment",
    provider: "Stripe",
    configFields: { publishableKey: "text", secretKey: "password" },
    iconUrl: "https://stripe.com/favicon.ico",
    documentationUrl: "https://stripe.com/docs",
  },
  {
    name: "MSG91",
    slug: "msg91",
    description: "SMS and Email delivery platform",
    category: "communication",
    provider: "MSG91",
    configFields: { authKey: "password", senderId: "text" },
    iconUrl: "",
    documentationUrl: "https://msg91.com/help",
  },
  {
    name: "Twilio",
    slug: "twilio",
    description: "Cloud communications platform",
    category: "communication",
    provider: "Twilio",
    configFields: { accountSid: "text", authToken: "password", phoneNumber: "text" },
    iconUrl: "https://www.twilio.com/favicon.ico",
    documentationUrl: "https://www.twilio.com/docs",
  },
  {
    name: "SendGrid",
    slug: "sendgrid",
    description: "Email delivery and marketing platform",
    category: "communication",
    provider: "SendGrid",
    configFields: { apiKey: "password", fromEmail: "email" },
    iconUrl: "https://sendgrid.com/favicon.ico",
    documentationUrl: "https://docs.sendgrid.com",
  },
  {
    name: "Google Cloud Storage",
    slug: "gcs",
    description: "Cloud object storage for any amount of data",
    category: "storage",
    provider: "Google",
    configFields: { projectId: "text", bucketName: "text", credentials: "textarea" },
    iconUrl: "https://cloud.google.com/favicon.ico",
    documentationUrl: "https://cloud.google.com/storage/docs",
  },
  {
    name: "AWS S3",
    slug: "aws-s3",
    description: "Amazon cloud object storage service",
    category: "storage",
    provider: "Amazon",
    configFields: { accessKeyId: "text", secretAccessKey: "password", bucketName: "text", region: "text" },
    iconUrl: "https://aws.amazon.com/favicon.ico",
    documentationUrl: "https://docs.aws.amazon.com/s3/",
  },
  {
    name: "Cloudinary",
    slug: "cloudinary",
    description: "Image and video management platform",
    category: "storage",
    provider: "Cloudinary",
    configFields: { cloudName: "text", apiKey: "text", apiSecret: "password" },
    iconUrl: "https://cloudinary.com/favicon.ico",
    documentationUrl: "https://cloudinary.com/documentation",
  },
  {
    name: "OpenAI",
    slug: "openai",
    description: "AI models for text, code, and image generation",
    category: "ai-ml",
    provider: "OpenAI",
    configFields: { apiKey: "password", organization: "text" },
    iconUrl: "https://openai.com/favicon.ico",
    documentationUrl: "https://platform.openai.com/docs",
  },
  {
    name: "Anthropic Claude",
    slug: "anthropic",
    description: "Advanced AI assistant and language models",
    category: "ai-ml",
    provider: "Anthropic",
    configFields: { apiKey: "password" },
    iconUrl: "",
    documentationUrl: "https://docs.anthropic.com",
  },
  {
    name: "Google Gemini",
    slug: "gemini",
    description: "Google's multimodal AI model",
    category: "ai-ml",
    provider: "Google",
    configFields: { apiKey: "password" },
    iconUrl: "https://ai.google.dev/favicon.ico",
    documentationUrl: "https://ai.google.dev/docs",
  },
  {
    name: "Google Analytics",
    slug: "google-analytics",
    description: "Web analytics and reporting platform",
    category: "analytics",
    provider: "Google",
    configFields: { measurementId: "text", apiSecret: "password" },
    iconUrl: "https://analytics.google.com/favicon.ico",
    documentationUrl: "https://developers.google.com/analytics",
  },
  {
    name: "Mixpanel",
    slug: "mixpanel",
    description: "Product analytics platform",
    category: "analytics",
    provider: "Mixpanel",
    configFields: { projectToken: "text", apiSecret: "password" },
    iconUrl: "https://mixpanel.com/favicon.ico",
    documentationUrl: "https://developer.mixpanel.com/docs",
  },
  {
    name: "Google Maps",
    slug: "google-maps",
    description: "Maps and location services",
    category: "maps",
    provider: "Google",
    configFields: { apiKey: "password" },
    iconUrl: "https://maps.google.com/favicon.ico",
    documentationUrl: "https://developers.google.com/maps/documentation",
  },
  {
    name: "Mappls (MapmyIndia)",
    slug: "mappls",
    description: "India's leading mapping platform",
    category: "maps",
    provider: "Mappls",
    configFields: { apiKey: "password", clientId: "text" },
    iconUrl: "",
    documentationUrl: "https://www.mapmyindia.com/api/",
  },
  {
    name: "Intercom",
    slug: "intercom",
    description: "Customer messaging and support platform",
    category: "support",
    provider: "Intercom",
    configFields: { appId: "text", accessToken: "password" },
    iconUrl: "https://www.intercom.com/favicon.ico",
    documentationUrl: "https://developers.intercom.com/",
  },
  {
    name: "Zendesk",
    slug: "zendesk",
    description: "Customer service and support platform",
    category: "support",
    provider: "Zendesk",
    configFields: { subdomain: "text", email: "email", apiToken: "password" },
    iconUrl: "https://www.zendesk.com/favicon.ico",
    documentationUrl: "https://developer.zendesk.com/",
  },
  {
    name: "HubSpot",
    slug: "hubspot",
    description: "CRM and marketing automation platform",
    category: "crm",
    provider: "HubSpot",
    configFields: { apiKey: "password", portalId: "text" },
    iconUrl: "https://www.hubspot.com/favicon.ico",
    documentationUrl: "https://developers.hubspot.com/",
  },
];

export async function seedPlatformIntegrations() {
  console.log('🔌 Seeding platform integrations...');
  
  try {
    let newCount = 0;
    let updatedCount = 0;

    for (const integration of DEFAULT_INTEGRATIONS) {
      const existing = await db.execute(sql`
        SELECT * FROM platform_integrations WHERE slug = ${integration.slug}
      `);

      if (existing.rows.length === 0) {
        const displayId = await generateDisplayId('IN');
        await db.execute(sql`
          INSERT INTO platform_integrations (
            display_id, name, slug, description, category, provider, 
            config_fields, icon_url, documentation_url
          ) VALUES (
            ${displayId}, ${integration.name}, ${integration.slug}, 
            ${integration.description}, ${integration.category}, ${integration.provider},
            ${JSON.stringify(integration.configFields)}, ${integration.iconUrl || null}, 
            ${integration.documentationUrl || null}
          )
        `);
        newCount++;
        console.log(`  ✓ Created integration: ${integration.name} (${displayId})`);
      } else {
        await db.execute(sql`
          UPDATE platform_integrations 
          SET 
            name = ${integration.name},
            description = ${integration.description},
            category = ${integration.category},
            provider = ${integration.provider},
            config_fields = ${JSON.stringify(integration.configFields)},
            icon_url = ${integration.iconUrl || null},
            documentation_url = ${integration.documentationUrl || null},
            updated_at = NOW()
          WHERE slug = ${integration.slug}
        `);
        updatedCount++;
        console.log(`  ✓ Updated integration: ${integration.name}`);
      }
    }

    console.log(`✅ Platform integrations seeded: ${newCount} new, ${updatedCount} updated`);
  } catch (error) {
    console.error('❌ Error seeding platform integrations:', error);
    throw error;
  }
}
