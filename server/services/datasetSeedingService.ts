/**
 * WytData Dataset Seeding Service
 * Seeds essential reference datasets for the platform
 */

import { db } from "../db";
import { datasetCollections, datasetItems } from "@shared/schema";
import { eq, and, asc } from "drizzle-orm";

interface DatasetCollection {
  key: string;
  name: string;
  description: string;
  scope: 'global' | 'tenant';
  metadata?: any;
}

interface DatasetItem {
  code: string;
  label: string;
  locale?: string;
  isDefault?: boolean;
  sortOrder?: number;
  metadata?: any;
}

export class DatasetSeedingService {
  /**
   * Initialize all essential datasets
   */
  async initializeDatasets() {
    console.log('🌱 Initializing WytData datasets...');
    
    try {
      await this.seedCountries();
      await this.seedLanguages();
      await this.seedCurrencies();
      await this.seedTimezones();
      await this.seedIndiaStates();
      await this.seedIndiaCities();
      await this.seedIndiaGSTCodes();
      await this.seedIndustries();
      await this.seedCompanySizes();
      await this.seedJobRoles();
      
      console.log('✅ WytData datasets initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing datasets:', error);
    }
  }

  /**
   * Helper to create or update a collection
   */
  private async createCollection(collection: DatasetCollection): Promise<string> {
    const [existing] = await db.select()
      .from(datasetCollections)
      .where(eq(datasetCollections.key, collection.key));

    if (existing) {
      return existing.id;
    }

    const [created] = await db.insert(datasetCollections)
      .values({
        key: collection.key,
        name: collection.name,
        description: collection.description,
        scope: collection.scope,
        metadata: collection.metadata || {}
      })
      .returning();

    return created.id;
  }

  /**
   * Helper to create items for a collection
   */
  private async createItems(collectionId: string, items: DatasetItem[]) {
    for (const item of items) {
      try {
        await db.insert(datasetItems)
          .values({
            collectionId,
            code: item.code,
            label: item.label,
            locale: item.locale || 'en',
            isDefault: item.isDefault || false,
            sortOrder: item.sortOrder || 0,
            metadata: item.metadata || {}
          })
          .onConflictDoNothing();
      } catch (error) {
        // Item already exists, skip
      }
    }
  }

