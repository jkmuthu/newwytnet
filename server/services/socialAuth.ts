import { db } from "../db";
import { users, socialAuthTokens, tenants } from "@shared/schema";
import type { User, UpsertUser, SocialAuthToken } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Social Auth Configuration
export const SOCIAL_PROVIDERS = {
  google: {
    name: 'Google',
    icon: 'google',
    color: 'red',
    authUrl: '/api/auth/google'
  },
  facebook: {
    name: 'Facebook', 
    icon: 'facebook',
    color: 'blue',
    authUrl: '/api/auth/facebook'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin', 
    color: 'blue',
    authUrl: '/api/auth/linkedin'
  },
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: 'pink',
    authUrl: '/api/auth/instagram'
  }
} as const;

export type SocialProvider = keyof typeof SOCIAL_PROVIDERS;

export interface SocialProfile {
  id: string;
  email?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  provider: SocialProvider;
}

// Security: REMOVED synthetic mobile generation - users must verify real mobile numbers
// Social auth users are required to verify actual mobile numbers via OTP
export function validateMobileNumber(mobile: string): boolean {
  // Validate real mobile number format (international)
  const mobileRegex = /^\+[1-9]\d{1,14}$/;
  return mobileRegex.test(mobile) && !mobile.includes('90') && !mobile.includes('91') && !mobile.includes('92') && !mobile.includes('93');
}

// Encrypt social tokens for security
export function encryptToken(token: string): string {
  // In production, use proper encryption library like crypto-js
  // For now, use basic encoding (should be replaced with AES encryption)
  return Buffer.from(token).toString('base64');
}

// Decrypt social tokens
export function decryptToken(encryptedToken: string): string {
  try {
    return Buffer.from(encryptedToken, 'base64').toString('utf-8');
  } catch {
    throw new Error('Invalid token format');
  }
}

// Create partial social user account - requires mobile verification to complete
export async function createPendingSocialUser(
  profile: SocialProfile,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }
): Promise<{ pendingUserId: string; requiresMobileVerification: boolean }> {
  try {
    // First, check if user exists by social provider ID
    const existingToken = await db
      .select()
      .from(socialAuthTokens)
      .where(
        and(
          eq(socialAuthTokens.provider, profile.provider),
          eq(socialAuthTokens.providerId, profile.id)
        )
      )
      .limit(1);

    if (existingToken.length > 0) {
      // Existing user with social auth - check if mobile is verified
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, existingToken[0].userId))
        .limit(1);

      if (existingUser) {
        if (!existingUser.isVerified || !existingUser.whatsappNumber || 
            !validateMobileNumber(existingUser.whatsappNumber)) {
          // User exists but mobile not verified - require verification
          return {
            pendingUserId: existingUser.id,
            requiresMobileVerification: true
          };
        }
        
        // User is fully verified - allow login
        await db
          .update(users)
          .set({
            lastLoginAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(users.id, existingUser.id));
          
        return {
          pendingUserId: existingUser.id,
          requiresMobileVerification: false
        };
      }
    }

    // Check if user exists by email (potential account linking)
    let existingUserByEmail = null;
    if (profile.email) {
      const emailUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, profile.email))
        .limit(1);
      
      existingUserByEmail = emailUsers[0] || null;
    }

    if (existingUserByEmail) {
      // User exists with email - link social provider but require mobile verification
      await db
        .insert(socialAuthTokens)
        .values({
          userId: existingUserByEmail.id,
          provider: profile.provider,
          providerId: profile.id,
          accessToken: encryptToken(tokens.accessToken),
          refreshToken: tokens.refreshToken ? encryptToken(tokens.refreshToken) : null,
          expiresAt: tokens.expiresAt
        });

      // Update social providers
      const socialProviders = Array.isArray(existingUserByEmail.socialProviders) 
        ? existingUserByEmail.socialProviders as string[]
        : [];
      const updatedSocialProviders = socialProviders.includes(profile.provider)
        ? socialProviders
        : [...socialProviders, profile.provider];

      await db
        .update(users)
        .set({
          socialProviders: updatedSocialProviders,
          profileImageUrl: profile.profileImageUrl || existingUserByEmail.profileImageUrl,
          updatedAt: new Date()
        })
        .where(eq(users.id, existingUserByEmail.id));

      return {
        pendingUserId: existingUserByEmail.id,
        requiresMobileVerification: !existingUserByEmail.isVerified
      };
    } else {
      // Create new pending user - REQUIRES mobile verification
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
            name: 'WytNet Community',
            slug: 'default',
            status: 'active',
          })
          .returning();
      }

      // Create UNVERIFIED user account - mobile verification required
      const userData = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: profile.name,
        whatsappNumber: '', // Empty until verified
        email: profile.email,
        profileImageUrl: profile.profileImageUrl,
        tenantId: tenant.id,
        role: 'user' as const,
        isVerified: false, // SECURITY: Must verify mobile before activation
        socialProviders: [profile.provider],
        authMethods: [], // Empty until mobile verified
        lastLoginAt: new Date()
      };

      const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();

      // Store encrypted social tokens
      await db
        .insert(socialAuthTokens)
        .values({
          userId: newUser.id,
          provider: profile.provider,
          providerId: profile.id,
          accessToken: encryptToken(tokens.accessToken),
          refreshToken: tokens.refreshToken ? encryptToken(tokens.refreshToken) : null,
          expiresAt: tokens.expiresAt
        });

      return {
        pendingUserId: newUser.id,
        requiresMobileVerification: true
      };
    }
  } catch (error) {
    console.error('Error creating pending social user:', error);
    throw new Error('Failed to process social authentication');
  }
}

