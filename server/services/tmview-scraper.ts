/**
 * TMView Direct Scraper
 * Fetches trademark data from TMView using direct URL pattern
 * Pattern: https://www.tmdn.org/tmview/#/tmview/detail/IN{officeCode}{paddedTmNumber}
 * 
 * Example: TM Number 1225579 → IN500000001225579
 * Format: IN + 50 (office code) + 0000001225579 (13 digits total after IN)
 */

interface TMViewData {
  tmNumber: string;
  brandName?: string;
  brandImage?: string;
  classes?: number[];
  goodsServices?: string;
  applicationDate?: string;
  registrationDate?: string;
  status?: string;
  office?: string;
  owner?: string;
  ownerAddress?: string;
}

export class TMViewScraper {
  private baseUrl = 'https://www.tmdn.org/tmview/api/detail';

  /**
   * Convert 7-digit TM Number to TMView format
   * Example: 1225579 → IN500000001225579
   */
  private formatTMNumber(tmNumber: string): string {
    // Remove any non-digit characters
    const cleaned = tmNumber.replace(/\D/g, '');
    
    // Pad to create the full identifier
    // IN + 50 (Mumbai office default) + 13-digit number
    const padded = cleaned.padStart(13, '0');
    return `IN50${padded}`;
  }

  /**
   * Fetch trademark details from TMView
   */
  async fetchTrademark(tmNumber: string): Promise<TMViewData | null> {
    try {
      const formattedNumber = this.formatTMNumber(tmNumber);
      
      console.log(`[TMView Scraper] Fetching TM ${tmNumber} (formatted: ${formattedNumber})`);

      // Try the API endpoint first
      const apiUrl = `${this.baseUrl}/${formattedNumber}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[TMView Scraper] API request failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      
      // Parse TMView API response
      return this.parseTMViewResponse(data, tmNumber);
    } catch (error) {
      console.error('[TMView Scraper] Error fetching trademark:', error);
      return null;
    }
  }

  /**
   * Parse TMView API response to our trademark format
   */
  private parseTMViewResponse(data: any, tmNumber: string): TMViewData {
    try {
      const trademark: TMViewData = {
        tmNumber: tmNumber,
      };

      // Extract brand name (wordmark or brand name)
      if (data.wordmark) {
        trademark.brandName = data.wordmark;
      } else if (data.brandName) {
        trademark.brandName = data.brandName;
      }

      // Extract brand image
      if (data.imageUrl || data.brandImage) {
        trademark.brandImage = data.imageUrl || data.brandImage;
      }

      // Extract classes (Nice classification)
      if (data.niceClasses && Array.isArray(data.niceClasses)) {
        trademark.classes = data.niceClasses.map((cls: any) => {
          if (typeof cls === 'number') return cls;
          if (typeof cls === 'string') return parseInt(cls);
          if (cls.classNumber) return parseInt(cls.classNumber);
          return null;
        }).filter((cls: number | null) => cls !== null);
      }

      // Extract goods and services
      if (data.goodsServices || data.description) {
        trademark.goodsServices = data.goodsServices || data.description;
      }

      // Extract dates
      if (data.applicationDate) {
        trademark.applicationDate = this.parseDate(data.applicationDate);
      }
      if (data.registrationDate) {
        trademark.registrationDate = this.parseDate(data.registrationDate);
      }

      // Extract status
      if (data.status || data.trademarkStatus) {
        trademark.status = this.normalizeStatus(data.status || data.trademarkStatus);
      }

      // Extract office
      if (data.office || data.officeCode) {
        trademark.office = this.normalizeOffice(data.office || data.officeCode);
      } else {
        // Default to Mumbai (office code 50)
        trademark.office = 'MUMBAI';
      }

      // Extract owner/proprietor
      if (data.owner || data.applicant || data.proprietor) {
        trademark.owner = data.owner || data.applicant || data.proprietor;
      }

      // Extract owner address
      if (data.ownerAddress || data.applicantAddress) {
        trademark.ownerAddress = data.ownerAddress || data.applicantAddress;
      }

      return trademark;
    } catch (error) {
      console.error('[TMView Scraper] Error parsing response:', error);
      return { tmNumber };
    }
  }

  /**
   * Parse date string to ISO format
   */
  private parseDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  }

  /**
   * Normalize status values
   */
  private normalizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'filed': 'Filed',
      'application filed': 'Filed',
      'examined': 'Examined',
      'accepted': 'Accepted',
      'registered': 'Registered',
      'registration': 'Registered',
      'objected': 'Objected',
      'opposed': 'Opposed',
      'opposition': 'Opposed',
      'abandoned': 'Abandoned',
      'withdrawn': 'Withdrawn',
      'removed': 'Removed',
      'expired': 'Expired',
    };

    const normalized = status?.toLowerCase().trim();
    return statusMap[normalized] || status;
  }

  /**
   * Normalize office codes to names
   */
  private normalizeOffice(office: string): string {
    const officeMap: Record<string, string> = {
      '50': 'MUMBAI',
      '51': 'DELHI',
      '52': 'CHENNAI',
      '53': 'AHMEDABAD',
      '54': 'KOLKATA',
      'mumbai': 'MUMBAI',
      'delhi': 'DELHI',
      'chennai': 'CHENNAI',
      'ahmedabad': 'AHMEDABAD',
      'kolkata': 'KOLKATA',
    };

    const normalized = office?.toLowerCase().trim();
    return officeMap[normalized] || office?.toUpperCase();
  }
}

export const tmviewScraper = new TMViewScraper();
