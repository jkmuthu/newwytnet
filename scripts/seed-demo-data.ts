import { db } from "../server/db";
import { 
  whatsappUsers, 
  userProfiles, 
  pointsWallets, 
  pointsTransactions,
  pointsConfig,
  organizations,
  organizationMembers,
  payments,
  orders,
  userAppSubscriptions,
  entitlements
} from "../shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDemoData() {
  try {
    console.log("🌱 Starting comprehensive demo data seeding...\n");

    // ========================================
    // 1. CREATE DEMO USERS
    // ========================================
    console.log("👥 Creating demo users...");

    const demoUsers = [
      {
        id: 'demo-user-001',
        name: 'Sarah Johnson',
        email: 'sarah@wytnet.com',
        whatsappNumber: '+919876543210',
        password: 'Demo@123',
        country: 'IN',
        gender: 'female' as const,
        role: 'user' as const,
        authMethods: ['password', 'email'],
        socialProviders: [],
        isVerified: true,
        profileComplete: true,
        referralCode: 'SARAH2024'
      },
      {
        id: 'demo-user-002',
        name: 'Rajesh Kumar',
        email: 'rajesh@wytnet.com',
        whatsappNumber: '+919876543211',
        password: 'Demo@123',
        country: 'IN',
        gender: 'male' as const,
        role: 'user' as const,
        authMethods: ['google', 'password'],
        socialProviders: ['google'],
        isVerified: true,
        profileComplete: true,
        referralCode: 'RAJESH2024',
        referredBy: 'SARAH2024' // Referred by Sarah
      },
      {
        id: 'demo-user-003',
        name: 'Priya Sharma',
        email: 'priya@wytnet.com',
        whatsappNumber: '+919876543212',
        password: 'Demo@123',
        country: 'IN',
        gender: 'female' as const,
        role: 'user' as const,
        authMethods: ['email'],
        socialProviders: [],
        isVerified: true,
        profileComplete: false,
        referralCode: 'PRIYA2024',
        referredBy: 'SARAH2024' // Referred by Sarah
      },
      {
        id: 'demo-user-004',
        name: 'Michael Chen',
        email: 'michael@wytnet.com',
        whatsappNumber: '+919876543213',
        password: 'Demo@123',
        country: 'IN',
        gender: 'male' as const,
        role: 'manager' as const,
        authMethods: ['google', 'password'],
        socialProviders: ['google'],
        isVerified: true,
        profileComplete: true,
        referralCode: 'MICHAEL2024'
      }
    ];

    for (const userData of demoUsers) {
      // Check if user already exists by email or whatsapp number
      const existingByEmail = userData.email ? await db
        .select()
        .from(whatsappUsers)
        .where(eq(whatsappUsers.email, userData.email))
        .limit(1) : [];
      
      const existingByPhone = await db
        .select()
        .from(whatsappUsers)
        .where(eq(whatsappUsers.whatsappNumber, userData.whatsappNumber))
        .limit(1);

      if (existingByEmail.length === 0 && existingByPhone.length === 0) {
        const passwordHash = await hashPassword(userData.password);
        
        await db.insert(whatsappUsers).values({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          whatsappNumber: userData.whatsappNumber,
          passwordHash,
          country: userData.country,
          gender: userData.gender,
          role: userData.role,
          authMethods: userData.authMethods,
          socialProviders: userData.socialProviders,
          isVerified: userData.isVerified,
          profileComplete: userData.profileComplete,
          referralCode: userData.referralCode,
          referredBy: userData.referredBy,
          lastLoginAt: new Date(),
        });
        console.log(`  ✅ Created user: ${userData.name} (${userData.email})`);
      } else {
        console.log(`  ⏭️  User already exists: ${userData.name} (${userData.email || userData.whatsappNumber})`);
      }
    }

    // ========================================
    // 2. CREATE USER PROFILES
    // ========================================
    console.log("\n📝 Creating user profiles...");

    // Fetch actual user IDs from database
    const sarahUser = await db.select().from(whatsappUsers).where(eq(whatsappUsers.email, 'sarah@wytnet.com')).limit(1);
    const rajeshUser = await db.select().from(whatsappUsers).where(eq(whatsappUsers.email, 'rajesh@wytnet.com')).limit(1);
    const priyaUser = await db.select().from(whatsappUsers).where(eq(whatsappUsers.email, 'priya@wytnet.com')).limit(1);
    const michaelUser = await db.select().from(whatsappUsers).where(eq(whatsappUsers.email, 'michael@wytnet.com')).limit(1);

    // Skip if users don't exist
    if (!sarahUser[0] || !rajeshUser[0] || !priyaUser[0] || !michaelUser[0]) {
      console.log("  ⚠️  Some demo users not found, skipping remaining data...");
      return;
    }

    const profilesData = [
      {
        userId: sarahUser[0].id,
        username: 'sarahjohnson',
        // Personal Tab fields
        nickName: 'Sarah',
        bio: 'Digital marketing enthusiast and content creator. Love exploring new tools and sharing knowledge!',
        mobileNumber: '+919876543210',
        gender: 'female',
        dateOfBirth: new Date('1992-05-15'),
        maritalStatus: 'single',
        motherTongue: 'English',
        homeLocation: 'Pune, Maharashtra',
        livingIn: 'Mumbai, Maharashtra',
        languagesKnown: [
          { code: 'en', name: 'English', speak: true, write: true },
          { code: 'hi', name: 'Hindi', speak: true, write: true },
          { code: 'mr', name: 'Marathi', speak: true, write: false }
        ],
        privacySettings: {
          email: 'public',
          mobileNumber: 'private',
          gender: 'public',
          dateOfBirth: 'private',
          maritalStatus: 'public'
        },
        // Professional fields
        location: 'Mumbai, Maharashtra',
        website: 'https://sarahjohnson.com',
        company: 'Digital Dynamics Ltd',
        jobTitle: 'Senior Marketing Manager',
        phone: '+919876543210',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'IN',
        skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Social Media'],
        interests: ['Technology', 'Travel', 'Photography'],
        profileCompletionPercentage: 95,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/sarahjohnson',
          twitter: 'https://twitter.com/sarahjohnson'
        }
      },
      {
        userId: rajeshUser[0]?.id,
        username: 'rajeshkumar',
        // Personal Tab fields
        nickName: 'Raj',
        bio: 'Full-stack developer passionate about building scalable web applications. Tech speaker and open-source contributor.',
        mobileNumber: '+919876543211',
        gender: 'male',
        dateOfBirth: new Date('1988-11-20'),
        maritalStatus: 'married',
        motherTongue: 'Tamil',
        homeLocation: 'Chennai, Tamil Nadu',
        livingIn: 'Bangalore, Karnataka',
        languagesKnown: [
          { code: 'en', name: 'English', speak: true, write: true },
          { code: 'ta', name: 'Tamil', speak: true, write: true },
          { code: 'kn', name: 'Kannada', speak: true, write: false }
        ],
        privacySettings: {
          email: 'public',
          mobileNumber: 'private',
          gender: 'public',
          dateOfBirth: 'private',
          maritalStatus: 'public'
        },
        // Professional fields
        location: 'Bangalore, Karnataka',
        website: 'https://rajeshkumar.dev',
        company: 'Tech Innovators Pvt Ltd',
        jobTitle: 'Lead Software Engineer',
        phone: '+919876543211',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'IN',
        skills: ['React', 'Node.js', 'Python', 'AWS', 'PostgreSQL'],
        interests: ['Coding', 'AI/ML', 'Gaming'],
        profileCompletionPercentage: 90,
        socialLinks: {
          github: 'https://github.com/rajeshkumar',
          linkedin: 'https://linkedin.com/in/rajeshkumar'
        }
      },
      {
        userId: priyaUser[0]?.id,
        username: 'priyasharma',
        // Personal Tab fields
        nickName: 'Pri',
        bio: 'Product designer creating delightful user experiences. Love colors, typography, and solving user problems!',
        mobileNumber: '+919876543212',
        gender: 'female',
        dateOfBirth: new Date('1995-03-08'),
        maritalStatus: 'single',
        motherTongue: 'Hindi',
        homeLocation: 'Jaipur, Rajasthan',
        livingIn: 'New Delhi, Delhi',
        languagesKnown: [
          { code: 'en', name: 'English', speak: true, write: true },
          { code: 'hi', name: 'Hindi', speak: true, write: true }
        ],
        privacySettings: {
          email: 'public',
          mobileNumber: 'private',
          gender: 'public',
          dateOfBirth: 'private',
          maritalStatus: 'private'
        },
        // Professional fields
        location: 'Delhi NCR',
        company: 'Creative Solutions Inc',
        jobTitle: 'UI/UX Designer',
        phone: '+919876543212',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'IN',
        skills: ['UI/UX Design', 'Figma', 'User Research'],
        interests: ['Design', 'Art'],
        profileCompletionPercentage: 60,
        socialLinks: {
          behance: 'https://behance.net/priyasharma'
        }
      },
      {
        userId: michaelUser[0]?.id,
        username: 'michaelchen',
        // Personal Tab fields
        nickName: 'Mike',
        bio: 'Startup founder and tech entrepreneur. Building the future of SaaS. Angel investor and mentor.',
        mobileNumber: '+919876543213',
        gender: 'male',
        dateOfBirth: new Date('1985-09-12'),
        maritalStatus: 'married',
        motherTongue: 'English',
        homeLocation: 'San Francisco, USA',
        livingIn: 'Pune, Maharashtra',
        languagesKnown: [
          { code: 'en', name: 'English', speak: true, write: true },
          { code: 'zh', name: 'Chinese', speak: true, write: true },
          { code: 'hi', name: 'Hindi', speak: true, write: false }
        ],
        privacySettings: {
          email: 'public',
          mobileNumber: 'private',
          gender: 'public',
          dateOfBirth: 'private',
          maritalStatus: 'public'
        },
        // Professional fields
        location: 'Pune, Maharashtra',
        website: 'https://michaelchen.io',
        company: 'NextGen Ventures',
        jobTitle: 'CEO & Founder',
        phone: '+919876543213',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'IN',
        skills: ['Business Strategy', 'Product Management', 'Leadership'],
        interests: ['Startups', 'Innovation', 'Investing'],
        profileCompletionPercentage: 85,
        socialLinks: {
          linkedin: 'https://linkedin.com/in/michaelchen',
          twitter: 'https://twitter.com/michaelchen'
        }
      }
    ];

    for (const profile of profilesData) {
      const existing = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, profile.userId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(userProfiles).values(profile);
        console.log(`  ✅ Created profile for: ${profile.username}`);
      } else {
        console.log(`  ⏭️  Profile already exists for: ${profile.username}`);
      }
    }

    // ========================================
    // 3. SETUP WYTPOINTS ECONOMY
    // ========================================
    console.log("\n💰 Setting up WytPoints economy...");

    // Create points config if not exists
    const configActions = [
      { action: 'registration', points: 100, description: 'Welcome bonus for new users', category: 'onboarding' },
      { action: 'profile_complete', points: 50, description: 'Complete your profile', category: 'onboarding' },
      { action: 'referral_bonus', points: 25, description: 'Bonus for successful referral', category: 'referral' },
      { action: 'daily_login', points: 5, description: 'Daily login streak bonus', category: 'engagement' },
    ];

    for (const config of configActions) {
      const existing = await db
        .select()
        .from(pointsConfig)
        .where(eq(pointsConfig.action, config.action))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(pointsConfig).values(config);
      }
    }

    // Create wallets and transactions
    const walletData = [
      { userId: sarahUser[0]?.id, balance: 550, lifetimeEarned: 850, lifetimeSpent: 300 },
      { userId: rajeshUser[0]?.id, balance: 225, lifetimeEarned: 375, lifetimeSpent: 150 },
      { userId: priyaUser[0]?.id, balance: 175, lifetimeEarned: 225, lifetimeSpent: 50 },
      { userId: michaelUser[0]?.id, balance: 800, lifetimeEarned: 1200, lifetimeSpent: 400 },
    ];

    for (const wallet of walletData) {
      const existing = await db
        .select()
        .from(pointsWallets)
        .where(eq(pointsWallets.userId, wallet.userId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(pointsWallets).values(wallet);
        console.log(`  ✅ Created wallet for user: ${wallet.userId} (${wallet.balance} points)`);
      }
    }

    // Create sample transactions
    const transactions = [
      // Sarah's transactions
      { userId: sarahUser[0]?.id, amount: 100, balanceAfter: 100, type: 'registration', description: 'Welcome bonus' },
      { userId: sarahUser[0]?.id, amount: 50, balanceAfter: 150, type: 'profile_complete', description: 'Profile completed' },
      { userId: sarahUser[0]?.id, amount: 25, balanceAfter: 175, type: 'referral_bonus', description: 'Referral bonus for Rajesh' },
      { userId: sarahUser[0]?.id, amount: 25, balanceAfter: 200, type: 'referral_bonus', description: 'Referral bonus for Priya' },
      { userId: sarahUser[0]?.id, amount: -50, balanceAfter: 150, type: 'app_purchase', description: 'QR Generator Pro subscription' },
      
      // Rajesh's transactions
      { userId: rajeshUser[0]?.id, amount: 100, balanceAfter: 100, type: 'registration', description: 'Welcome bonus' },
      { userId: rajeshUser[0]?.id, amount: 50, balanceAfter: 150, type: 'profile_complete', description: 'Profile completed' },
      { userId: rajeshUser[0]?.id, amount: 25, balanceAfter: 175, type: 'referred_by', description: 'Joined via Sarah\'s referral' },
      
      // Priya's transactions  
      { userId: priyaUser[0]?.id, amount: 100, balanceAfter: 100, type: 'registration', description: 'Welcome bonus' },
      { userId: priyaUser[0]?.id, amount: 25, balanceAfter: 125, type: 'referred_by', description: 'Joined via Sarah\'s referral' },
      
      // Michael's transactions
      { userId: michaelUser[0]?.id, amount: 100, balanceAfter: 100, type: 'registration', description: 'Welcome bonus' },
      { userId: michaelUser[0]?.id, amount: 50, balanceAfter: 150, type: 'profile_complete', description: 'Profile completed' },
      { userId: michaelUser[0]?.id, amount: -100, balanceAfter: 50, type: 'app_purchase', description: 'Premium apps bundle' },
    ];

    for (const txn of transactions) {
      await db.insert(pointsTransactions).values({
        ...txn,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
      });
    }
    console.log(`  ✅ Created ${transactions.length} point transactions`);

    // ========================================
    // 4. CREATE ORGANIZATIONS
    // ========================================
    console.log("\n🏢 Creating organizations...");

    const orgs = [
      {
        name: 'Digital Dynamics Ltd',
        slug: 'digital-dynamics',
        ownerId: sarahUser[0]?.id,
        description: 'Leading digital marketing agency helping brands grow online',
        logo: 'https://ui-avatars.com/api/?name=Digital+Dynamics&background=0D8ABC&color=fff',
      },
      {
        name: 'Tech Innovators Pvt Ltd',
        slug: 'tech-innovators',
        ownerId: rajeshUser[0]?.id,
        description: 'Building cutting-edge web and mobile applications',
        logo: 'https://ui-avatars.com/api/?name=Tech+Innovators&background=7C3AED&color=fff',
      },
      {
        name: 'NextGen Ventures',
        slug: 'nextgen-ventures',
        ownerId: michaelUser[0]?.id,
        description: 'Venture capital firm investing in early-stage startups',
        logo: 'https://ui-avatars.com/api/?name=NextGen+Ventures&background=059669&color=fff',
      }
    ];

    const createdOrgs: any[] = [];
    for (const org of orgs) {
      const existing = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, org.slug))
        .limit(1);

      if (existing.length === 0) {
        const [created] = await db.insert(organizations).values(org).returning();
        createdOrgs.push(created);
        console.log(`  ✅ Created organization: ${org.name}`);
      } else {
        createdOrgs.push(existing[0]);
        console.log(`  ⏭️  Organization already exists: ${org.name}`);
      }
    }

    // Create organization memberships using actual IDs
    const memberships = [
      // Digital Dynamics team
      { organizationId: createdOrgs[0]?.id, userId: sarahUser[0]?.id, role: 'owner' },
      { organizationId: createdOrgs[0]?.id, userId: priyaUser[0]?.id, role: 'member' },
      
      // Tech Innovators team
      { organizationId: createdOrgs[1]?.id, userId: rajeshUser[0]?.id, role: 'owner' },
      { organizationId: createdOrgs[1]?.id, userId: michaelUser[0]?.id, role: 'admin' },
      
      // NextGen Ventures team
      { organizationId: createdOrgs[2]?.id, userId: michaelUser[0]?.id, role: 'owner' },
      { organizationId: createdOrgs[2]?.id, userId: sarahUser[0]?.id, role: 'member' },
    ];

    for (const membership of memberships) {
      const existing = await db
        .select()
        .from(organizationMembers)
        .where(eq(organizationMembers.organizationId, membership.organizationId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(organizationMembers).values(membership);
      }
    }
    console.log(`  ✅ Created ${memberships.length} organization memberships`);

    // ========================================
    // 5. CREATE SAMPLE PAYMENTS & ORDERS
    // ========================================
    console.log("\n💳 Creating payment history...");

    const sampleOrders = [
      {
        userId: sarahUser[0]?.id,
        orderNumber: 'WYT-2024-001',
        status: 'delivered' as const,
        subtotal: '499.00',
        tax: '89.82',
        total: '588.82',
        currency: 'INR',
        items: [{ name: 'QR Generator Pro', quantity: 1, price: 499 }]
      },
      {
        userId: michaelUser[0]?.id,
        orderNumber: 'WYT-2024-002',
        status: 'delivered' as const,
        subtotal: '1999.00',
        tax: '359.82',
        total: '2358.82',
        currency: 'INR',
        items: [{ name: 'Premium Apps Bundle', quantity: 1, price: 1999 }]
      },
      {
        userId: rajeshUser[0]?.id,
        orderNumber: 'WYT-2024-003',
        status: 'pending' as const,
        subtotal: '299.00',
        tax: '53.82',
        total: '352.82',
        currency: 'INR',
        items: [{ name: 'Starter Plan', quantity: 1, price: 299 }]
      }
    ];

    const createdOrders: any[] = [];
    for (const order of sampleOrders) {
      const existing = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, order.orderNumber))
        .limit(1);

      if (existing.length === 0) {
        const [created] = await db.insert(orders).values(order).returning();
        createdOrders.push(created);
      } else {
        createdOrders.push(existing[0]);
      }
    }

    const samplePayments = [
      {
        orderId: createdOrders[0]?.id,
        userId: sarahUser[0]?.id,
        provider: 'razorpay',
        providerPaymentId: 'pay_demo001',
        providerOrderId: 'order_demo001',
        amount: '588.82',
        currency: 'INR',
        status: 'completed' as const,
        method: 'upi',
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        orderId: createdOrders[1]?.id,
        userId: michaelUser[0]?.id,
        provider: 'razorpay',
        providerPaymentId: 'pay_demo002',
        providerOrderId: 'order_demo002',
        amount: '2358.82',
        currency: 'INR',
        status: 'completed' as const,
        method: 'card',
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        orderId: createdOrders[2]?.id,
        userId: rajeshUser[0]?.id,
        provider: 'razorpay',
        providerOrderId: 'order_demo003',
        amount: '352.82',
        currency: 'INR',
        status: 'pending' as const,
        method: null,
      }
    ];

    for (const payment of samplePayments) {
      const existing = await db
        .select()
        .from(payments)
        .where(eq(payments.providerOrderId, payment.providerOrderId || ''))
        .limit(1);
      
      if (existing.length === 0) {
        await db.insert(payments).values(payment);
      }
    }
    console.log(`  ✅ Created ${samplePayments.length} payment records`);

    // ========================================
    // COMPLETION
    // ========================================
    console.log("\n✨ Demo data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - Created ${demoUsers.length} demo users`);
    console.log(`  - Created ${profilesData.length} user profiles`);
    console.log(`  - Setup WytPoints with ${walletData.length} wallets and ${transactions.length} transactions`);
    console.log(`  - Created ${orgs.length} organizations with ${memberships.length} members`);
    console.log(`  - Created ${sampleOrders.length} orders and ${samplePayments.length} payments`);
    console.log("\n🔐 Demo User Credentials:");
    console.log("  - sarah@wytnet.com / Demo@123");
    console.log("  - rajesh@wytnet.com / Demo@123");
    console.log("  - priya@wytnet.com / Demo@123");
    console.log("  - michael@wytnet.com / Demo@123");
    console.log("\n");

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (import.meta.url.endsWith(process.argv[1])) {
  seedDemoData();
}

export { seedDemoData };
