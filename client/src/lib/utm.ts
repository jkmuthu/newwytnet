/**
 * UTM Parameter Utility
 * 
 * Standard UTM tracking for all external links from WytNet
 * Ensures proper attribution when driving traffic to external services
 */

export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/**
 * Add UTM parameters to a URL
 * Default source is 'wytnet' for all external traffic attribution
 */
export function addUTMParams(url: string, customParams: UTMParams = {}): string {
  try {
    const urlObject = new URL(url);
    
    // Default UTM parameters for WytNet
    const defaultParams: UTMParams = {
      source: 'wytnet',
      medium: 'referral',
      campaign: 'platform_traffic',
      ...customParams
    };

    // Add each UTM parameter if it exists
    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value) {
        urlObject.searchParams.set(`utm_${key}`, value);
      }
    });

    return urlObject.toString();
  } catch (error) {
    // If URL parsing fails, return original URL
    console.error('Invalid URL for UTM tracking:', url, error);
    return url;
  }
}

/**
 * Open external URL with UTM tracking in new tab
 * Standard function to use throughout WytNet for external links
 */
export function openExternalLink(url: string, customParams: UTMParams = {}): void {
  const trackedUrl = addUTMParams(url, customParams);
  window.open(trackedUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Get UTM parameters for specific contexts
 */
export const UTMCampaigns = {
  AI_DIRECTORY: {
    source: 'wytnet',
    medium: 'ai_directory',
    campaign: 'ai_tools_referral'
  },
  QR_GENERATOR: {
    source: 'wytnet', 
    medium: 'qr_generator',
    campaign: 'tool_referral'
  },
  ASSESSMENT_TOOLS: {
    source: 'wytnet',
    medium: 'assessment',
    campaign: 'personality_tools'
  },
  HUB_REFERRAL: {
    source: 'wytnet',
    medium: 'hub',
    campaign: 'hub_referral'
  },
  WYTLIFE_WHATSAPP: {
    source: 'wytnet',
    medium: 'wytlife',
    campaign: 'whatsapp_community'
  },
  GENERAL_REFERRAL: {
    source: 'wytnet',
    medium: 'referral',
    campaign: 'platform_traffic'
  }
} as const;