#!/usr/bin/env tsx

import { seedRolesAndPermissions } from "../services/rolesSeedingService";

async function main() {
  try {
    await seedRolesAndPermissions();
    console.log("\n✅ Seeding script completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding script failed:", error);
    process.exit(1);
  }
}

main();
