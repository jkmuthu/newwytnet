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
 * Default source is 'wytnet.com' for all external traffic attribution
 */
export function addUTMParams(url: string, customParams: UTMParams = {}): string {
  try {
    const urlObject = new URL(url);
    
    // Default UTM parameters for WytNet
    const defaultParams: UTMParams = {
      source: 'wytnet.com',
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
    source: 'wytnet.com',
    medium: 'ai_directory',
    campaign: 'ai_tools_referral'
  },
  QR_GENERATOR: {
    source: 'wytnet.com', 
    medium: 'qr_generator',
    campaign: 'tool_referral'
  },
  ASSESSMENT_TOOLS: {
    source: 'wytnet.com',
    medium: 'assessment',
    campaign: 'personality_tools'
  },
  GENERAL_REFERRAL: {
    source: 'wytnet.com',
    medium: 'referral',
    campaign: 'platform_traffic'
  }
} as const;