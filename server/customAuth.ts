import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { z } from "zod";

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

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
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

      // Create user
      const user = await storage.upsertUser({
        id: userId,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        tenantId: tenantId,
      });

      // Set session
      (req.session as any).user = { id: userId, tenantId };

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

  // Simple login endpoint  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // For demo purposes, accept any email/password combination
      // In production, you'd verify against a password hash
      const user = await storage.getUserByEmail(validatedData.email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).user = { id: user.id, tenantId: user.tenantId };

      res.json({ 
        message: "Login successful", 
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

  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const sessionUser = (req.session as any)?.user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(sessionUser.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId
      });
    } catch (error) {
      console.error("Auth user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// Simple authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any)?.user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await storage.getUser(sessionUser.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user data to request
    (req as any).user = { 
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      claims: { sub: user.id } // For backward compatibility
    };
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Optional authentication middleware (doesn't require auth)
export const optionalAuth: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any)?.user;
  
  if (sessionUser) {
    try {
      const user = await storage.getUser(sessionUser.id);
      if (user) {
        (req as any).user = { 
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          claims: { sub: user.id }
        };
      }
    } catch (error) {
      console.error("Optional auth error:", error);
    }
  }
  
  next();
};