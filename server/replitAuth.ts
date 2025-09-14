// Replit Auth integration for social authentication
// Referenced from Replit Auth integration blueprint
import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);


function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertReplitUser(
  claims: any,
) {
  // SECURITY FIX: Ensure OIDC users get proper tenant assignment
  
  // First check if user already exists (may have tenant)
  let existingUser;
  try {
    existingUser = await storage.getUser(claims["sub"]);
  } catch (error) {
    // User doesn't exist, which is fine
  }
  
  let tenantId = existingUser?.tenantId;
  
  // If user doesn't have a tenant, create/get default tenant
  if (!tenantId) {
    // For OIDC users, use email domain as tenant identifier
    const emailDomain = claims["email"]?.split('@')[1] || 'default.com';
    const defaultTenantId = `ten_oidc_${emailDomain.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Try to get existing tenant for this domain
    try {
      const existingTenant = await storage.getTenant(defaultTenantId);
      
      if (existingTenant) {
        tenantId = existingTenant.id;
      } else {
        // Create new tenant for this domain
        await storage.createTenant({
          id: defaultTenantId,
          name: `${emailDomain} Organization`,
          domain: emailDomain,
          settings: { source: 'oidc_auto_created' },
          isActive: true,
        });
        tenantId = defaultTenantId;
      }
    } catch (error) {
      console.error('Error creating tenant for OIDC user:', error);
      // Fallback to a global default tenant
      tenantId = 'ten_default_global';
      
      // Ensure global default tenant exists
      try {
        const globalTenant = await storage.getTenant(tenantId);
        if (!globalTenant) {
          await storage.createTenant({
            id: tenantId,
            name: 'Global Default Organization',
            domain: 'default.wytnet.com',
            settings: { source: 'global_default' },
            isActive: true,
          });
        }
      } catch (createError) {
        // Tenant might already exist, which is fine
        console.warn('Could not create global default tenant:', createError);
      }
    }
  }
  
  // Now create/update user with proper tenant assignment
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    tenantId: tenantId, // CRITICAL: Assign tenant to prevent authorization failures
  });
}

export async function setupReplitAuth(app: Express) {
  // CRITICAL FIX: Remove duplicate session middleware to prevent conflicts
  // Session middleware is now handled centrally by customAuth.ts
  // We only initialize passport here since session is already configured
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertReplitUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Robust strategy matching for development/production environments
    const hostname = req.hostname;
    const domains = process.env.REPLIT_DOMAINS!.split(",");
    
    // Find exact match or similar domain pattern
    let strategyName = `replitauth:${domains[0]}`; // Default fallback
    
    for (const domain of domains) {
      if (hostname === domain || 
          hostname.includes(domain.split('.')[0]) || 
          domain.includes(hostname.split('.')[0])) {
        strategyName = `replitauth:${domain}`;
        break;
      }
    }
    
    console.log(`Using strategy: ${strategyName} for hostname: ${hostname}`);
    
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    // Robust strategy matching for development/production environments
    const hostname = req.hostname;
    const domains = process.env.REPLIT_DOMAINS!.split(",");
    
    // Find exact match or similar domain pattern
    let strategyName = `replitauth:${domains[0]}`; // Default fallback
    
    for (const domain of domains) {
      if (hostname === domain || 
          hostname.includes(domain.split('.')[0]) || 
          domain.includes(hostname.split('.')[0])) {
        strategyName = `replitauth:${domain}`;
        break;
      }
    }
    
    console.log(`Using callback strategy: ${strategyName} for hostname: ${hostname}`);
    
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isReplitAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};