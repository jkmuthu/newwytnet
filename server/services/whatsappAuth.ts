import { db } from "../db";
import { whatsappUsers, whatsappOtpSessions, tenants } from "@shared/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import type { InsertWhatsAppUser, WhatsAppUser, InsertWhatsAppOtpSession } from "@shared/schema";

// Phone number validation for Indian numbers
export function validatePhoneNumber(phone: string, country: string = 'IN'): boolean {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (country === 'IN') {
    // Indian mobile numbers: 10 digits starting with 6,7,8,9
    return /^[6-9]\d{9}$/.test(cleanPhone);
  }
  
  // Basic international validation (10-15 digits)
  return /^\d{10,15}$/.test(cleanPhone);
}

// Format phone number for consistency
export function formatPhoneNumber(phone: string, country: string = 'IN'): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (country === 'IN' && cleanPhone.length === 10) {
    return `+91${cleanPhone}`;
  }
  
  // For other countries, just add + if not present
  return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
}

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if user exists by phone number
export async function findWhatsAppUser(whatsappNumber: string): Promise<WhatsAppUser | null> {
  try {
    const [user] = await db
      .select()
      .from(whatsappUsers)
      .where(eq(whatsappUsers.whatsappNumber, whatsappNumber))
      .limit(1);
    
    return user || null;
  } catch (error) {
    console.error('Error finding WhatsApp user:', error);
    return null;
  }
}

// Create new WhatsApp user
export async function createWhatsAppUser(userData: {
  name: string;
  country: string;
  whatsappNumber: string;
  gender?: string;
  dateOfBirth?: string;
}): Promise<WhatsAppUser> {
  try {
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

    // Check if this is the super admin WhatsApp number
    const isSuperAdmin = userData.whatsappNumber === '+919345228184';
    
    // Parse date of birth if provided
    let dateOfBirth = null;
    if (userData.dateOfBirth) {
      dateOfBirth = new Date(userData.dateOfBirth);
    }

    const [user] = await db
      .insert(whatsappUsers)
      .values({
        name: userData.name,
        country: userData.country,
        whatsappNumber: userData.whatsappNumber,
        gender: userData.gender as any,
        dateOfBirth,
        role: isSuperAdmin ? 'super_admin' : 'user',
        isSuperAdmin,
        tenantId: tenant.id,
        isVerified: false,
        permissions: isSuperAdmin ? { all: true } : {},
      })
      .returning();

    return user;
  } catch (error) {
    console.error('Error creating WhatsApp user:', error);
    throw new Error('Failed to create user');
  }
}

// Generate and store OTP session
export async function createOTPSession(whatsappNumber: string): Promise<{ otp: string; sessionId: string }> {
  try {
    // Get tenant for the user
    const user = await findWhatsAppUser(whatsappNumber);
    const tenantId = user?.tenantId;
    
    if (!tenantId) {
      // Get default tenant if user doesn't exist yet
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
    }

    // Generate OTP and expiry (5 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Invalidate any existing unused OTP sessions for this number
    await db
      .update(whatsappOtpSessions)
      .set({ isUsed: true })
      .where(
        and(
          eq(whatsappOtpSessions.whatsappNumber, whatsappNumber),
          eq(whatsappOtpSessions.isUsed, false)
        )
      );

    // Create new OTP session
    const [session] = await db
      .insert(whatsappOtpSessions)
      .values({
        whatsappNumber,
        otp,
        expiresAt,
        tenantId: user?.tenantId || tenantId,
        isUsed: false,
      })
      .returning();

    return {
      otp,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('Error creating OTP session:', error);
    throw new Error('Failed to generate OTP');
  }
}

// Verify OTP and complete authentication
export async function verifyOTP(whatsappNumber: string, otp: string): Promise<WhatsAppUser | null> {
  try {
    // Find valid OTP session
    const [session] = await db
      .select()
      .from(whatsappOtpSessions)
      .where(
        and(
          eq(whatsappOtpSessions.whatsappNumber, whatsappNumber),
          eq(whatsappOtpSessions.otp, otp),
          eq(whatsappOtpSessions.isUsed, false),
          gt(whatsappOtpSessions.expiresAt, sql`now()`)
        )
      )
      .limit(1);

    if (!session) {
      return null; // Invalid or expired OTP
    }

    // Mark OTP as used
    await db
      .update(whatsappOtpSessions)
      .set({ isUsed: true })
      .where(eq(whatsappOtpSessions.id, session.id));

    // Get or update user
    let user = await findWhatsAppUser(whatsappNumber);
    
    if (user) {
      // Update last login time and mark as verified
      [user] = await db
        .update(whatsappUsers)
        .set({
          isVerified: true,
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(whatsappUsers.id, user.id))
        .returning();
    }

    return user;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return null;
  }
}

// Generate WhatsApp share link
export function generateWhatsAppLink(phoneNumber: string, otp: string): string {
  const message = `🔐 Your WytNet login OTP is: *${otp}*\n\nThis code expires in 5 minutes. Do not share this OTP with anyone.\n\nIf you didn't request this, please ignore this message.\n\n- WytNet Security Team`;
  
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  
  // Generate WhatsApp link (user sends to themselves)
  return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
}

// Clean expired OTP sessions (should be run periodically)
export async function cleanExpiredOTPSessions(): Promise<number> {
  try {
    const result = await db
      .delete(whatsappOtpSessions)
      .where(
        and(
          eq(whatsappOtpSessions.isUsed, false),
          gt(new Date(), whatsappOtpSessions.expiresAt)
        )
      )
      .returning();

    return result.length;
  } catch (error) {
    console.error('Error cleaning expired OTP sessions:', error);
    return 0;
  }
}