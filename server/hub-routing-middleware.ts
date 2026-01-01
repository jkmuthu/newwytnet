import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { platformHubs, hubDomains } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Extend Express Request to include hub context
declare global {
  namespace Express {
    interface Request {
      hubContext?: {
        hub: typeof platformHubs.$inferSelect;
        routingType: 'subdomain' | 'custom-domain' | 'path';
        originalUrl: string;
      };
    }
  }
}

/**
 * Hub Routing Middleware
 * 
 * Detects and resolves hub context based on:
 * 1. Custom domain (e.g., ownernet.com)
 * 2. Subdomain (e.g., ownernet.wytnet.com)
 * 3. Path-based routing (e.g., wytnet.com/hubs/ownernet)
 * 
 * Sets req.hubContext with resolved hub and routing type
 */
export function hubRoutingMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const host = req.get('host') || '';
      const path = req.path;
      
      // Skip API routes and static assets
      if (
        path.startsWith('/api/') ||
        path.startsWith('/_next/') ||
        path.startsWith('/static/') ||
        path.startsWith('/assets/')
      ) {
        return next();
      }

      let hub: typeof platformHubs.$inferSelect | null = null;
      let routingType: 'subdomain' | 'custom-domain' | 'path' | null = null;

      const hostname = host.split(':')[0]; // Remove port if present

      // 1. Check for custom domain routing (including primary wytnet.com domain)
      // Example: ownernet.com, wytnet.com, www.wytnet.com
      // Note: We check for custom domains first, including the platform's primary domain
      if (host && !host.includes('localhost') && !host.includes('replit.dev')) {
        // First, check the new hubDomains table (supports multiple domains per hub)
        const [domainEntry] = await db
          .select({
            domain: hubDomains,
            hub: platformHubs
          })
          .from(hubDomains)
          .innerJoin(platformHubs, eq(hubDomains.hubId, platformHubs.id))
          .where(
            and(
              eq(hubDomains.domain, hostname),
              eq(hubDomains.status, 'active'),
              eq(platformHubs.status, 'active')
            )
          )
          .limit(1);

        if (domainEntry) {
          hub = domainEntry.hub;
          routingType = 'custom-domain';
          console.log(`🌐 Custom domain routing (hubDomains): ${hostname} -> ${hub.name}`);
        } else {
          // Fallback: Check the legacy customDomain field on platformHubs
          const [foundHub] = await db
            .select()
            .from(platformHubs)
            .where(
              and(
                eq(platformHubs.customDomain, hostname),
                eq(platformHubs.domainVerified, true),
                eq(platformHubs.status, 'active')
              )
            )
            .limit(1);

          if (foundHub) {
            hub = foundHub;
            routingType = 'custom-domain';
            console.log(`🌐 Custom domain routing (legacy): ${hostname} -> ${hub.name}`);
          }
        }
      }

      // 2. Check for subdomain routing
      // Example: ownernet.wytnet.com or ownernet.localhost:5000
      if (!hub && host) {
        const hostParts = host.split(':')[0].split('.'); // Remove port and split
        
        // Check if subdomain exists (e.g., subdomain.wytnet.com or subdomain.localhost)
        if (hostParts.length >= 2) {
          const subdomain = hostParts[0];
          
          // Skip 'www' and empty subdomains
          if (subdomain && subdomain !== 'www' && subdomain !== 'wytnet') {
            const [foundHub] = await db
              .select()
              .from(platformHubs)
              .where(
                and(
                  eq(platformHubs.subdomain, subdomain),
                  eq(platformHubs.status, 'active')
                )
              )
              .limit(1);

            if (foundHub) {
              hub = foundHub;
              routingType = 'subdomain';
              console.log(`🌐 Subdomain routing: ${subdomain} -> ${hub.name}`);
            }
          }
        }
      }

      // 3. Check for path-based routing
      // Example: wytnet.com/hubs/ownernet
      if (!hub && path.startsWith('/hubs/')) {
        const pathParts = path.split('/');
        const hubSlug = pathParts[2]; // /hubs/{slug}/...
        
        if (hubSlug) {
          const [foundHub] = await db
            .select()
            .from(platformHubs)
            .where(
              and(
                eq(platformHubs.slug, hubSlug),
                eq(platformHubs.status, 'active')
              )
            )
            .limit(1);

          if (foundHub) {
            hub = foundHub;
            routingType = 'path';
            console.log(`🌐 Path routing: /hubs/${hubSlug} -> ${hub.name}`);
          }
        }
      }

      // Set hub context if found
      if (hub && routingType) {
        req.hubContext = {
          hub,
          routingType,
          originalUrl: req.originalUrl,
        };

        // Add hub info to response headers for debugging (development only)
        if (process.env.NODE_ENV === 'development') {
          res.setHeader('X-Hub-ID', hub.displayId || '');
          res.setHeader('X-Hub-Name', hub.name || '');
          res.setHeader('X-Hub-Routing', routingType);
        }
      }

      next();
    } catch (error) {
      console.error('Hub routing middleware error:', error);
      // Don't block request on routing errors, just continue without hub context
      next();
    }
  };
}

/**
 * Helper function to get current hub from request
 */
export function getCurrentHub(req: Request) {
  return req.hubContext?.hub || null;
}

/**
 * Helper function to check if request is hub-scoped
 */
export function isHubRequest(req: Request): boolean {
  return !!req.hubContext;
}

/**
 * Middleware to require hub context (404 if no hub found)
 */
export function requireHub() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.hubContext) {
      return res.status(404).json({
        success: false,
        error: 'Hub not found',
        message: 'This URL does not match any active hub',
      });
    }
    next();
  };
}

/**
 * Get hub-scoped base URL based on routing type
 */
export function getHubBaseUrl(hub: typeof platformHubs.$inferSelect, routingType: 'subdomain' | 'custom-domain' | 'path'): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseHost = process.env.BASE_HOST || 'wytnet.com';
  
  switch (routingType) {
    case 'custom-domain':
      return hub.customDomain && hub.domainVerified
        ? `${protocol}://${hub.customDomain}`
        : `${protocol}://${hub.subdomain}.${baseHost}`;
    
    case 'subdomain':
      return `${protocol}://${hub.subdomain}.${baseHost}`;
    
    case 'path':
      return `${protocol}://${baseHost}/hubs/${hub.slug}`;
    
    default:
      return `${protocol}://${baseHost}/hubs/${hub.slug}`;
  }
}