// Hash password for password-based auth
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password for password-based auth
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Get user's social tokens
export async function getUserSocialTokens(userId: string): Promise<SocialAuthToken[]> {
  return await db
    .select()
    .from(socialAuthTokens)
    .where(eq(socialAuthTokens.userId, userId));
}

// Unlink social provider
export async function unlinkSocialProvider(userId: string, provider: SocialProvider): Promise<void> {
  await db
    .delete(socialAuthTokens)
    .where(
      and(
        eq(socialAuthTokens.userId, userId),
        eq(socialAuthTokens.provider, provider)
      )
    );

  // Update user's social providers and auth methods
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user) {
    const socialProviders = Array.isArray(user.socialProviders) ? user.socialProviders as string[] : [];
    const authMethods = Array.isArray(user.authMethods) ? user.authMethods as string[] : [];
    const updatedSocialProviders = socialProviders.filter(p => p !== provider);
    const updatedAuthMethods = authMethods.filter(m => m !== provider);

    await db
      .update(users)
      .set({
        socialProviders: updatedSocialProviders,
        authMethods: updatedAuthMethods,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }
}

// Complete social account setup after mobile verification
export async function completeSocialAccountSetup(
  socialUserId: string, 
  verifiedMobileNumber: string
): Promise<User> {
  // Validate mobile number format
  if (!validateMobileNumber(verifiedMobileNumber)) {
    throw new Error('Invalid mobile number format');
  }

  // Check if mobile is already in use
  const existingMobile = await db
    .select()
    .from(users)
    .where(eq(users.whatsappNumber, verifiedMobileNumber))
    .limit(1);

  if (existingMobile.length > 0 && existingMobile[0].id !== socialUserId) {
    throw new Error('Mobile number already registered to another account');
  }

  // Get user's social providers
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, socialUserId))
    .limit(1);

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Complete account setup with verified mobile
  const socialProviders = Array.isArray(existingUser.socialProviders) ? existingUser.socialProviders as string[] : [];
  const [user] = await db
    .update(users)
    .set({
      whatsappNumber: verifiedMobileNumber,
      isVerified: true, // Now verified via mobile OTP
      authMethods: ['whatsapp', ...socialProviders],
      updatedAt: new Date()
    })
    .where(eq(users.id, socialUserId))
    .returning();

  return user;
}

// Get pending social verification status
export async function getPendingSocialVerification(userId: string): Promise<{
  user: User | null;
  socialProviders: string[];
  requiresMobileVerification: boolean;
}> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return {
      user: null,
      socialProviders: [],
      requiresMobileVerification: false
    };
  }

  const socialProviders = Array.isArray(user.socialProviders) ? user.socialProviders as string[] : [];
  return {
    user,
    socialProviders,
    requiresMobileVerification: !user.isVerified || !validateMobileNumber(user.whatsappNumber || '')
  };
}