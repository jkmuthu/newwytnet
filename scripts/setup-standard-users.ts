import { db } from '../server/db';
import { whatsappUsers, tenants } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function setupStandardUsers() {
  try {
    console.log('🚀 Setting up standard user accounts...\n');
    
    // Get or create default tenant
    let [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, 'default'))
      .limit(1);
    
    if (!tenant) {
      [tenant] = await db
        .insert(tenants)
        .values({
          name: 'Default Organization',
          slug: 'default',
          status: 'active',
        })
        .returning();
    }

    const saltRounds = 12;
    
    // 1. Super Admin: UN:9345228184 PW:sadmin12
    console.log('1️⃣ Setting up Super Admin...');
    const superAdminPasswordHash = await bcrypt.hash('sadmin12', saltRounds);
    
    const superAdminData = {
      name: 'Super Admin',
      country: 'IN',
      whatsappNumber: '+919345228184',
      passwordHash: superAdminPasswordHash,
      role: 'super_admin' as const,
      isSuperAdmin: true,
      tenantId: tenant.id,
      isVerified: true,
      permissions: { all: true },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db
      .insert(whatsappUsers)
      .values(superAdminData)
      .onConflictDoUpdate({
        target: whatsappUsers.whatsappNumber,
        set: {
          passwordHash: superAdminPasswordHash,
          role: 'super_admin',
          isSuperAdmin: true,
          permissions: { all: true },
          isVerified: true,
          updatedAt: new Date()
        }
      });
    
    console.log('✅ Super Admin: 9345228184 / sadmin12');
    
    // 2. Admin: UN:8220449933 PW:admin123
    console.log('\n2️⃣ Setting up Admin...');
    const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
    
    const adminData = {
      name: 'Admin User',
      country: 'IN', 
      whatsappNumber: '+918220449933',
      passwordHash: adminPasswordHash,
      role: 'admin' as const,
      isSuperAdmin: false,
      tenantId: tenant.id,
      isVerified: true,
      permissions: { admin: true },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db
      .insert(whatsappUsers)
      .values(adminData)
      .onConflictDoUpdate({
        target: whatsappUsers.whatsappNumber,
        set: {
          passwordHash: adminPasswordHash,
          role: 'admin',
          isSuperAdmin: false,
          permissions: { admin: true },
          isVerified: true,
          updatedAt: new Date()
        }
      });
    
    console.log('✅ Admin: 8220449933 / admin123');
    
    // 3. Demo User: UN:9876543210 PW:demo1234 (read-only, cannot change password)
    console.log('\n3️⃣ Setting up Demo User...');
    const demoPasswordHash = await bcrypt.hash('demo1234', saltRounds);
    
    const demoData = {
      name: 'Demo User',
      country: 'IN',
      whatsappNumber: '+919876543210',
      passwordHash: demoPasswordHash,
      role: 'user' as const,
      isSuperAdmin: false,
      tenantId: tenant.id,
      isVerified: true,
      permissions: { demo: true, readonly: true }, // Special demo permissions
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db
      .insert(whatsappUsers)
      .values(demoData)
      .onConflictDoUpdate({
        target: whatsappUsers.whatsappNumber,
        set: {
          passwordHash: demoPasswordHash,
          role: 'user',
          isSuperAdmin: false,
          permissions: { demo: true, readonly: true }, // Demo user cannot change password
          isVerified: true,
          updatedAt: new Date()
        }
      });
    
    console.log('✅ Demo User: 9876543210 / demo1234 (read-only)');
    
    console.log('\n🎉 Standard user accounts setup completed!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────┬──────────────┬─────────────┬────────────────┐');
    console.log('│ Role        │ Username     │ Password    │ Permissions    │');
    console.log('├─────────────┼──────────────┼─────────────┼────────────────┤');
    console.log('│ Super Admin │ 9345228184   │ sadmin12    │ All + Can Edit │');
    console.log('│ Admin       │ 8220449933   │ admin123    │ Admin + Can Edit│');
    console.log('│ Demo User   │ 9876543210   │ demo1234    │ User + Read Only│');
    console.log('└─────────────┴──────────────┴─────────────┴────────────────┘');
    
  } catch (error) {
    console.error('❌ Error setting up standard users:', error);
  }
  
  process.exit(0);
}

setupStandardUsers();