  /**
   * Seed Countries dataset (Top 50 countries)
   */
  private async seedCountries() {
    const collectionId = await this.createCollection({
      key: 'countries',
      name: 'Countries',
      description: 'Global countries with ISO codes, phone prefixes, and flags',
      scope: 'global',
      metadata: { icon: '🌍', immutable: true }
    });

    const countries: DatasetItem[] = [
      { code: 'IN', label: 'India', sortOrder: 1, metadata: { phonePrefix: '+91', currency: 'INR', flag: '🇮🇳' } },
      { code: 'US', label: 'United States', sortOrder: 2, metadata: { phonePrefix: '+1', currency: 'USD', flag: '🇺🇸' } },
      { code: 'GB', label: 'United Kingdom', sortOrder: 3, metadata: { phonePrefix: '+44', currency: 'GBP', flag: '🇬🇧' } },
      { code: 'CA', label: 'Canada', sortOrder: 4, metadata: { phonePrefix: '+1', currency: 'CAD', flag: '🇨🇦' } },
      { code: 'AU', label: 'Australia', sortOrder: 5, metadata: { phonePrefix: '+61', currency: 'AUD', flag: '🇦🇺' } },
      { code: 'DE', label: 'Germany', sortOrder: 6, metadata: { phonePrefix: '+49', currency: 'EUR', flag: '🇩🇪' } },
      { code: 'FR', label: 'France', sortOrder: 7, metadata: { phonePrefix: '+33', currency: 'EUR', flag: '🇫🇷' } },
      { code: 'JP', label: 'Japan', sortOrder: 8, metadata: { phonePrefix: '+81', currency: 'JPY', flag: '🇯🇵' } },
      { code: 'CN', label: 'China', sortOrder: 9, metadata: { phonePrefix: '+86', currency: 'CNY', flag: '🇨🇳' } },
      { code: 'BR', label: 'Brazil', sortOrder: 10, metadata: { phonePrefix: '+55', currency: 'BRL', flag: '🇧🇷' } },
      { code: 'SG', label: 'Singapore', sortOrder: 11, metadata: { phonePrefix: '+65', currency: 'SGD', flag: '🇸🇬' } },
      { code: 'AE', label: 'United Arab Emirates', sortOrder: 12, metadata: { phonePrefix: '+971', currency: 'AED', flag: '🇦🇪' } },
      { code: 'NL', label: 'Netherlands', sortOrder: 13, metadata: { phonePrefix: '+31', currency: 'EUR', flag: '🇳🇱' } },
      { code: 'SE', label: 'Sweden', sortOrder: 14, metadata: { phonePrefix: '+46', currency: 'SEK', flag: '🇸🇪' } },
      { code: 'NO', label: 'Norway', sortOrder: 15, metadata: { phonePrefix: '+47', currency: 'NOK', flag: '🇳🇴' } },
      { code: 'CH', label: 'Switzerland', sortOrder: 16, metadata: { phonePrefix: '+41', currency: 'CHF', flag: '🇨🇭' } },
      { code: 'ES', label: 'Spain', sortOrder: 17, metadata: { phonePrefix: '+34', currency: 'EUR', flag: '🇪🇸' } },
      { code: 'IT', label: 'Italy', sortOrder: 18, metadata: { phonePrefix: '+39', currency: 'EUR', flag: '🇮🇹' } },
      { code: 'MX', label: 'Mexico', sortOrder: 19, metadata: { phonePrefix: '+52', currency: 'MXN', flag: '🇲🇽' } },
      { code: 'ZA', label: 'South Africa', sortOrder: 20, metadata: { phonePrefix: '+27', currency: 'ZAR', flag: '🇿🇦' } },
      { code: 'KR', label: 'South Korea', sortOrder: 21, metadata: { phonePrefix: '+82', currency: 'KRW', flag: '🇰🇷' } },
      { code: 'ID', label: 'Indonesia', sortOrder: 22, metadata: { phonePrefix: '+62', currency: 'IDR', flag: '🇮🇩' } },
      { code: 'MY', label: 'Malaysia', sortOrder: 23, metadata: { phonePrefix: '+60', currency: 'MYR', flag: '🇲🇾' } },
      { code: 'TH', label: 'Thailand', sortOrder: 24, metadata: { phonePrefix: '+66', currency: 'THB', flag: '🇹🇭' } },
      { code: 'PH', label: 'Philippines', sortOrder: 25, metadata: { phonePrefix: '+63', currency: 'PHP', flag: '🇵🇭' } },
      { code: 'VN', label: 'Vietnam', sortOrder: 26, metadata: { phonePrefix: '+84', currency: 'VND', flag: '🇻🇳' } },
      { code: 'NZ', label: 'New Zealand', sortOrder: 27, metadata: { phonePrefix: '+64', currency: 'NZD', flag: '🇳🇿' } },
      { code: 'PL', label: 'Poland', sortOrder: 28, metadata: { phonePrefix: '+48', currency: 'PLN', flag: '🇵🇱' } },
      { code: 'BE', label: 'Belgium', sortOrder: 29, metadata: { phonePrefix: '+32', currency: 'EUR', flag: '🇧🇪' } },
      { code: 'AT', label: 'Austria', sortOrder: 30, metadata: { phonePrefix: '+43', currency: 'EUR', flag: '🇦🇹' } },
      { code: 'DK', label: 'Denmark', sortOrder: 31, metadata: { phonePrefix: '+45', currency: 'DKK', flag: '🇩🇰' } },
      { code: 'FI', label: 'Finland', sortOrder: 32, metadata: { phonePrefix: '+358', currency: 'EUR', flag: '🇫🇮' } },
      { code: 'IE', label: 'Ireland', sortOrder: 33, metadata: { phonePrefix: '+353', currency: 'EUR', flag: '🇮🇪' } },
      { code: 'PT', label: 'Portugal', sortOrder: 34, metadata: { phonePrefix: '+351', currency: 'EUR', flag: '🇵🇹' } },
      { code: 'IL', label: 'Israel', sortOrder: 35, metadata: { phonePrefix: '+972', currency: 'ILS', flag: '🇮🇱' } },
      { code: 'TR', label: 'Turkey', sortOrder: 36, metadata: { phonePrefix: '+90', currency: 'TRY', flag: '🇹🇷' } },
      { code: 'SA', label: 'Saudi Arabia', sortOrder: 37, metadata: { phonePrefix: '+966', currency: 'SAR', flag: '🇸🇦' } },
      { code: 'EG', label: 'Egypt', sortOrder: 38, metadata: { phonePrefix: '+20', currency: 'EGP', flag: '🇪🇬' } },
      { code: 'NG', label: 'Nigeria', sortOrder: 39, metadata: { phonePrefix: '+234', currency: 'NGN', flag: '🇳🇬' } },
      { code: 'KE', label: 'Kenya', sortOrder: 40, metadata: { phonePrefix: '+254', currency: 'KES', flag: '🇰🇪' } },
      { code: 'AR', label: 'Argentina', sortOrder: 41, metadata: { phonePrefix: '+54', currency: 'ARS', flag: '🇦🇷' } },
      { code: 'CL', label: 'Chile', sortOrder: 42, metadata: { phonePrefix: '+56', currency: 'CLP', flag: '🇨🇱' } },
      { code: 'CO', label: 'Colombia', sortOrder: 43, metadata: { phonePrefix: '+57', currency: 'COP', flag: '🇨🇴' } },
      { code: 'PE', label: 'Peru', sortOrder: 44, metadata: { phonePrefix: '+51', currency: 'PEN', flag: '🇵🇪' } },
      { code: 'PK', label: 'Pakistan', sortOrder: 45, metadata: { phonePrefix: '+92', currency: 'PKR', flag: '🇵🇰' } },
      { code: 'BD', label: 'Bangladesh', sortOrder: 46, metadata: { phonePrefix: '+880', currency: 'BDT', flag: '🇧🇩' } },
      { code: 'LK', label: 'Sri Lanka', sortOrder: 47, metadata: { phonePrefix: '+94', currency: 'LKR', flag: '🇱🇰' } },
      { code: 'NP', label: 'Nepal', sortOrder: 48, metadata: { phonePrefix: '+977', currency: 'NPR', flag: '🇳🇵' } },
      { code: 'HK', label: 'Hong Kong', sortOrder: 49, metadata: { phonePrefix: '+852', currency: 'HKD', flag: '🇭🇰' } },
      { code: 'TW', label: 'Taiwan', sortOrder: 50, metadata: { phonePrefix: '+886', currency: 'TWD', flag: '🇹🇼' } }
    ];

    await this.createItems(collectionId, countries);
    console.log(`  ✓ Seeded ${countries.length} countries`);
  }

