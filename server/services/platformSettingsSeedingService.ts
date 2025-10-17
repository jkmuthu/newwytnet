import { db } from "../db";
import { platformSettings } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const defaultSettings = [
  // General Settings
  {
    key: "platform_name",
    value: "WytNet",
    type: "string",
    category: "general",
    label: "Platform Name",
    description: "The name of your platform displayed across the application",
    isPublic: true,
    isEditable: true,
  },
  {
    key: "platform_description",
    value: "Multi-tenant SaaS platform for application building and content management",
    type: "string",
    category: "general",
    label: "Platform Description",
    description: "A brief description of your platform",
    isPublic: true,
    isEditable: true,
  },
  {
    key: "maintenance_mode",
    value: "false",
    type: "boolean",
    category: "general",
    label: "Maintenance Mode",
    description: "Enable maintenance mode to restrict access to the platform",
    isPublic: false,
    isEditable: true,
  },
  
  // Email Settings
  {
    key: "smtp_host",
    value: "",
    type: "string",
    category: "email",
    label: "SMTP Host",
    description: "SMTP server hostname for sending emails",
    isPublic: false,
    isEditable: true,
  },
  {
    key: "smtp_port",
    value: "587",
    type: "number",
    category: "email",
    label: "SMTP Port",
    description: "SMTP server port (usually 587 for TLS or 465 for SSL)",
    isPublic: false,
    isEditable: true,
  },
  {
    key: "from_email",
    value: "noreply@wytnet.com",
    type: "string",
    category: "email",
    label: "From Email",
    description: "Default sender email address",
    isPublic: false,
    isEditable: true,
  },
  
  // Payment Settings
  {
    key: "payment_gateway",
    value: "razorpay",
    type: "string",
    category: "payment",
    label: "Payment Gateway",
    description: "Default payment gateway (razorpay, stripe, etc.)",
    isPublic: false,
    isEditable: true,
  },
  {
    key: "currency",
    value: "INR",
    type: "string",
    category: "payment",
    label: "Default Currency",
    description: "Default currency for transactions",
    isPublic: true,
    isEditable: true,
  },
  
  // Security Settings
  {
    key: "session_timeout",
    value: "7200",
    type: "number",
    category: "security",
    label: "Session Timeout (seconds)",
    description: "Session timeout duration in seconds (default: 2 hours)",
    isPublic: false,
    isEditable: true,
  },
  {
    key: "password_min_length",
    value: "8",
    type: "number",
    category: "security",
    label: "Minimum Password Length",
    description: "Minimum required password length for user accounts",
    isPublic: true,
    isEditable: true,
  },
  {
    key: "enable_two_factor",
    value: "false",
    type: "boolean",
    category: "security",
    label: "Enable Two-Factor Authentication",
    description: "Require two-factor authentication for all users",
    isPublic: false,
    isEditable: true,
  },
  
  // API Settings
  {
    key: "api_rate_limit",
    value: "1000",
    type: "number",
    category: "api",
    label: "API Rate Limit (per hour)",
    description: "Maximum API requests per hour per user",
    isPublic: false,
    isEditable: true,
  },
  {
    key: "api_version",
    value: "v1",
    type: "string",
    category: "api",
    label: "API Version",
    description: "Current API version",
    isPublic: true,
    isEditable: false,
  },
];

export async function seedPlatformSettings() {
  try {
    console.log("🌱 Seeding platform settings...");

    for (const setting of defaultSettings) {
      // Check if setting already exists
      const existing = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.key, setting.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(platformSettings).values(setting);
        console.log(`✅ Created setting: ${setting.key}`);
      } else {
        console.log(`⏭️  Setting already exists: ${setting.key}`);
      }
    }

    console.log("✅ Platform settings seeding completed");
  } catch (error) {
    console.error("❌ Error seeding platform settings:", error);
  }
}
