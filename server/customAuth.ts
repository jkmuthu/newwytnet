import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { z } from "zod";
import { verifyPassword, hashPassword } from "./services/socialAuth";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, type User } from "@shared/schema";

// Extended session interface to support additional session properties
declare module 'express-session' {
  interface SessionData {
    user?: {
      type: 'whatsapp' | 'legacy' | 'replit';
      id: string;
      tenantId: string;
      role?: string;
      isSuperAdmin?: boolean;
      provider?: string;
    };
    whatsappUserId?: string;
    whatsappNumber?: string;
    isWhatsAppAuth?: boolean;
    superAdminAuth?: boolean;
    adminUserId?: string;
    adminRole?: string;
    adminName?: string;
  }
}

// Extended Principal interface to support all provider types
export interface Principal {
  id: string;
  tenantId: string;
  role?: string;
  isSuperAdmin?: boolean;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  profileImageUrl?: string;
  provider: 'whatsapp' | 'legacy' | 'replit' | 'admin' | 'unified' | 'hub_admin';
  claims?: { sub: string; [key: string]: any };
}

// Request interface extension for authenticated requests
export interface AuthenticatedRequest extends Omit<Express.Request, 'user'> {
  user?: Principal;
}

// Session structure with provider type for unified handling
export interface SessionUser {
  type: 'whatsapp' | 'legacy';
  id: string;
  tenantId: string;
  role?: string;
  isSuperAdmin?: boolean;
}

// Helper function to format phone number
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let formatted = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, add country code
  if (!formatted.startsWith('+')) {
    // Assume Indian number if not international format
    formatted = '+91' + formatted;
  }
  
  return formatted;
}

// Helper function to normalize user data into Principal DTO
function createPrincipal(user: User, provider: 'whatsapp' | 'legacy' | 'replit' | 'admin' | 'unified' | 'hub_admin'): Principal {
  return {
    id: user.id,
    tenantId: user.tenantId || '',
    role: user.role || 'user',
    isSuperAdmin: user.isSuperAdmin || false,
    email: user.email || undefined,
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    mobileNumber: user.whatsappNumber || undefined,
    profileImageUrl: user.profileImageUrl || undefined,
    provider
  };
}

// Helper function to resolve user from session
export async function resolveUserFromSession(sessionUser: any): Promise<Principal | null> {
  try {
    // Handle new session format with type
    if (sessionUser.type) {
      const typedSession = sessionUser as SessionUser;
      
      if (typedSession.type === 'whatsapp' || typedSession.type === 'legacy') {
        // Query unified users table
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, typedSession.id))
          .limit(1);
        
        if (user) {
          return createPrincipal(user, typedSession.type);
        }
      }
      
      return null;
    }
    
    // Handle legacy session format for backward compatibility
    // Query unified users table
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionUser.id))
      .limit(1);
    
    if (user) {
      // Determine provider based on user data
      const provider = user.whatsappNumber ? 'whatsapp' : 'legacy';
      return createPrincipal(user, provider);
    }
    
    return null;
  } catch (error) {
    console.error('Error resolving user from session:', error);
    return null;
  }
}

// Rate limiting store (in production, use Redis or database)
const rateLimitMap = new Map<string, { attempts: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Rate limiting helper
function checkRateLimit(key: string): { allowed: boolean; remaining?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record) {
    rateLimitMap.set(key, { attempts: 1, lastAttempt: now });
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  // Reset if window has passed
  if (now - record.lastAttempt > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { attempts: 1, lastAttempt: now });
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  // Check if exceeded limit
  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    return { allowed: false };
  }
  
  // Increment attempts
  record.attempts++;
  record.lastAttempt = now;
  
  return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - record.attempts };
}

// Reset rate limit on successful login
function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

// Simple session configuration
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // SECURITY FIX: Require SESSION_SECRET in production to prevent security vulnerabilities
  if (!process.env.SESSION_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable is required in production. Set a strong random secret.');
    } else {
      // For development, generate a random secret (will invalidate sessions on restart)
      console.warn('⚠️  SESSION_SECRET not set. Using temporary random secret for development.');
      console.warn('   Sessions will be invalidated on server restart.');
      console.warn('   Set SESSION_SECRET environment variable for persistent sessions.');
    }
  }
  
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  // Use provided secret or generate secure random one for development
  const sessionSecret = process.env.SESSION_SECRET || 
    require('crypto').randomBytes(64).toString('hex');
  
  return session({
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      domain: process.env.NODE_ENV === 'production' ? '.wytnet.com' : undefined,
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
    },
  });
}

