import { db } from "../db";
import { platformThemes } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

async function generateDisplayId(prefix: string): Promise<string> {
  const sequenceName = `${prefix.toLowerCase()}_seq`;
  const result = await db.execute(sql`
    SELECT nextval('${sql.raw(sequenceName)}') as next_id
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${prefix}${String(nextId).padStart(7, '0')}`;
}

const DEFAULT_THEMES = [
  {
    name: "WytNet Light",
    slug: "wytnet-light",
    description: "Default light theme with WytNet brand colors",
    type: "system",
    isDefault: true,
    mode: "light",
    primaryColor: "#0066FF",
    secondaryColor: "#FF6B00",
    accentColor: "#00D4FF",
    backgroundColor: "#FFFFFF",
    textColor: "#1A1A1A",
    fontFamily: "Inter",
    colorScheme: {
      success: "#10B981",
      error: "#EF4444",
      warning: "#F59E0B",
      info: "#3B82F6",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },
  },
  {
    name: "WytNet Dark",
    slug: "wytnet-dark",
    description: "Dark theme with WytNet brand colors",
    type: "system",
    mode: "dark",
    primaryColor: "#3B82F6",
    secondaryColor: "#F97316",
    accentColor: "#06B6D4",
    backgroundColor: "#0F1419",
    textColor: "#E5E7EB",
    fontFamily: "Inter",
    colorScheme: {
      success: "#10B981",
      error: "#EF4444",
      warning: "#F59E0B",
      info: "#3B82F6",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.2)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
    },
  },
  {
    name: "Ocean Blue",
    slug: "ocean-blue",
    description: "Professional theme with ocean blue tones",
    type: "system",
    mode: "light",
    primaryColor: "#0284C7",
    secondaryColor: "#0EA5E9",
    accentColor: "#06B6D4",
    backgroundColor: "#F0F9FF",
    textColor: "#0C4A6E",
    fontFamily: "Inter",
    colorScheme: {
      success: "#059669",
      error: "#DC2626",
      warning: "#D97706",
      info: "#0284C7",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    borderRadius: {
      sm: "6px",
      md: "10px",
      lg: "14px",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    },
  },
  {
    name: "Sunset Orange",
    slug: "sunset-orange",
    description: "Vibrant theme with warm sunset colors",
    type: "system",
    mode: "light",
    primaryColor: "#EA580C",
    secondaryColor: "#F97316",
    accentColor: "#FB923C",
    backgroundColor: "#FFF7ED",
    textColor: "#7C2D12",
    fontFamily: "Inter",
    colorScheme: {
      success: "#16A34A",
      error: "#DC2626",
      warning: "#CA8A04",
      info: "#2563EB",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "16px",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(234, 88, 12, 0.1)",
      md: "0 4px 6px -1px rgba(234, 88, 12, 0.15)",
      lg: "0 10px 15px -3px rgba(234, 88, 12, 0.2)",
      xl: "0 20px 25px -5px rgba(234, 88, 12, 0.25)",
    },
  },
  {
    name: "Forest Green",
    slug: "forest-green",
    description: "Natural theme with forest green palette",
    type: "system",
    mode: "light",
    primaryColor: "#059669",
    secondaryColor: "#10B981",
    accentColor: "#34D399",
    backgroundColor: "#F0FDF4",
    textColor: "#064E3B",
    fontFamily: "Inter",
    colorScheme: {
      success: "#059669",
      error: "#DC2626",
      warning: "#D97706",
      info: "#0284C7",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    borderRadius: {
      sm: "8px",
      md: "12px",
      lg: "16px",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(5, 150, 105, 0.1)",
      md: "0 4px 6px -1px rgba(5, 150, 105, 0.15)",
      lg: "0 10px 15px -3px rgba(5, 150, 105, 0.2)",
      xl: "0 20px 25px -5px rgba(5, 150, 105, 0.25)",
    },
  },
  {
    name: "Purple Dream",
    slug: "purple-dream",
    description: "Creative theme with purple and violet tones",
    type: "system",
    mode: "light",
    primaryColor: "#7C3AED",
    secondaryColor: "#8B5CF6",
    accentColor: "#A78BFA",
    backgroundColor: "#FAF5FF",
    textColor: "#581C87",
    fontFamily: "Inter",
    colorScheme: {
      success: "#059669",
      error: "#DC2626",
      warning: "#D97706",
      info: "#7C3AED",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      full: "9999px",
    },
    shadows: {
      sm: "0 1px 2px 0 rgba(124, 58, 237, 0.1)",
      md: "0 4px 6px -1px rgba(124, 58, 237, 0.15)",
      lg: "0 10px 15px -3px rgba(124, 58, 237, 0.2)",
      xl: "0 20px 25px -5px rgba(124, 58, 237, 0.25)",
    },
  },
];

export async function seedPlatformThemes() {
  console.log('🎨 Seeding platform themes...');
  
  try {
    let newCount = 0;
    let updatedCount = 0;

    for (const theme of DEFAULT_THEMES) {
      const existing = await db.select()
        .from(platformThemes)
        .where(eq(platformThemes.slug, theme.slug))
        .limit(1);

      if (existing.length === 0) {
        const displayId = await generateDisplayId('TM');
        await db.insert(platformThemes).values({
          displayId,
          ...theme,
        });
        newCount++;
        console.log(`  ✓ Created theme: ${theme.name} (${displayId})`);
      } else {
        await db.update(platformThemes)
          .set({
            ...theme,
            updatedAt: sql`NOW()`,
          })
          .where(eq(platformThemes.slug, theme.slug));
        updatedCount++;
        console.log(`  ✓ Updated theme: ${theme.name}`);
      }
    }

    console.log(`✅ Platform themes seeded: ${newCount} new, ${updatedCount} updated`);
  } catch (error) {
    console.error('❌ Error seeding platform themes:', error);
    throw error;
  }
}
