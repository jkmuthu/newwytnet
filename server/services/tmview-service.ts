/**
 * TMView Integration Service
 * Fetches Indian Trademark data from TMView API
 * Base URL: https://www.tmdn.org/tmview/
 * 
 * TMView provides 2.4M+ Indian trademarks without CAPTCHA
 * Data can be fetched in paginated manner (1-30, 31-60, etc.)
 */

interface TMViewRecord {
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

interface TMViewSyncOptions {
  startPage?: number;
  endPage?: number;
  pageSize?: number;
  incremental?: boolean;
  lastSyncDate?: Date;
}

interface TMViewSyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsDuplicated: number;
  recordsFailed: number;
  errors: Array<{ page?: number; record?: string; error: string }>;
  nextPage?: number;
}

export class TMViewService {
  private baseUrl = 'https://www.tmdn.org/tmview/api';
  private rateLimit = 100; // requests per hour
  private requestCount = 0;
  private requestWindow = Date.now();

  /**
   * Fetch trademarks from TMView for India
   */
  async fetchTrademarks(page: number = 1, pageSize: number = 30): Promise<TMViewRecord[]> {
    // Rate limiting check
    await this.checkRateLimit();

    try {
      // Mock implementation - In production, this would call the actual TMView API
      console.log(`[TMView] Fetching page ${page} with ${pageSize} records`);
      
      // TODO: Implement actual TMView API call
      // For now, return empty array as this is the infrastructure setup
      return [];
      
    } catch (error) {
      console.error(`[TMView] Error fetching page ${page}:`, error);
      throw error;
    }
  }

  /**
   * Validate TM Number format (7 digits for India)
   */
  validateTMNumber(tmNumber: string): boolean {
    if (!tmNumber) return false;
    
    // Remove any non-digit characters
    const cleaned = tmNumber.replace(/\D/g, '');
    
    // Indian TM numbers are typically 7 digits
    return cleaned.length === 7;
  }

  /**
   * Standardize status values
   */
  standardizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'filed': 'Filed',
      'examined': 'Examined',
      'accepted': 'Accepted',
      'registered': 'Registered',
      'objected': 'Objected',
      'opposed': 'Opposed',
      'abandoned': 'Abandoned',
      'withdrawn': 'Withdrawn',
      'removed': 'Removed',
      'expired': 'Expired',
    };

    const normalized = status?.toLowerCase().trim();
    return statusMap[normalized] || status;
  }

  /**
   * Standardize office names
   */
  standardizeOffice(office: string): string {
    const officeMap: Record<string, string> = {
      'mumbai': 'MUMBAI',
      'delhi': 'DELHI',
      'chennai': 'CHENNAI',
      'ahmedabad': 'AHMEDABAD',
      'kolkata': 'KOLKATA',
    };

    const normalized = office?.toLowerCase().trim();
    return officeMap[normalized] || office?.toUpperCase();
  }

  /**
   * Validate class numbers (1-45 for Nice Classification)
   */
  validateClasses(classes: number[]): number[] {
    if (!Array.isArray(classes)) return [];
    return classes.filter(c => c >= 1 && c <= 45);
  }

  /**
   * Clean and standardize text fields
   */
  cleanText(text: string): string {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Parse date from various formats
   */
  parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Determine source priority
   */
  getSourcePriority(source: string): number {
    const priorityMap: Record<string, number> = {
      'Gazette': 1,
      'IPIndia': 1,
      'TMView': 2,
      'Crawled': 3,
      'Manual': 4,
    };

    return priorityMap[source] || 5;
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    // Reset counter if hour window has passed
    if (now - this.requestWindow > hourInMs) {
      this.requestCount = 0;
      this.requestWindow = now;
    }

    // Check if rate limit exceeded
    if (this.requestCount >= this.rateLimit) {
      const waitTime = hourInMs - (now - this.requestWindow);
      console.log(`[TMView] Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.requestWindow = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Sync trademarks from TMView
   */
  async syncTrademarks(options: TMViewSyncOptions = {}): Promise<TMViewSyncResult> {
    const {
      startPage = 1,
      endPage = 10,
      pageSize = 30,
      incremental = false,
    } = options;

    const result: TMViewSyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      recordsDuplicated: 0,
      recordsFailed: 0,
      errors: [],
    };

    try {
      console.log(`[TMView] Starting sync from page ${startPage} to ${endPage}`);

      for (let page = startPage; page <= endPage; page++) {
        try {
          const records = await this.fetchTrademarks(page, pageSize);
          result.recordsProcessed += records.length;

          // Process records
          for (const record of records) {
            try {
              // Validate TM Number
              if (!this.validateTMNumber(record.tmNumber)) {
                result.recordsFailed++;
                result.errors.push({
                  page,
                  record: record.tmNumber,
                  error: 'Invalid TM Number format',
                });
                continue;
              }

              // TODO: Insert/update record in database
              // This will be implemented in the next step with the database service
              
            } catch (error: any) {
              result.recordsFailed++;
              result.errors.push({
                page,
                record: record.tmNumber,
                error: error.message,
              });
            }
          }

          console.log(`[TMView] Processed page ${page}: ${records.length} records`);
        } catch (error: any) {
          result.errors.push({
            page,
            error: error.message,
          });
        }
      }

      result.success = result.recordsFailed === 0;
      console.log(`[TMView] Sync complete:`, result);

      return result;

    } catch (error: any) {
      console.error(`[TMView] Sync failed:`, error);
      return {
        ...result,
        success: false,
        errors: [...result.errors, { error: error.message }],
      };
    }
  }
}

// Export singleton instance
export const tmviewService = new TMViewService();
