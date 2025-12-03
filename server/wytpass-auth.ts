import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
// import { Strategy as FacebookStrategy } from "passport-facebook"; // DISABLED until setup
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import bcrypt from "bcryptjs";
import MSG91Service from "./services/msg91Service";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";
import connectPg from "connect-pg-simple";

// WytPass Auth configuration - reference from javascript_auth_all_persistance integration
declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email?: string;
      profileImageUrl?: string;
      role: string;
      authMethods: string[];
      socialProviders: string[];
      isSuperAdmin?: boolean;
      profileComplete?: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  // Handle bcrypt hashes (start with $2a$ or $2b$)
  if (stored.startsWith('$2a$') || stored.startsWith('$2b$')) {
    return await bcrypt.compare(supplied, stored);
  }
  
  // Handle scrypt hashes (format: hash.salt)
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupWytPassAuth(app: Express) {
  // Session configuration
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      domain: process.env.NODE_ENV === "production" ? ".wytnet.com" : undefined,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // UNIFIED AUTH FIX: Auto-populate wytpassPrincipal with panel access flags
  // This enables seamless panel switching without re-authentication
  app.use(async (req, res, next) => {
    if (req.user && req.session) {
      const user = req.user as any;
      
      // Determine super admin status - check flag or email
      const isSuperAdmin = user.isSuperAdmin === true || user.email === 'jkm@jkmuthu.com';
      
      // Populate wytpassPrincipal with all necessary flags for panel detection
      (req.session as any).wytpassPrincipal = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperAdmin: isSuperAdmin,
        isHubAdmin: user._hasHubAdminRole || false,
        loginType: user.socialProviders?.[0] || 'password',
        profileImageUrl: user.profileImageUrl,
        panels: [], // Will be populated based on flags
      };
      
      // Build panels array based on user's access
      const panels = [];
      
      // All authenticated users get WytNet user panel
      panels.push('wytnet');
      
      // Super Admins get Engine Admin panel
      if (isSuperAdmin) {
        panels.push('engine_admin');
      }
      
      // Hub Admins get Hub Admin panel
      if (user._hasHubAdminRole) {
        panels.push('hub_admin');
      }
      
      (req.session as any).wytpassPrincipal.panels = panels;
    }
    next();
  });

  // Local Strategy (Email/Password)
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

          if (!user || !user.passwordHash) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValidPassword = await comparePasswords(password, user.passwordHash);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, {
            id: user.id,
            name: user.name,
            email: user.email || undefined,
            profileImageUrl: user.profileImageUrl || undefined,
            role: user.role,
            authMethods: user.authMethods as string[],
            socialProviders: user.socialProviders as string[],
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Determine the correct callback URL based on environment
    let baseUrl;
    if (process.env.NODE_ENV === "production") {
      baseUrl = "https://wytnet.com";
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      // Use the actual Replit development domain
      baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      // Fallback to old repl.co format
      baseUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    } else {
      // Local development fallback
      baseUrl = "http://localhost:5000";
    }
    
    console.log(`🔧 WytPass OAuth Callback URL: ${baseUrl}/api/auth/google/callback`);
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${baseUrl}/api/auth/google/callback`,
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with Google ID
            const [existingUser] = await db
              .select()
              .from(users)
              .where(eq(users.email, profile.emails?.[0]?.value || ""));

            if (existingUser) {
              // Update existing user with Google info
              const socialIds = (existingUser.socialIds as Record<string, string>) || {};
              const socialProviders = (existingUser.socialProviders as string[]) || [];
              const authMethods = (existingUser.authMethods as string[]) || [];

              socialIds.google = profile.id;
              if (!socialProviders.includes("google")) {
                socialProviders.push("google");
              }
              if (!authMethods.includes("google")) {
                authMethods.push("google");
              }

              // Get name from Google profile if user's name is missing
              const googleName = profile.displayName || 
                (profile.name?.givenName && profile.name?.familyName 
                  ? `${profile.name.givenName} ${profile.name.familyName}` 
                  : null);

              const [updatedUser] = await db
                .update(users)
                .set({
                  socialIds,
                  socialProviders,
                  authMethods,
                  // Update name from Google if it's missing in database
                  name: existingUser.name || googleName || existingUser.name,
                  profileImageUrl: profile.photos?.[0]?.value || existingUser.profileImageUrl,
                  lastLoginAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(users.id, existingUser.id))
                .returning();

              return done(null, {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email || undefined,
                profileImageUrl: updatedUser.profileImageUrl || undefined,
                role: updatedUser.role,
                authMethods: updatedUser.authMethods as string[],
                socialProviders: updatedUser.socialProviders as string[],
                profileComplete: updatedUser.profileComplete || false,
              });
            } else {
              // Create new user
              const [newUser] = await db
                .insert(users)
                .values({
                  name: profile.displayName || profile.name?.givenName + " " + profile.name?.familyName || "Google User",
                  email: profile.emails?.[0]?.value,
                  profileImageUrl: profile.photos?.[0]?.value,
                  socialIds: { google: profile.id },
                  socialProviders: ["google"],
                  authMethods: ["google"],
                  role: "user",
                  isVerified: true,
                  whatsappNumber: null, // NULL instead of empty string for unique constraint
                  lastLoginAt: new Date(),
                })
                .returning();

              // Auto-install core free apps
              try {
                const { autoInstallCoreApps } = await import('./services/appInstallService');
                await autoInstallCoreApps(newUser.id);
              } catch (error) {
                console.error('Failed to auto-install core apps:', error);
                // Don't throw - user creation succeeded
              }

              return done(null, {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email || undefined,
                profileImageUrl: newUser.profileImageUrl || undefined,
                role: newUser.role,
                authMethods: newUser.authMethods as string[],
                socialProviders: newUser.socialProviders as string[],
              });
            }
          } catch (error: any) {
            // Handle unique constraint violations
            if (error.code === '23505') {
              if (error.constraint === 'users_email_unique') {
                return done(new Error("Email address is already registered with another account"));
              }
              if (error.constraint === 'users_whatsapp_number_unique') {
                return done(new Error("WhatsApp number is already registered"));
              }
              return done(new Error("This information is already registered"));
            }
            return done(error);
          }
        }
      )
    );
  }

  // LinkedIn OAuth Strategy
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    // Determine the correct callback URL based on environment
    let baseUrl;
    if (process.env.NODE_ENV === "production") {
      baseUrl = "https://wytnet.com";
    } else if (process.env.REPLIT_DEV_DOMAIN) {
      baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    } else if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      baseUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
    } else {
      baseUrl = "http://localhost:5000";
    }
    
    console.log(`🔧 LinkedIn OAuth Callback URL: ${baseUrl}/api/auth/linkedin/callback`);
    console.log(`🔧 LinkedIn Client ID (masked): ${process.env.LINKEDIN_CLIENT_ID?.substring(0, 5)}...${process.env.LINKEDIN_CLIENT_ID?.slice(-3)}`);
    
    passport.use(
      new LinkedInStrategy(
        {
          clientID: process.env.LINKEDIN_CLIENT_ID,
          clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
          callbackURL: `${baseUrl}/api/auth/linkedin/callback`,
          scope: ["r_emailaddress", "r_liteprofile"],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value;
            
            // Check if user exists with LinkedIn email
            const [existingUser] = await db
              .select()
              .from(users)
              .where(eq(users.email, email || ""));

            if (existingUser) {
              // Update existing user with LinkedIn info
              const socialIds = (existingUser.socialIds as Record<string, string>) || {};
              const socialProviders = (existingUser.socialProviders as string[]) || [];
              const authMethods = (existingUser.authMethods as string[]) || [];

              socialIds.linkedin = profile.id;
              if (!socialProviders.includes("linkedin")) {
                socialProviders.push("linkedin");
              }
              if (!authMethods.includes("linkedin")) {
                authMethods.push("linkedin");
              }

              const [updatedUser] = await db
                .update(users)
                .set({
                  socialIds,
                  socialProviders,
                  authMethods,
                  profileImageUrl: profile.photos?.[0]?.value || existingUser.profileImageUrl,
                  lastLoginAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(users.id, existingUser.id))
                .returning();

              return done(null, {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email || undefined,
                profileImageUrl: updatedUser.profileImageUrl || undefined,
                role: updatedUser.role,
                authMethods: updatedUser.authMethods as string[],
                socialProviders: updatedUser.socialProviders as string[],
                profileComplete: updatedUser.profileComplete || false,
              });
            } else {
              // Create new user
              const [newUser] = await db
                .insert(users)
                .values({
                  name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}` || "LinkedIn User",
                  email: email,
                  profileImageUrl: profile.photos?.[0]?.value,
                  socialIds: { linkedin: profile.id },
                  socialProviders: ["linkedin"],
                  authMethods: ["linkedin"],
                  role: "user",
                  isVerified: true,
                  whatsappNumber: null, // NULL instead of empty string for unique constraint
                  lastLoginAt: new Date(),
                })
                .returning();

              // Auto-install core free apps
              try {
                const { autoInstallCoreApps } = await import('./services/appInstallService');
                await autoInstallCoreApps(newUser.id);
              } catch (error) {
                console.error('Failed to auto-install core apps:', error);
                // Don't throw - user creation succeeded
              }

              return done(null, {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email || undefined,
                profileImageUrl: newUser.profileImageUrl || undefined,
                role: newUser.role,
                authMethods: newUser.authMethods as string[],
                socialProviders: newUser.socialProviders as string[],
              });
            }
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy - DISABLED until setup complete
  // Uncomment when Facebook App ID and App Secret are configured
  /*
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/auth/facebook/callback",
          profileFields: ["id", "displayName", "email", "picture.type(large)"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with Facebook ID
            const [existingUser] = await db
              .select()
              .from(users)
              .where(eq(users.email, profile.emails?.[0]?.value || ""));

            if (existingUser) {
              // Update existing user with Facebook info
              const socialIds = (existingUser.socialIds as Record<string, string>) || {};
              const socialProviders = (existingUser.socialProviders as string[]) || [];
              const authMethods = (existingUser.authMethods as string[]) || [];

              socialIds.facebook = profile.id;
              if (!socialProviders.includes("facebook")) {
                socialProviders.push("facebook");
              }
              if (!authMethods.includes("facebook")) {
                authMethods.push("facebook");
              }

              const [updatedUser] = await db
                .update(users)
                .set({
                  socialIds,
                  socialProviders,
                  authMethods,
                  profileImageUrl: profile.photos?.[0]?.value || existingUser.profileImageUrl,
                  lastLoginAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(users.id, existingUser.id))
                .returning();

              return done(null, {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email || undefined,
                profileImageUrl: updatedUser.profileImageUrl || undefined,
                role: updatedUser.role,
                authMethods: updatedUser.authMethods as string[],
                socialProviders: updatedUser.socialProviders as string[],
                profileComplete: updatedUser.profileComplete || false,
              });
            } else {
              // Create new user
              const [newUser] = await db
                .insert(users)
                .values({
                  name: profile.displayName || "Facebook User",
                  email: profile.emails?.[0]?.value,
                  profileImageUrl: profile.photos?.[0]?.value,
                  socialIds: { facebook: profile.id },
                  socialProviders: ["facebook"],
                  authMethods: ["facebook"],
                  role: "user",
                  isVerified: true,
                  whatsappNumber: null, // NULL instead of empty string for unique constraint
                  lastLoginAt: new Date(),
                })
                .returning();

              return done(null, {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email || undefined,
                profileImageUrl: newUser.profileImageUrl || undefined,
                role: newUser.role,
                authMethods: newUser.authMethods as string[],
                socialProviders: newUser.socialProviders as string[],
              });
            }
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
  */

  // Passport serialization
  passport.serializeUser((user: Express.User, cb) => cb(null, user.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));

      if (!user) {
        return cb(null, false);
      }

      // UNIFIED AUTH FIX: Auto-populate ALL session contexts based on user's roles
      // This enables seamless panel switching without re-authentication
      const { userRoles, platformHubAdmins } = await import("@shared/schema");
      
      // Check Engine Admin role (query user_roles table)
      const engineAdminRoles = await db
        .select()
        .from(userRoles)
        .where(eq(userRoles.userId, user.id));
      
      // Check Hub Admin role (query platform_hub_admins table)
      const hubAdminRoles = await db
        .select()
        .from(platformHubAdmins)
        .where(eq(platformHubAdmins.userId, user.id));
      
      // Return user object to passport (populates req.user)
      const passportUser = {
        id: user.id,
        name: user.name,
        email: user.email || undefined,
        profileImageUrl: user.profileImageUrl || undefined,
        role: user.role,
        authMethods: user.authMethods as string[],
        socialProviders: user.socialProviders as string[],
        isSuperAdmin: user.isSuperAdmin || false,
        profileComplete: user.profileComplete || false,
        // Store role flags for session population
        _hasEngineAdminRole: engineAdminRoles.length > 0,
        _hasHubAdminRole: hubAdminRoles.length > 0,
        _hubAdminData: hubAdminRoles[0], // First hub admin assignment
      };
      
      cb(null, passportUser);
    } catch (error) {
      cb(error);
    }
  });

  // WytPass Auth Routes
  
  // Registration endpoint
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const { name, email, password, whatsappNumber } = req.body;

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.whatsappNumber, whatsappNumber)));

      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email or WhatsApp number" });
      }

      // Create new user
      const passwordHash = await hashPassword(password);
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email,
          passwordHash,
          whatsappNumber: whatsappNumber || null, // NULL instead of empty string for unique constraint
          authMethods: ["password"],
          socialProviders: [],
          role: "user",
          isVerified: false,
        })
        .returning();

      // Log the user in
      req.login({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email || undefined,
        profileImageUrl: newUser.profileImageUrl || undefined,
        role: newUser.role,
        authMethods: newUser.authMethods as string[],
        socialProviders: newUser.socialProviders as string[],
      }, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          profileImageUrl: newUser.profileImageUrl,
          role: newUser.role,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json({
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      profileImageUrl: req.user!.profileImageUrl,
      role: req.user!.role,
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login?error=google_failed" }),
    (req, res) => {
      // Check for return URL in session or query
      const returnUrl = (req.session as any).returnUrl || req.query.state as string;
      if (returnUrl && returnUrl.startsWith('/') && !returnUrl.includes('/login')) {
        delete (req.session as any).returnUrl;
        res.redirect(returnUrl);
      } else {
        res.redirect("/");
      }
    }
  );

  // LinkedIn OAuth routes
  app.get("/api/auth/linkedin",
    passport.authenticate("linkedin", { scope: ["r_emailaddress", "r_liteprofile"] })
  );

  app.get("/api/auth/linkedin/callback",
    passport.authenticate("linkedin", { failureRedirect: "/login?error=linkedin_failed" }),
    (req, res) => {
      // Check for return URL in session or query
      const returnUrl = (req.session as any).returnUrl || req.query.state as string;
      if (returnUrl && returnUrl.startsWith('/') && !returnUrl.includes('/login')) {
        delete (req.session as any).returnUrl;
        res.redirect(returnUrl);
      } else {
        res.redirect("/");
      }
    }
  );

  // Facebook OAuth routes - DISABLED until setup complete
  /*
  app.get("/api/auth/facebook",
    passport.authenticate("facebook", { scope: ["email"] })
  );

  app.get("/api/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login?error=facebook_failed" }),
    (req, res) => {
      res.redirect("/"); // Redirect to dashboard after successful login
    }
  );
  */

  // Get current user
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      profileImageUrl: req.user!.profileImageUrl,
      role: req.user!.role,
      authMethods: req.user!.authMethods,
      socialProviders: req.user!.socialProviders,
      profileComplete: req.user!.profileComplete || false,
    });
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Logged out successfully" });
      });
    });
  });

  // MSG91 Email OTP Authentication Routes
  
  // Send Email OTP
  app.post("/api/auth/send-email-otp", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email address is required" });
      }

      const result = await MSG91Service.sendEmailOTP(email, name);
      
      if (result.success) {
        res.status(200).json({ 
          message: result.message,
          requestId: result.requestId 
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Send email OTP error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify Email OTP and Login
  app.post("/api/auth/verify-email-otp", async (req, res) => {
    try {
      const { email, otp, name } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      const verifyResult = await MSG91Service.verifyEmailOTP(email, otp);
      
      if (verifyResult.success) {
        // Find or create user
        const user = await MSG91Service.findOrCreateUserForOTP(email, name);
        
        // Log the user in using Passport
        req.login(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          
          res.status(200).json({
            message: "Login successful",
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              profileImageUrl: user.profileImageUrl,
              role: user.role,
            }
          });
        });
      } else {
        res.status(400).json({ message: verifyResult.message });
      }
    } catch (error) {
      console.error("Verify email OTP error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resend Email OTP
  app.post("/api/auth/resend-email-otp", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email address is required" });
      }

      const result = await MSG91Service.resendEmailOTP(email, name);
      
      if (result.success) {
        res.status(200).json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Resend email OTP error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin status check
  app.get("/api/auth/admin/status", (req, res) => {
    const isAdmin = req.isAuthenticated() && 
      (req.user!.role === 'super_admin' || req.user!.role === 'admin');
    
    res.json({ authenticated: isAdmin });
  });
}

export const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const isAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || 
      (req.user.role !== 'super_admin' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};