import { db } from "../server/db";
import { whatsappUsers } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

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
      
      // Update password hash to use scrypt
      const passwordHash = await hashPassword(password);
      await db.update(whatsappUsers)
        .set({ passwordHash })
        .where(eq(whatsappUsers.email, email));
      
      console.log(`✅ Password hash updated to use scrypt`);
      return;
    }

    // Hash the password using scrypt
    const passwordHash = await hashPassword(password);

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
