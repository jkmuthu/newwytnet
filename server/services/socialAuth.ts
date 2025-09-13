import { db } from "../db";
import { whatsappUsers, socialAuthTokens, tenants } from "@shared/schema";
import type { WhatsAppUser, InsertWhatsAppUser, SocialAuthToken } from "@shared/schema";
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

// Generate a mobile number from social profile email or create a placeholder
export function generateMobileFromSocial(profile: SocialProfile, provider: SocialProvider): string {
  // For demo purposes, we'll create a mobile number format
  // In production, this would prompt user to enter their mobile number
  const providerId = profile.id.slice(-6); // Last 6 digits of social ID
  const providerCode = {
    google: '90',
    facebook: '91', 
    linkedin: '92',
    instagram: '93'
  }[provider];
  
  return `+91${providerCode}${providerId}`;
}

// Create or update user from social auth
export async function createOrUpdateSocialUser(
  profile: SocialProfile,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }
): Promise<WhatsAppUser> {
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

    let user: WhatsAppUser;

    if (existingToken.length > 0) {
      // Update existing user
      const [existingUser] = await db
        .select()
        .from(whatsappUsers)
        .where(eq(whatsappUsers.id, existingToken[0].userId))
        .limit(1);

      if (existingUser) {
        // Update user profile with latest social data
        [user] = await db
          .update(whatsappUsers)
          .set({
            name: profile.name,
            email: profile.email,
            profileImageUrl: profile.profileImageUrl,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
            // Add social provider if not already present
            socialProviders: existingUser.socialProviders?.includes(profile.provider) 
              ? existingUser.socialProviders 
              : [...(existingUser.socialProviders || []), profile.provider],
            authMethods: existingUser.authMethods?.includes(profile.provider)
              ? existingUser.authMethods
              : [...(existingUser.authMethods || []), profile.provider]
          })
          .where(eq(whatsappUsers.id, existingUser.id))
          .returning();
      } else {
        throw new Error('User not found for existing social token');
      }

      // Update social token
      await db
        .update(socialAuthTokens)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
          updatedAt: new Date()
        })
        .where(eq(socialAuthTokens.id, existingToken[0].id));

    } else {
      // Check if user exists by email (link accounts)
      let existingUserByEmail = null;
      if (profile.email) {
        const emailUsers = await db
          .select()
          .from(whatsappUsers)
          .where(eq(whatsappUsers.email, profile.email))
          .limit(1);
        
        existingUserByEmail = emailUsers[0] || null;
      }

      if (existingUserByEmail) {
        // Link social account to existing user
        user = existingUserByEmail;
        
        // Update user with social info
        [user] = await db
          .update(whatsappUsers)
          .set({
            profileImageUrl: profile.profileImageUrl || user.profileImageUrl,
            socialProviders: user.socialProviders?.includes(profile.provider)
              ? user.socialProviders
              : [...(user.socialProviders || []), profile.provider],
            authMethods: user.authMethods?.includes(profile.provider)
              ? user.authMethods
              : [...(user.authMethods || []), profile.provider],
            lastLoginAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(whatsappUsers.id, user.id))
          .returning();
      } else {
        // Create new user
        const generatedMobile = generateMobileFromSocial(profile, profile.provider);
        
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

        const userData: InsertWhatsAppUser = {
          name: profile.name,
          whatsappNumber: generatedMobile,
          email: profile.email,
          profileImageUrl: profile.profileImageUrl,
          tenantId: tenant.id,
          role: 'user',
          isVerified: true, // Social auth users are pre-verified
          socialProviders: [profile.provider],
          authMethods: [profile.provider],
          lastLoginAt: new Date()
        };

        [user] = await db
          .insert(whatsappUsers)
          .values(userData)
          .returning();
      }

      // Create social auth token
      await db
        .insert(socialAuthTokens)
        .values({
          userId: user.id,
          provider: profile.provider,
          providerId: profile.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt
        });
    }

    return user;
  } catch (error) {
    console.error('Error creating/updating social user:', error);
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
    .from(whatsappUsers)
    .where(eq(whatsappUsers.id, userId))
    .limit(1);

  if (user) {
    const updatedSocialProviders = (user.socialProviders || []).filter(p => p !== provider);
    const updatedAuthMethods = (user.authMethods || []).filter(m => m !== provider);

    await db
      .update(whatsappUsers)
      .set({
        socialProviders: updatedSocialProviders,
        authMethods: updatedAuthMethods,
        updatedAt: new Date()
      })
      .where(eq(whatsappUsers.id, userId));
  }
}

// Link mobile number to social account (for verification)
export async function linkMobileToSocialAccount(
  socialUserId: string, 
  mobileNumber: string
): Promise<WhatsAppUser> {
  const [user] = await db
    .update(whatsappUsers)
    .set({
      whatsappNumber: mobileNumber,
      authMethods: ['whatsapp', ...(user.authMethods || [])],
      updatedAt: new Date()
    })
    .where(eq(whatsappUsers.id, socialUserId))
    .returning();

  return user;
}