// User registration/login schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  company: z.string().optional(),
});

// Legacy email-based login (for backward compatibility)
const emailLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// NEW: Unified mobile number login schema
const mobileLoginSchema = z.object({
  mobileNumber: z.string().min(10, "Mobile number is required"),
  password: z.string().min(1, "Password is required"),
});

export async function setupAuth(app: Express) {
  // UNIFIED AUTH FIX: Session middleware now handled by setupWytPassAuth
  // Removed duplicate app.use(getSession()) to prevent session conflicts
  
  // Simple registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password for security
      const passwordHash = await hashPassword(validatedData.password);

      // Create user with tenant
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tenantId = `ten_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create tenant first
      await storage.createTenant({
        id: tenantId,
        name: validatedData.company || `${validatedData.firstName}'s Organization`,
        domain: validatedData.email.split('@')[1] || 'local.dev',
        settings: {},
        isActive: true,
      });

      // Create user with hashed password
      const user = await storage.upsertUser({
        id: userId,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        passwordHash: passwordHash,
        tenantId: tenantId,
      });

      // NOTE: WytPoints are only available for WhatsApp-authenticated users
      // Legacy email/password users do not receive points

      // Set session with new unified format
      (req.session as any).user = { 
        type: 'legacy' as const,
        id: userId, 
        tenantId 
      };

      res.json({ 
        message: "Registration successful", 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          tenantId: user.tenantId
        }
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      // Handle unique constraint violations
      if (error.code === '23505') { // PostgreSQL unique violation
        if (error.constraint === 'users_email_unique') {
          return res.status(400).json({ message: "Email address is already registered" });
        }
        if (error.constraint === 'users_whatsapp_number_unique') {
          return res.status(400).json({ message: "WhatsApp number is already registered" });
        }
        if (error.constraint === 'users_display_id_unique') {
          return res.status(400).json({ message: "User ID already exists" });
        }
        return res.status(400).json({ message: "This information is already registered" });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // NEW: Unified mobile number login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      // Try mobile number login first
      const mobileValidation = mobileLoginSchema.safeParse(req.body);
      
      if (mobileValidation.success) {
        const { mobileNumber, password } = mobileValidation.data;
        
        // Format the mobile number consistently
        const formattedNumber = formatPhoneNumber(mobileNumber);
        
        // Find user by mobile number using direct db query
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.whatsappNumber, formattedNumber))
          .limit(1);
        
        if (!user) {
          return res.status(401).json({ message: "Invalid mobile number or password" });
        }

        // Check if user has password set and verify it
        if (!user.passwordHash) {
          return res.status(401).json({ 
            message: "Password not set. Please use OTP login or set up password first." 
          });
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid mobile number or password" });
        }

        // Award +1 point for login (WhatsApp user)
        try {
          const { pointsService } = await import('./services/pointsService');
          await pointsService.creditPoints({
            userId: user.id,
            amount: 1,
            type: 'login',
            description: 'Daily login reward',
          });
          console.log(`✅ Awarded +1 login point to user ${user.id}`);
        } catch (error) {
          console.error('Failed to award login points:', error);
          // Don't throw - login succeeded
        }

        // Set session with new unified format
        (req.session as any).user = { 
          type: 'whatsapp' as const,
          id: user.id, 
          tenantId: user.tenantId,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin
        };

        res.json({ 
          message: "Login successful", 
          user: {
            id: user.id,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            mobileNumber: user.whatsappNumber,
            role: user.role,
            isSuperAdmin: user.isSuperAdmin,
            tenantId: user.tenantId,
            // Include redirect URL based on role
            redirectUrl: user.role === 'super_admin' ? '/super-admin' : 
                        user.role === 'admin' ? '/admin' : '/dashboard'
          }
        });
        return;
      }

      // Secure email login with proper password verification
      const emailValidation = emailLoginSchema.safeParse(req.body);
      
      if (emailValidation.success) {
        const { email, password } = emailValidation.data;
        
        // Rate limiting by IP and email
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const rateLimitKey = `login:${clientIp}:${email}`;
        const rateLimit = checkRateLimit(rateLimitKey);
        
        if (!rateLimit.allowed) {
          return res.status(429).json({ 
            message: "Too many login attempts. Please try again in 15 minutes." 
          });
        }
        
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // SECURITY FIX: Verify password hash
        if (!user.passwordHash) {
          return res.status(401).json({ 
            message: "Password not set. Please reset your password or contact support." 
          });
        }

        const isPasswordValid = await verifyPassword(password, user.passwordHash);
        if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        // Reset rate limit on successful login
        resetRateLimit(rateLimitKey);

        // NOTE: WytPoints are only available for WhatsApp-authenticated users
        // Legacy email/password users do not receive login points

        // Set session with new unified format
        (req.session as any).user = { 
          type: 'legacy' as const,
          id: user.id, 
          tenantId: user.tenantId 
        };

        res.json({ 
          message: "Login successful", 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            tenantId: user.tenantId,
            redirectUrl: '/dashboard' // Regular users go to dashboard
          }
        });
        return;
      }

      // If neither validation passes, return error
      return res.status(400).json({ 
        message: "Invalid request format. Please provide either mobile number or email with password." 
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint - unified for both WhatsApp and legacy users
  app.get("/api/auth/user", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Resolve user using unified system
      const principal = await resolveUserFromSession(sessionUser);
      if (!principal) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return normalized user data
      res.json({
        id: principal.id,
        tenantId: principal.tenantId,
        role: principal.role,
        isSuperAdmin: principal.isSuperAdmin,
        email: principal.email,
        name: principal.name,
        firstName: principal.firstName,
        lastName: principal.lastName,
        mobileNumber: principal.mobileNumber,
        profileImageUrl: principal.profileImageUrl,
        provider: principal.provider,
        // Include redirect URL based on role
        redirectUrl: principal.role === 'super_admin' ? '/super-admin' : 
                    principal.role === 'admin' ? '/admin' : '/dashboard'
      });
    } catch (error) {
      console.error("Auth user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// Unified authentication middleware - handles both WhatsApp and legacy users
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any)?.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Resolve user using unified system
    const principal = await resolveUserFromSession(sessionUser);
    if (!principal) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach normalized user data to request
    (req as any).user = {
      id: principal.id,
      tenantId: principal.tenantId,
      role: principal.role,
      isSuperAdmin: principal.isSuperAdmin,
      email: principal.email,
      name: principal.name,
      provider: principal.provider,
      claims: { sub: principal.id } // For backward compatibility
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Optional authentication middleware - unified for both user types (doesn't require auth)
export const optionalAuth: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any)?.user;
  
  if (sessionUser) {
    try {
      // Resolve user using unified system
      const principal = await resolveUserFromSession(sessionUser);
      if (principal) {
        (req as any).user = {
          id: principal.id,
          tenantId: principal.tenantId,
          role: principal.role,
          isSuperAdmin: principal.isSuperAdmin,
          email: principal.email,
          name: principal.name,
          provider: principal.provider,
          claims: { sub: principal.id } // For backward compatibility
        };
      }
    } catch (error) {
      console.error("Optional auth error:", error);
    }
  }
  
  next();
};

// Enhanced auth middleware for admin routes - checks all admin session patterns
export const adminAuthMiddleware: RequestHandler = async (req, res, next) => {
  try {
    console.log('DEBUG: adminAuthMiddleware called');
    
    // Method 1: Check unified session structure (new pattern)
    const sessionUser = req.session?.user;
    console.log('DEBUG: sessionUser exists:', !!sessionUser);
    
    if (sessionUser?.isSuperAdmin) {
      console.log('DEBUG: Found unified session with isSuperAdmin');
      (req as AuthenticatedRequest).user = {
        id: sessionUser.id,
        tenantId: sessionUser.tenantId || 'admin_tenant',
        role: sessionUser.role || 'super_admin',
        isSuperAdmin: sessionUser.isSuperAdmin,
        provider: (sessionUser.provider as any) || 'unified',
        claims: { sub: sessionUser.id }
      };
      console.log('DEBUG: Setting req.user from unified session:', (req as AuthenticatedRequest).user);
      return next();
    }

    // Method 2: Check WhatsApp-based super admin session (legacy pattern)
    const whatsappUserId = req.session?.whatsappUserId;
    const superAdminAuth = req.session?.superAdminAuth;
    const whatsappNumber = req.session?.whatsappNumber;
    
    console.log('DEBUG: WhatsApp session - userId:', !!whatsappUserId, 'superAuth:', !!superAdminAuth);
    
    if (whatsappUserId && superAdminAuth) {
      console.log('DEBUG: Found WhatsApp super admin session');
      try {
        // Verify this is actually a super admin user - use unified users table
        const adminUser = await db
          .select()
          .from(users)
          .where(eq(users.id, whatsappUserId))
          .limit(1);

        if (adminUser.length > 0) {
          const user = adminUser[0];
          const isSuperAdmin = Boolean(user.isSuperAdmin || user.whatsappNumber === '+919345228184');
          
          if (isSuperAdmin) {
            (req as AuthenticatedRequest).user = {
              id: user.id,
              tenantId: user.tenantId || 'admin_tenant',
              role: user.role || 'super_admin',
              isSuperAdmin: true,
              provider: 'whatsapp',
              claims: { sub: user.id }
            };
            console.log('DEBUG: Setting req.user from WhatsApp session:', (req as AuthenticatedRequest).user);
            return next();
          }
        }
      } catch (dbError) {
        console.error('DEBUG: Database error checking WhatsApp admin:', dbError);
      }
    }

    // Method 3: Check WytPass Principal session (from admin-auth.ts)
    const wytpassPrincipal = (req.session as any)?.wytpassPrincipal;
    
    console.log('DEBUG: WytPass principal session exists:', !!wytpassPrincipal);
    
    if (wytpassPrincipal) {
      console.log('DEBUG: Found wytpassPrincipal session');
      // Attach the full WytPass principal to the request
      (req as any).principal = wytpassPrincipal;
      
      // Also set req.user for backward compatibility
      (req as AuthenticatedRequest).user = {
        id: wytpassPrincipal.id,
        tenantId: wytpassPrincipal.tenantId || 'admin_tenant',
        role: wytpassPrincipal.role || 'super_admin',
        isSuperAdmin: wytpassPrincipal.isSuperAdmin || false,
        provider: 'admin',
        claims: { sub: wytpassPrincipal.id }
      };
      console.log('DEBUG: Setting req.principal from wytpassPrincipal');
      return next();
    }

    // Method 4: Check legacy admin session structure
    const adminUserId = req.session?.adminUserId;
    const adminRole = req.session?.adminRole;
    
    console.log('DEBUG: Legacy admin session - userId:', !!adminUserId, 'role:', adminRole);
    
    if (adminUserId && adminRole) {
      console.log('DEBUG: Found legacy admin session');
      (req as AuthenticatedRequest).user = {
        id: adminUserId,
        tenantId: 'admin_tenant',
        role: adminRole,
        isSuperAdmin: true,
        provider: 'legacy',
        claims: { sub: adminUserId }
      };
      console.log('DEBUG: Setting req.user from legacy session:', (req as AuthenticatedRequest).user);
      return next();
    }

    // No valid admin session found
    console.log('DEBUG: No valid admin session found');
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Hub Admin authentication middleware - checks for hub admin sessions
export const hubAdminAuthMiddleware: RequestHandler = async (req, res, next) => {
  try {
    console.log('DEBUG: hubAdminAuthMiddleware called');
    
    // Check for hubAdminPrincipal session
    const hubAdminPrincipal = (req.session as any)?.hubAdminPrincipal;
    
    console.log('DEBUG: Hub admin principal session exists:', !!hubAdminPrincipal);
    
    if (hubAdminPrincipal) {
      console.log('DEBUG: Found hubAdminPrincipal session');
      (req as AuthenticatedRequest).user = {
        id: hubAdminPrincipal.id,
        tenantId: hubAdminPrincipal.tenantId || 'wytnet_hub',
        role: hubAdminPrincipal.role || 'hub_admin',
        isSuperAdmin: false, // Hub admins are NOT super admins
        provider: 'hub_admin',
        claims: { sub: hubAdminPrincipal.id }
      };
      console.log('DEBUG: Setting req.user from hubAdminPrincipal:', (req as AuthenticatedRequest).user);
      return next();
    }

    // No valid hub admin session found
    console.log('DEBUG: No valid hub admin session found');
    return res.status(401).json({
      success: false,
      error: 'Hub admin authentication required'
    });
    
  } catch (error) {
    console.error('Hub admin auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Enhanced authentication middleware that supports all three auth types (regular user, engine admin, hub admin)
export const isAuthenticatedUnified: RequestHandler = async (req, res, next) => {
  // Check 1: Engine Admin Session
  const adminUser = (req.session as any)?.adminUser;
  if (adminUser) {
    try {
      const user = await storage.getUser(adminUser.id);
      if (user) {
        (req as AuthenticatedRequest).user = { 
          id: user.id,
          tenantId: user.tenantId || '',
          email: user.email || undefined,
          isSuperAdmin: true,
          provider: 'engine_admin',
          claims: { sub: user.id }
        };
        return next();
      }
    } catch (error) {
      console.error("Engine admin auth error:", error);
    }
  }

  // Check 2: Hub Admin Session
  const hubAdminUser = (req.session as any)?.hubAdminUser;
  if (hubAdminUser) {
    try {
      const user = await storage.getUser(hubAdminUser.userId);
      if (user) {
        (req as AuthenticatedRequest).user = { 
          id: user.id,
          tenantId: user.tenantId || '',
          email: user.email || undefined,
          isSuperAdmin: false,
          provider: 'hub_admin',
          claims: { sub: user.id }
        };
        return next();
      }
    } catch (error) {
      console.error("Hub admin auth error:", error);
    }
  }

  // Check 3: Regular User Session
  const sessionUser = req.session?.user;
  if (sessionUser) {
    try {
      const customUser = await storage.getUser(sessionUser.id);
      if (customUser) {
        (req as AuthenticatedRequest).user = { 
          id: customUser.id,
          tenantId: customUser.tenantId || '',
          email: customUser.email || undefined,
          isSuperAdmin: false,
          provider: 'unified',
          claims: { sub: customUser.id }
        };
        return next();
      }
    } catch (error) {
      console.error("Regular user auth error:", error);
    }
  }
  
  // No authentication found
  return res.status(401).json({ message: "Unauthorized" });
};

// Unified Principal resolver for all three authentication systems  
export async function getPrincipal(req: AuthenticatedRequest): Promise<Principal | null> {
  // Check 0: WytPass Principal (New unified system)
  const wytpassPrincipal = (req.session as any)?.wytpassPrincipal;
  if (wytpassPrincipal) {
    const user = await storage.getUser(wytpassPrincipal.id);
    if (user) {
      return {
        id: user.id,
        tenantId: user.tenantId || '',
        role: (user as any).role || wytpassPrincipal.role || 'user',
        isSuperAdmin: wytpassPrincipal.isSuperAdmin || false,
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.firstName || undefined,
        mobileNumber: user.mobileNumber || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        provider: wytpassPrincipal.loginType || 'unified'
      };
    }
  }

  // Check 1: Engine Admin Session (Legacy)
  const adminUser = (req.session as any)?.adminUser;
  if (adminUser) {
    const user = await storage.getUser(adminUser.id);
    if (user) {
      return {
        id: user.id,
        tenantId: user.tenantId || '',
        role: (user as any).role || 'super_admin',
        isSuperAdmin: true,
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.firstName || undefined,
        mobileNumber: user.mobileNumber || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        provider: 'engine_admin'
      };
    }
  }

  // Check 2: Hub Admin Session
  const hubAdminUser = (req.session as any)?.hubAdminUser;
  if (hubAdminUser) {
    const user = await storage.getUser(hubAdminUser.userId);
    if (user) {
      return {
        id: user.id,
        tenantId: user.tenantId || '',
        role: (user as any).role || 'hub_admin',
        isSuperAdmin: false,
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.firstName || undefined,
        mobileNumber: user.mobileNumber || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        provider: 'hub_admin'
      };
    }
  }

  // Check 3: Regular User Session (WytPass)
  const sessionUser = req.session?.user;
  if (sessionUser) {
    // All users are now in the unified users table
    const user = await storage.getUser(sessionUser.id);
    if (user) {
      return {
        id: user.id,
        tenantId: user.tenantId || '',
        role: (user as any).role || 'user',
        isSuperAdmin: (user as any).isSuperAdmin || false,
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.firstName || undefined,
        mobileNumber: user.mobileNumber || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        provider: 'unified'
      };
    }
  }

  // Return existing user from middleware if available
  if (req.user) {
    return req.user;
  }

  return null;
}

// Helper function to get admin principal from session data
export function getAdminPrincipal(session: any): Principal | null {
  if (session?.user?.isSuperAdmin) {
    return {
      id: session.user.id,
      tenantId: session.user.tenantId || 'admin_tenant',
      role: session.user.role || 'super_admin',
      isSuperAdmin: session.user.isSuperAdmin,
      provider: session.user.provider || 'unified'
    };
  }
  return null;
}

// Helper function to check if principal is super admin
export function isSuperAdmin(principal: Principal | null): boolean {
  return Boolean(principal?.isSuperAdmin);
}

// Helper function to require super admin access
export function requireSuperAdmin(principal: Principal | null): boolean {
  if (!isSuperAdmin(principal)) {
    throw new Error('Access denied: Super Admin required');
  }
  return true;
}