  /**
   * Seed Languages dataset
   */
  private async seedLanguages() {
    const collectionId = await this.createCollection({
      key: 'languages',
      name: 'Languages',
      description: 'Global languages with ISO 639 codes',
      scope: 'global',
      metadata: { icon: '🌐', immutable: true }
    });

    const languages: DatasetItem[] = [
      { code: 'en', label: 'English', sortOrder: 1, metadata: { nativeName: 'English', direction: 'ltr' } },
      { code: 'hi', label: 'Hindi', sortOrder: 2, metadata: { nativeName: 'हिन्दी', direction: 'ltr' } },
      { code: 'es', label: 'Spanish', sortOrder: 3, metadata: { nativeName: 'Español', direction: 'ltr' } },
      { code: 'fr', label: 'French', sortOrder: 4, metadata: { nativeName: 'Français', direction: 'ltr' } },
      { code: 'de', label: 'German', sortOrder: 5, metadata: { nativeName: 'Deutsch', direction: 'ltr' } },
      { code: 'zh', label: 'Chinese', sortOrder: 6, metadata: { nativeName: '中文', direction: 'ltr' } },
      { code: 'ja', label: 'Japanese', sortOrder: 7, metadata: { nativeName: '日本語', direction: 'ltr' } },
      { code: 'ar', label: 'Arabic', sortOrder: 8, metadata: { nativeName: 'العربية', direction: 'rtl' } },
      { code: 'pt', label: 'Portuguese', sortOrder: 9, metadata: { nativeName: 'Português', direction: 'ltr' } },
      { code: 'ru', label: 'Russian', sortOrder: 10, metadata: { nativeName: 'Русский', direction: 'ltr' } },
      { code: 'bn', label: 'Bengali', sortOrder: 11, metadata: { nativeName: 'বাংলা', direction: 'ltr' } },
      { code: 'te', label: 'Telugu', sortOrder: 12, metadata: { nativeName: 'తెలుగు', direction: 'ltr' } },
      { code: 'ta', label: 'Tamil', sortOrder: 13, metadata: { nativeName: 'தமிழ்', direction: 'ltr' } },
      { code: 'mr', label: 'Marathi', sortOrder: 14, metadata: { nativeName: 'मराठी', direction: 'ltr' } },
      { code: 'gu', label: 'Gujarati', sortOrder: 15, metadata: { nativeName: 'ગુજરાતી', direction: 'ltr' } },
      { code: 'kn', label: 'Kannada', sortOrder: 16, metadata: { nativeName: 'ಕನ್ನಡ', direction: 'ltr' } },
      { code: 'ml', label: 'Malayalam', sortOrder: 17, metadata: { nativeName: 'മലയാളം', direction: 'ltr' } },
      { code: 'pa', label: 'Punjabi', sortOrder: 18, metadata: { nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr' } },
      { code: 'ur', label: 'Urdu', sortOrder: 19, metadata: { nativeName: 'اردو', direction: 'rtl' } },
      { code: 'ko', label: 'Korean', sortOrder: 20, metadata: { nativeName: '한국어', direction: 'ltr' } }
    ];

    await this.createItems(collectionId, languages);
    console.log(`  ✓ Seeded ${languages.length} languages`);
  }

  /**
   * Seed Currencies dataset
   */
  private async seedCurrencies() {
    const collectionId = await this.createCollection({
      key: 'currencies',
      name: 'Currencies',
      description: 'Global currencies with ISO 4217 codes and symbols',
      scope: 'global',
      metadata: { icon: '💰', immutable: true }
    });

    const currencies: DatasetItem[] = [
      { code: 'INR', label: 'Indian Rupee', sortOrder: 1, metadata: { symbol: '₹', decimals: 2 } },
      { code: 'USD', label: 'US Dollar', sortOrder: 2, metadata: { symbol: '$', decimals: 2 } },
      { code: 'EUR', label: 'Euro', sortOrder: 3, metadata: { symbol: '€', decimals: 2 } },
      { code: 'GBP', label: 'British Pound', sortOrder: 4, metadata: { symbol: '£', decimals: 2 } },
      { code: 'JPY', label: 'Japanese Yen', sortOrder: 5, metadata: { symbol: '¥', decimals: 0 } },
      { code: 'AUD', label: 'Australian Dollar', sortOrder: 6, metadata: { symbol: 'A$', decimals: 2 } },
      { code: 'CAD', label: 'Canadian Dollar', sortOrder: 7, metadata: { symbol: 'C$', decimals: 2 } },
      { code: 'CHF', label: 'Swiss Franc', sortOrder: 8, metadata: { symbol: 'CHF', decimals: 2 } },
      { code: 'CNY', label: 'Chinese Yuan', sortOrder: 9, metadata: { symbol: '¥', decimals: 2 } },
      { code: 'SEK', label: 'Swedish Krona', sortOrder: 10, metadata: { symbol: 'kr', decimals: 2 } },
      { code: 'NZD', label: 'New Zealand Dollar', sortOrder: 11, metadata: { symbol: 'NZ$', decimals: 2 } },
      { code: 'SGD', label: 'Singapore Dollar', sortOrder: 12, metadata: { symbol: 'S$', decimals: 2 } },
      { code: 'HKD', label: 'Hong Kong Dollar', sortOrder: 13, metadata: { symbol: 'HK$', decimals: 2 } },
      { code: 'NOK', label: 'Norwegian Krone', sortOrder: 14, metadata: { symbol: 'kr', decimals: 2 } },
      { code: 'KRW', label: 'South Korean Won', sortOrder: 15, metadata: { symbol: '₩', decimals: 0 } },
      { code: 'AED', label: 'UAE Dirham', sortOrder: 16, metadata: { symbol: 'د.إ', decimals: 2 } },
      { code: 'BRL', label: 'Brazilian Real', sortOrder: 17, metadata: { symbol: 'R$', decimals: 2 } },
      { code: 'ZAR', label: 'South African Rand', sortOrder: 18, metadata: { symbol: 'R', decimals: 2 } },
      { code: 'MXN', label: 'Mexican Peso', sortOrder: 19, metadata: { symbol: 'Mex$', decimals: 2 } },
      { code: 'RUB', label: 'Russian Ruble', sortOrder: 20, metadata: { symbol: '₽', decimals: 2 } }
    ];

    await this.createItems(collectionId, currencies);
    console.log(`  ✓ Seeded ${currencies.length} currencies`);
  }

  /**
   * Seed Timezones dataset
   */
  private async seedTimezones() {
    const collectionId = await this.createCollection({
      key: 'timezones',
      name: 'Timezones',
      description: 'IANA timezone identifiers with UTC offsets',
      scope: 'global',
      metadata: { icon: '🕐', immutable: true }
    });

    const timezones: DatasetItem[] = [
      { code: 'Asia/Kolkata', label: 'India Standard Time (IST)', sortOrder: 1, metadata: { utcOffset: '+05:30', dst: false } },
      { code: 'America/New_York', label: 'Eastern Time (ET)', sortOrder: 2, metadata: { utcOffset: '-05:00', dst: true } },
      { code: 'America/Los_Angeles', label: 'Pacific Time (PT)', sortOrder: 3, metadata: { utcOffset: '-08:00', dst: true } },
      { code: 'Europe/London', label: 'British Summer Time (BST)', sortOrder: 4, metadata: { utcOffset: '+00:00', dst: true } },
      { code: 'Europe/Paris', label: 'Central European Time (CET)', sortOrder: 5, metadata: { utcOffset: '+01:00', dst: true } },
      { code: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', sortOrder: 6, metadata: { utcOffset: '+09:00', dst: false } },
      { code: 'Asia/Shanghai', label: 'China Standard Time (CST)', sortOrder: 7, metadata: { utcOffset: '+08:00', dst: false } },
      { code: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', sortOrder: 8, metadata: { utcOffset: '+10:00', dst: true } },
      { code: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', sortOrder: 9, metadata: { utcOffset: '+04:00', dst: false } },
      { code: 'Asia/Singapore', label: 'Singapore Time (SGT)', sortOrder: 10, metadata: { utcOffset: '+08:00', dst: false } }
    ];

    await this.createItems(collectionId, timezones);
    console.log(`  ✓ Seeded ${timezones.length} timezones`);
  }

  /**
   * Seed India States dataset
   */
  private async seedIndiaStates() {
    const collectionId = await this.createCollection({
      key: 'india-states',
      name: 'India - States & UTs',
      description: 'Indian states and union territories',
      scope: 'global',
      metadata: { icon: '🇮🇳', region: 'India' }
    });

    const states: DatasetItem[] = [
      { code: 'AN', label: 'Andaman and Nicobar Islands', sortOrder: 1, metadata: { type: 'UT', capital: 'Port Blair' } },
      { code: 'AP', label: 'Andhra Pradesh', sortOrder: 2, metadata: { type: 'State', capital: 'Amaravati' } },
      { code: 'AR', label: 'Arunachal Pradesh', sortOrder: 3, metadata: { type: 'State', capital: 'Itanagar' } },
      { code: 'AS', label: 'Assam', sortOrder: 4, metadata: { type: 'State', capital: 'Dispur' } },
      { code: 'BR', label: 'Bihar', sortOrder: 5, metadata: { type: 'State', capital: 'Patna' } },
      { code: 'CH', label: 'Chandigarh', sortOrder: 6, metadata: { type: 'UT', capital: 'Chandigarh' } },
      { code: 'CT', label: 'Chhattisgarh', sortOrder: 7, metadata: { type: 'State', capital: 'Raipur' } },
      { code: 'DN', label: 'Dadra and Nagar Haveli', sortOrder: 8, metadata: { type: 'UT', capital: 'Silvassa' } },
      { code: 'DD', label: 'Daman and Diu', sortOrder: 9, metadata: { type: 'UT', capital: 'Daman' } },
      { code: 'DL', label: 'Delhi', sortOrder: 10, metadata: { type: 'UT', capital: 'New Delhi' } },
      { code: 'GA', label: 'Goa', sortOrder: 11, metadata: { type: 'State', capital: 'Panaji' } },
      { code: 'GJ', label: 'Gujarat', sortOrder: 12, metadata: { type: 'State', capital: 'Gandhinagar' } },
      { code: 'HR', label: 'Haryana', sortOrder: 13, metadata: { type: 'State', capital: 'Chandigarh' } },
      { code: 'HP', label: 'Himachal Pradesh', sortOrder: 14, metadata: { type: 'State', capital: 'Shimla' } },
      { code: 'JK', label: 'Jammu and Kashmir', sortOrder: 15, metadata: { type: 'UT', capital: 'Srinagar' } },
      { code: 'JH', label: 'Jharkhand', sortOrder: 16, metadata: { type: 'State', capital: 'Ranchi' } },
      { code: 'KA', label: 'Karnataka', sortOrder: 17, metadata: { type: 'State', capital: 'Bengaluru' } },
      { code: 'KL', label: 'Kerala', sortOrder: 18, metadata: { type: 'State', capital: 'Thiruvananthapuram' } },
      { code: 'LA', label: 'Ladakh', sortOrder: 19, metadata: { type: 'UT', capital: 'Leh' } },
      { code: 'LD', label: 'Lakshadweep', sortOrder: 20, metadata: { type: 'UT', capital: 'Kavaratti' } },
      { code: 'MP', label: 'Madhya Pradesh', sortOrder: 21, metadata: { type: 'State', capital: 'Bhopal' } },
      { code: 'MH', label: 'Maharashtra', sortOrder: 22, metadata: { type: 'State', capital: 'Mumbai' } },
      { code: 'MN', label: 'Manipur', sortOrder: 23, metadata: { type: 'State', capital: 'Imphal' } },
      { code: 'ML', label: 'Meghalaya', sortOrder: 24, metadata: { type: 'State', capital: 'Shillong' } },
      { code: 'MZ', label: 'Mizoram', sortOrder: 25, metadata: { type: 'State', capital: 'Aizawl' } },
      { code: 'NL', label: 'Nagaland', sortOrder: 26, metadata: { type: 'State', capital: 'Kohima' } },
      { code: 'OR', label: 'Odisha', sortOrder: 27, metadata: { type: 'State', capital: 'Bhubaneswar' } },
      { code: 'PY', label: 'Puducherry', sortOrder: 28, metadata: { type: 'UT', capital: 'Puducherry' } },
      { code: 'PB', label: 'Punjab', sortOrder: 29, metadata: { type: 'State', capital: 'Chandigarh' } },
      { code: 'RJ', label: 'Rajasthan', sortOrder: 30, metadata: { type: 'State', capital: 'Jaipur' } },
      { code: 'SK', label: 'Sikkim', sortOrder: 31, metadata: { type: 'State', capital: 'Gangtok' } },
      { code: 'TN', label: 'Tamil Nadu', sortOrder: 32, metadata: { type: 'State', capital: 'Chennai' } },
      { code: 'TG', label: 'Telangana', sortOrder: 33, metadata: { type: 'State', capital: 'Hyderabad' } },
      { code: 'TR', label: 'Tripura', sortOrder: 34, metadata: { type: 'State', capital: 'Agartala' } },
      { code: 'UP', label: 'Uttar Pradesh', sortOrder: 35, metadata: { type: 'State', capital: 'Lucknow' } },
      { code: 'UT', label: 'Uttarakhand', sortOrder: 36, metadata: { type: 'State', capital: 'Dehradun' } },
      { code: 'WB', label: 'West Bengal', sortOrder: 37, metadata: { type: 'State', capital: 'Kolkata' } }
    ];

    await this.createItems(collectionId, states);
    console.log(`  ✓ Seeded ${states.length} India states`);
  }

  /**
   * Seed India Major Cities dataset
   */
  private async seedIndiaCities() {
    const collectionId = await this.createCollection({
      key: 'india-cities',
      name: 'India - Major Cities',
      description: 'Top 50 major cities in India',
      scope: 'global',
      metadata: { icon: '🏙️', region: 'India' }
    });

    const cities: DatasetItem[] = [
      { code: 'BLR', label: 'Bengaluru', sortOrder: 1, metadata: { state: 'KA', population: 12000000 } },
      { code: 'DEL', label: 'New Delhi', sortOrder: 2, metadata: { state: 'DL', population: 30000000 } },
      { code: 'MUM', label: 'Mumbai', sortOrder: 3, metadata: { state: 'MH', population: 20000000 } },
      { code: 'HYD', label: 'Hyderabad', sortOrder: 4, metadata: { state: 'TG', population: 10000000 } },
      { code: 'CHN', label: 'Chennai', sortOrder: 5, metadata: { state: 'TN', population: 10000000 } },
      { code: 'KOL', label: 'Kolkata', sortOrder: 6, metadata: { state: 'WB', population: 15000000 } },
      { code: 'PUN', label: 'Pune', sortOrder: 7, metadata: { state: 'MH', population: 7000000 } },
      { code: 'AMD', label: 'Ahmedabad', sortOrder: 8, metadata: { state: 'GJ', population: 8000000 } },
      { code: 'SUR', label: 'Surat', sortOrder: 9, metadata: { state: 'GJ', population: 6000000 } },
      { code: 'JAI', label: 'Jaipur', sortOrder: 10, metadata: { state: 'RJ', population: 3500000 } },
      { code: 'LKO', label: 'Lucknow', sortOrder: 11, metadata: { state: 'UP', population: 3500000 } },
      { code: 'KAN', label: 'Kanpur', sortOrder: 12, metadata: { state: 'UP', population: 3000000 } },
      { code: 'NAG', label: 'Nagpur', sortOrder: 13, metadata: { state: 'MH', population: 2500000 } },
      { code: 'IND', label: 'Indore', sortOrder: 14, metadata: { state: 'MP', population: 2500000 } },
      { code: 'BHP', label: 'Bhopal', sortOrder: 15, metadata: { state: 'MP', population: 2000000 } },
      { code: 'VIS', label: 'Visakhapatnam', sortOrder: 16, metadata: { state: 'AP', population: 2000000 } },
      { code: 'PAT', label: 'Patna', sortOrder: 17, metadata: { state: 'BR', population: 2000000 } },
      { code: 'VDR', label: 'Vadodara', sortOrder: 18, metadata: { state: 'GJ', population: 2000000 } },
      { code: 'GOA', label: 'Goa', sortOrder: 19, metadata: { state: 'GA', population: 1500000 } },
      { code: 'LUD', label: 'Ludhiana', sortOrder: 20, metadata: { state: 'PB', population: 1600000 } }
    ];

    await this.createItems(collectionId, cities);
    console.log(`  ✓ Seeded ${cities.length} India cities`);
  }

  /**
   * Seed India GST State Codes
   */
  private async seedIndiaGSTCodes() {
    const collectionId = await this.createCollection({
      key: 'india-gst-codes',
      name: 'India - GST State Codes',
      description: 'GST state codes for tax compliance',
      scope: 'global',
      metadata: { icon: '📋', region: 'India', compliance: 'GST' }
    });

    const gstCodes: DatasetItem[] = [
      { code: '01', label: 'Jammu and Kashmir', sortOrder: 1 },
      { code: '02', label: 'Himachal Pradesh', sortOrder: 2 },
      { code: '03', label: 'Punjab', sortOrder: 3 },
      { code: '04', label: 'Chandigarh', sortOrder: 4 },
      { code: '05', label: 'Uttarakhand', sortOrder: 5 },
      { code: '06', label: 'Haryana', sortOrder: 6 },
      { code: '07', label: 'Delhi', sortOrder: 7 },
      { code: '08', label: 'Rajasthan', sortOrder: 8 },
      { code: '09', label: 'Uttar Pradesh', sortOrder: 9 },
      { code: '10', label: 'Bihar', sortOrder: 10 },
      { code: '11', label: 'Sikkim', sortOrder: 11 },
      { code: '12', label: 'Arunachal Pradesh', sortOrder: 12 },
      { code: '13', label: 'Nagaland', sortOrder: 13 },
      { code: '14', label: 'Manipur', sortOrder: 14 },
      { code: '15', label: 'Mizoram', sortOrder: 15 },
      { code: '16', label: 'Tripura', sortOrder: 16 },
      { code: '17', label: 'Meghalaya', sortOrder: 17 },
      { code: '18', label: 'Assam', sortOrder: 18 },
      { code: '19', label: 'West Bengal', sortOrder: 19 },
      { code: '20', label: 'Jharkhand', sortOrder: 20 },
      { code: '21', label: 'Odisha', sortOrder: 21 },
      { code: '22', label: 'Chhattisgarh', sortOrder: 22 },
      { code: '23', label: 'Madhya Pradesh', sortOrder: 23 },
      { code: '24', label: 'Gujarat', sortOrder: 24 },
      { code: '27', label: 'Maharashtra', sortOrder: 25 },
      { code: '29', label: 'Karnataka', sortOrder: 26 },
      { code: '30', label: 'Goa', sortOrder: 27 },
      { code: '32', label: 'Kerala', sortOrder: 28 },
      { code: '33', label: 'Tamil Nadu', sortOrder: 29 },
      { code: '34', label: 'Puducherry', sortOrder: 30 },
      { code: '35', label: 'Andaman and Nicobar', sortOrder: 31 },
      { code: '36', label: 'Telangana', sortOrder: 32 },
      { code: '37', label: 'Andhra Pradesh', sortOrder: 33 },
      { code: '38', label: 'Ladakh', sortOrder: 34 }
    ];

    await this.createItems(collectionId, gstCodes);
    console.log(`  ✓ Seeded ${gstCodes.length} GST state codes`);
  }

  /**
   * Seed Industries dataset
   */
  private async seedIndustries() {
    const collectionId = await this.createCollection({
      key: 'industries',
      name: 'Industries',
      description: 'Business industry categories',
      scope: 'global',
      metadata: { icon: '🏢' }
    });

    const industries: DatasetItem[] = [
      { code: 'tech', label: 'Technology & Software', sortOrder: 1 },
      { code: 'finance', label: 'Finance & Banking', sortOrder: 2 },
      { code: 'healthcare', label: 'Healthcare & Life Sciences', sortOrder: 3 },
      { code: 'education', label: 'Education & E-learning', sortOrder: 4 },
      { code: 'ecommerce', label: 'E-commerce & Retail', sortOrder: 5 },
      { code: 'manufacturing', label: 'Manufacturing', sortOrder: 6 },
      { code: 'realestate', label: 'Real Estate', sortOrder: 7 },
      { code: 'consulting', label: 'Consulting', sortOrder: 8 },
      { code: 'media', label: 'Media & Entertainment', sortOrder: 9 },
      { code: 'hospitality', label: 'Hospitality & Tourism', sortOrder: 10 },
      { code: 'agriculture', label: 'Agriculture & Farming', sortOrder: 11 },
      { code: 'automotive', label: 'Automotive', sortOrder: 12 },
      { code: 'telecom', label: 'Telecommunications', sortOrder: 13 },
      { code: 'energy', label: 'Energy & Utilities', sortOrder: 14 },
      { code: 'logistics', label: 'Logistics & Transportation', sortOrder: 15 }
    ];

    await this.createItems(collectionId, industries);
    console.log(`  ✓ Seeded ${industries.length} industries`);
  }

  /**
   * Seed Company Sizes dataset
   */
  private async seedCompanySizes() {
    const collectionId = await this.createCollection({
      key: 'company-sizes',
      name: 'Company Sizes',
      description: 'Organization size categories',
      scope: 'global',
      metadata: { icon: '📊' }
    });

    const sizes: DatasetItem[] = [
      { code: 'solo', label: 'Solo (1 employee)', sortOrder: 1, metadata: { min: 1, max: 1 } },
      { code: 'startup', label: 'Startup (2-10 employees)', sortOrder: 2, metadata: { min: 2, max: 10 } },
      { code: 'small', label: 'Small (11-50 employees)', sortOrder: 3, metadata: { min: 11, max: 50 } },
      { code: 'medium', label: 'Medium (51-200 employees)', sortOrder: 4, metadata: { min: 51, max: 200 } },
      { code: 'large', label: 'Large (201-1000 employees)', sortOrder: 5, metadata: { min: 201, max: 1000 } },
      { code: 'enterprise', label: 'Enterprise (1001+ employees)', sortOrder: 6, metadata: { min: 1001, max: null } }
    ];

    await this.createItems(collectionId, sizes);
    console.log(`  ✓ Seeded ${sizes.length} company sizes`);
  }

  /**
   * Seed Job Roles dataset
   */
  private async seedJobRoles() {
    const collectionId = await this.createCollection({
      key: 'job-roles',
      name: 'Job Roles',
      description: 'Common professional roles and titles',
      scope: 'global',
      metadata: { icon: '👔' }
    });

    const roles: DatasetItem[] = [
      { code: 'ceo', label: 'CEO / Founder', sortOrder: 1, metadata: { level: 'executive' } },
      { code: 'cto', label: 'CTO / VP Engineering', sortOrder: 2, metadata: { level: 'executive' } },
      { code: 'cfo', label: 'CFO / Finance Head', sortOrder: 3, metadata: { level: 'executive' } },
      { code: 'coo', label: 'COO / Operations Head', sortOrder: 4, metadata: { level: 'executive' } },
      { code: 'product-manager', label: 'Product Manager', sortOrder: 5, metadata: { level: 'manager' } },
      { code: 'engineering-manager', label: 'Engineering Manager', sortOrder: 6, metadata: { level: 'manager' } },
      { code: 'software-engineer', label: 'Software Engineer', sortOrder: 7, metadata: { level: 'individual' } },
      { code: 'designer', label: 'Designer (UI/UX)', sortOrder: 8, metadata: { level: 'individual' } },
      { code: 'data-scientist', label: 'Data Scientist', sortOrder: 9, metadata: { level: 'individual' } },
      { code: 'sales-manager', label: 'Sales Manager', sortOrder: 10, metadata: { level: 'manager' } },
      { code: 'marketing-manager', label: 'Marketing Manager', sortOrder: 11, metadata: { level: 'manager' } },
      { code: 'hr-manager', label: 'HR Manager', sortOrder: 12, metadata: { level: 'manager' } },
      { code: 'business-analyst', label: 'Business Analyst', sortOrder: 13, metadata: { level: 'individual' } },
      { code: 'devops', label: 'DevOps Engineer', sortOrder: 14, metadata: { level: 'individual' } },
      { code: 'consultant', label: 'Consultant', sortOrder: 15, metadata: { level: 'individual' } }
    ];

    await this.createItems(collectionId, roles);
    console.log(`  ✓ Seeded ${roles.length} job roles`);
  }
}

export const datasetSeedingService = new DatasetSeedingService();
