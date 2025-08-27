// Multi-tenant utilities for WytNet
import { z } from "zod";

export interface TenantContext {
  tenantId: string;
  slug: string;
  domain?: string;
  subdomain?: string;
  settings: Record<string, any>;
}

export const tenantContextSchema = z.object({
  tenantId: z.string(),
  slug: z.string(),
  domain: z.string().optional(),
  subdomain: z.string().optional(),
  settings: z.record(z.any()).default({}),
});

export class TenancyService {
  // Extract tenant from request (subdomain or path)
  static extractTenantFromRequest(hostname: string, pathname: string): {
    type: 'subdomain' | 'path' | null;
    identifier: string | null;
  } {
    // Check for subdomain (tenant1.wytnet.com)
    const subdomainMatch = hostname.match(/^([^.]+)\.wytnet\.com$/);
    if (subdomainMatch && subdomainMatch[1] !== 'www') {
      return {
        type: 'subdomain',
        identifier: subdomainMatch[1],
      };
    }

    // Check for path (/our/{spacename})
    const pathMatch = pathname.match(/^\/our\/([^\/]+)/);
    if (pathMatch) {
      return {
        type: 'path',
        identifier: pathMatch[1],
      };
    }

    return {
      type: null,
      identifier: null,
    };
  }

  // Build tenant-specific URL
  static buildTenantUrl(tenant: TenantContext, path: string = '/'): string {
    if (tenant.domain) {
      return `https://${tenant.domain}${path}`;
    }

    if (tenant.subdomain) {
      return `https://${tenant.subdomain}.wytnet.com${path}`;
    }

    return `https://wytnet.com/our/${tenant.slug}${path}`;
  }

  // Generate tenant-safe database query conditions
  static getTenantFilter(tenantId: string) {
    return {
      tenantId,
    };
  }

  // Validate tenant access for resource
  static validateTenantAccess(
    resourceTenantId: string | undefined,
    contextTenantId: string | undefined,
    allowGlobal: boolean = false
  ): boolean {
    // Global resources (no tenant)
    if (!resourceTenantId && allowGlobal) {
      return true;
    }

    // Must match tenant context
    if (resourceTenantId && contextTenantId) {
      return resourceTenantId === contextTenantId;
    }

    return false;
  }

  // Get tenant-specific configuration
  static getTenantSetting(tenant: TenantContext, key: string, defaultValue?: any): any {
    return tenant.settings[key] ?? defaultValue;
  }

  // Set tenant-specific configuration
  static setTenantSetting(tenant: TenantContext, key: string, value: any): TenantContext {
    return {
      ...tenant,
      settings: {
        ...tenant.settings,
        [key]: value,
      },
    };
  }
}

// Utility for generating tenant-aware database schemas
export class TenantSchema {
  static addTenantFields(baseSchema: any) {
    return {
      ...baseSchema,
      tenantId: z.string().uuid().optional(),
    };
  }

  static addRLSFields(baseSchema: any) {
    return {
      ...baseSchema,
      tenantId: z.string().uuid(),
      createdBy: z.string(),
      createdAt: z.date().default(() => new Date()),
      updatedAt: z.date().default(() => new Date()),
    };
  }
}

// Middleware for extracting tenant context
export function extractTenantMiddleware(req: any, res: any, next: any) {
  const { type, identifier } = TenancyService.extractTenantFromRequest(
    req.hostname || req.get('host') || '',
    req.path || ''
  );

  req.tenantContext = {
    type,
    identifier,
  };

  next();
}
