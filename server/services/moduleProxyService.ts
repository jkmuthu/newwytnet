/**
 * Module Proxy Service
 * Handles white-label API proxying for third-party services
 * Transforms requests/responses to maintain WytNet branding
 */

import axios, { AxiosRequestConfig, Method } from 'axios';
import { getModuleById } from '../modules-catalog';

interface ProxyRequest {
  moduleId: string;
  endpoint: string;
  method: Method;
  body?: any;
  query?: Record<string, string>;
  headers?: Record<string, string>;
}

interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider?: string;
  usage?: {
    moduleId: string;
    endpoint: string;
    timestamp: string;
  };
}

export class ModuleProxyService {
  /**
   * Proxy a request to upstream provider
   */
  async proxyRequest(request: ProxyRequest): Promise<ProxyResponse> {
    const module = getModuleById(request.moduleId);
    
    if (!module) {
      return {
        success: false,
        error: `Module ${request.moduleId} not found`
      };
    }

    if (!module.upstream) {
      return {
        success: false,
        error: `Module ${request.moduleId} is not a proxy module`
      };
    }

    const upstream = module.upstream;
    const apiKey = process.env[upstream.credentialKey];

    if (!apiKey) {
      return {
        success: false,
        error: `API key ${upstream.credentialKey} not configured. Please add it to environment secrets.`
      };
    }

    try {
      // Build upstream URL
      const upstreamUrl = this.buildUpstreamUrl(upstream.baseUrl, request.endpoint, apiKey);
      
      // Transform request for upstream provider
      const upstreamRequest = this.transformRequest(module.id, request, apiKey);
      
      // Make request to upstream API
      const response = await axios({
        method: request.method,
        url: upstreamUrl,
        data: upstreamRequest.body,
        params: upstreamRequest.query,
        headers: upstreamRequest.headers,
        timeout: 30000
      });

      // Transform response to WytNet format
      const transformedResponse = this.transformResponse(module.id, response.data);

      // Track usage
      const usage = {
        moduleId: request.moduleId,
        endpoint: request.endpoint,
        timestamp: new Date().toISOString()
      };

      return {
        success: true,
        data: transformedResponse,
        provider: upstream.provider,
        usage
      };

    } catch (error: any) {
      console.error(`[ModuleProxy] Error proxying to ${upstream.provider}:`, error.message);
      
      return {
        success: false,
        error: this.formatError(module.id, error),
        provider: upstream.provider
      };
    }
  }

  /**
   * Build upstream URL with token replacement
   */
  private buildUpstreamUrl(baseUrl: string, endpoint: string, apiKey: string): string {
    // Replace {token} placeholder with API key (Mappls pattern)
    let url = `${baseUrl}${endpoint}`;
    url = url.replace('{token}', apiKey);
    return url;
  }

  /**
   * Transform WytNet request to provider-specific format
   */
  private transformRequest(moduleId: string, request: ProxyRequest, apiKey: string): {
    body?: any;
    query?: Record<string, string>;
    headers: Record<string, string>;
  } {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...request.headers
    };

    // Module-specific transformations
    switch (moduleId) {
      case 'wytmap-mappls':
        return this.transformMapplsRequest(request, apiKey, headers);
      
      case 'wytkyc-digio':
        return this.transformDigioRequest(request, apiKey, headers);
      
      default:
        return {
          body: request.body,
          query: request.query,
          headers
        };
    }
  }

  /**
   * Transform Mappls-specific request
   */
  private transformMapplsRequest(request: ProxyRequest, apiKey: string, headers: Record<string, string>) {
    // Mappls uses query parameters
    return {
      query: {
        ...request.query,
        ...request.body // Body params go to query for GET requests
      },
      headers
    };
  }

  /**
   * Transform Digio-specific request
   */
  private transformDigioRequest(request: ProxyRequest, apiKey: string, headers: Record<string, string>) {
    // Digio uses Authorization header
    headers['Authorization'] = `Bearer ${apiKey}`;
    
    return {
      body: request.body,
      query: request.query,
      headers
    };
  }

  /**
   * Transform provider response to WytNet format
   */
  private transformResponse(moduleId: string, data: any): any {
    // Add WytNet branding
    const response = {
      ...data,
      _wytnet: {
        module: moduleId,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    };

    // Module-specific response transformations
    switch (moduleId) {
      case 'wytmap-mappls':
        return this.transformMapplsResponse(response);
      
      case 'wytkyc-digio':
        return this.transformDigioResponse(response);
      
      default:
        return response;
    }
  }

  /**
   * Transform Mappls response to WytNet format
   */
  private transformMapplsResponse(data: any): any {
    // Keep original data but add WytNet metadata
    return {
      ...data,
      provider: 'WytMap by WytNet',
      powered_by: 'Mappls'
    };
  }

  /**
   * Transform Digio response to WytNet format
   */
  private transformDigioResponse(data: any): any {
    return {
      ...data,
      provider: 'WytKYC by WytNet',
      powered_by: 'Digio'
    };
  }

  /**
   * Format error messages
   */
  private formatError(moduleId: string, error: any): string {
    const baseMessage = error.response?.data?.message || error.message || 'Unknown error';
    
    // White-label error messages
    switch (moduleId) {
      case 'wytmap-mappls':
        return `WytMap service error: ${baseMessage}`;
      
      case 'wytkyc-digio':
        return `WytKYC service error: ${baseMessage}`;
      
      default:
        return `Service error: ${baseMessage}`;
    }
  }

  /**
   * Get module usage statistics
   */
  async getModuleUsage(moduleId: string, startDate?: Date, endDate?: Date): Promise<any> {
    // TODO: Implement usage tracking with database
    return {
      moduleId,
      totalRequests: 0,
      period: { start: startDate, end: endDate }
    };
  }
}

export const moduleProxyService = new ModuleProxyService();
