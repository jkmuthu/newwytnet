import { db } from "../db";
import { whatsappUsers } from "@shared/schema";
import { eq, ne } from "drizzle-orm";

/**
 * Fix user roles to ensure only +919345228184 has super_admin role
 * All other users should have 'user' role
 */
export async function fixUserRoles() {
  try {
    console.log('🔧 Starting user role fix...');

    // Fix super admin - ensure only +919345228184 has super_admin role
    const superAdminResult = await db
      .update(whatsappUsers)
      .set({
        role: 'super_admin',
        isSuperAdmin: true,
        permissions: { all: true },
        updatedAt: new Date(),
      })
      .where(eq(whatsappUsers.whatsappNumber, '+919345228184'))
      .returning();

    console.log(`✅ Updated super admin user: ${superAdminResult.length} users`);

    // Fix all other users - ensure they have 'user' role
    const regularUsersResult = await db
      .update(whatsappUsers)
      .set({
        role: 'user',
        isSuperAdmin: false,
        permissions: {},
        updatedAt: new Date(),
      })
      .where(ne(whatsappUsers.whatsappNumber, '+919345228184'))
      .returning();

    console.log(`✅ Updated regular users: ${regularUsersResult.length} users`);

    // Show summary
    const allUsers = await db.select().from(whatsappUsers);
    console.log('\n📊 User Role Summary:');
    console.log('===================');
    for (const user of allUsers) {
      console.log(`${user.whatsappNumber}: ${user.role} (Super Admin: ${user.isSuperAdmin})`);
    }

    console.log('\n🎉 User role fix completed successfully!');
    
    return {
      superAdminFixed: superAdminResult.length,
      regularUsersFixed: regularUsersResult.length,
      totalUsers: allUsers.length
    };

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
    throw error;
  }
}

// Run the fix immediately
fixUserRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to fix user roles:', error);
    process.exit(1);
  });