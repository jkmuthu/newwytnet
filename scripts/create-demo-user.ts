import { db } from "../server/db";
import { whatsappUsers } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function createDemoUser() {
  const email = "demo1@wytnet.com";
  const password = "demo1234";
  const name = "Demo User1";

  try {
    // Check if user already exists
    const existingUser = await db.select()
      .from(whatsappUsers)
      .where(eq(whatsappUsers.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`✅ Demo user already exists:`);
      console.log(`   Name: ${existingUser[0].name}`);
      console.log(`   Email: ${existingUser[0].email}`);
      console.log(`   Password: demo1234`);
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the user
    const [newUser] = await db.insert(whatsappUsers).values({
      name: name,
      email: email,
      whatsappNumber: `+91${Date.now().toString().slice(-10)}`, // Generate unique number
      country: 'IN',
      passwordHash: passwordHash,
      authMethods: ['password', 'email'],
      isVerified: true,
      role: 'user',
      profileComplete: false
    }).returning();

    console.log(`✅ Demo user created successfully!`);
    console.log(`   Name: ${newUser.name}`);
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Password: demo1234`);
    console.log(`\n📝 Login credentials:`);
    console.log(`   Email: demo1@wytnet.com`);
    console.log(`   Password: demo1234`);

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createDemoUser();
