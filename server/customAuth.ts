import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { z } from "zod";
import { findWhatsAppUser, formatPhoneNumber, findWhatsAppUserById } from "./services/whatsappAuth";
import { verifyPassword, hashPassword } from "./services/socialAuth";
import bcrypt from "bcryptjs";
import type { WhatsAppUser } from "@shared/schema";

// Unified Principal DTO for consistent user representation
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
  provider: 'whatsapp' | 'legacy';
}

// Session structure with provider type for unified handling
export interface SessionUser {
  type: 'whatsapp' | 'legacy';
  id: string;
  tenantId: string;
  role?: string;
  isSuperAdmin?: boolean;
}

// Helper function to normalize user data into Principal DTO
function createPrincipal(user: any, provider: 'whatsapp' | 'legacy'): Principal {
  if (provider === 'whatsapp') {
    const whatsappUser = user as WhatsAppUser;
    return {
      id: whatsappUser.id,
      tenantId: whatsappUser.tenantId!,
      role: whatsappUser.role,
      isSuperAdmin: whatsappUser.isSuperAdmin || false,
      email: whatsappUser.email || undefined,
      name: whatsappUser.name,
      mobileNumber: whatsappUser.whatsappNumber,
      profileImageUrl: whatsappUser.profileImageUrl || undefined,
      provider: 'whatsapp'
    };
  } else {
    // Legacy user from users table
    return {
      id: user.id,
      tenantId: user.tenantId,
      role: 'user', // Default role for legacy users
      isSuperAdmin: false,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
      provider: 'legacy'
    };
  }
}

// Helper function to resolve user from session
async function resolveUserFromSession(sessionUser: any): Promise<Principal | null> {
  try {
    // Handle new session format with type
    if (sessionUser.type) {
      const typedSession = sessionUser as SessionUser;
      
      if (typedSession.type === 'whatsapp') {
        const whatsappUser = await findWhatsAppUserById(typedSession.id);
        if (whatsappUser) {
          return createPrincipal(whatsappUser, 'whatsapp');
        }
      } else if (typedSession.type === 'legacy') {
        const legacyUser = await storage.getUser(typedSession.id);
        if (legacyUser) {
          return createPrincipal(legacyUser, 'legacy');
        }
      }
      
      return null;
    }
    
    // Handle legacy session format for backward compatibility
    // First try to find in WhatsApp users (check if it has role/isSuperAdmin properties)
    if (sessionUser.role !== undefined || sessionUser.isSuperAdmin !== undefined) {
      const whatsappUser = await findWhatsAppUserById(sessionUser.id);
      if (whatsappUser) {
        return createPrincipal(whatsappUser, 'whatsapp');
      }
    }
    
    // Fall back to regular users table
    const legacyUser = await storage.getUser(sessionUser.id);
    if (legacyUser) {
      return createPrincipal(legacyUser, 'legacy');
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
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || 'default-secret-key-change-in-production',
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
  app.set("trust proxy", 1);
  app.use(getSession());

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
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
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
        
        // Find user by mobile number
        const user = await findWhatsAppUser(formattedNumber);
        
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
            name: user.name,
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