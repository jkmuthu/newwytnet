import { db } from "../db";
import { tmNumbers, niceClassifications } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * WytAi TMNumber11 Proprietary Numbering System
 * Format: CC + CCC + PPPPP + D (Class 2 + Country 3 + Product 5 + Check 1)
 * 
 * Example: 09356000015
 * - CC: 09 (Nice Classification - Software/Electronics)
 * - CCC: 356 (Country Code - India ISO Numeric)
 * - PPPPP: 00001 (Product Sequence)
 * - D: 5 (Luhn Check Digit)
 */

export interface TMNumber11 {
  classCc: string;
  countryCcc: string;
  productPpppp: string;
  checkD: string;
  tmnumber11: string;
  title: string;
  longDesc?: string;
  keywords: string[];
  segmentKey?: string;
}

export interface TMNumberGenerator {
  class: string;
  country: string;
  product: string;
}

export interface TMNumberValidation {
  isValid: boolean;
  reason?: string;
  components?: {
    class: string;
    country: string;
    product: string;
    check: string;
  };
}

/**
 * Luhn Algorithm - Mod 10 Check Digit Calculation
 * Used for TMNumber11 validation and generation
 */
export function calculateLuhnCheckDigit(base10String: string): string {
  // Remove any non-numeric characters
  const digits = base10String.replace(/\D/g, '');
  
  let sum = 0;
  let isEven = false;
  
  // Process digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

/**
 * Validate Luhn check digit
 */
export function validateLuhnCheckDigit(numberWithCheck: string): boolean {
  if (numberWithCheck.length < 2) return false;
  
  const baseNumber = numberWithCheck.slice(0, -1);
  const providedCheck = numberWithCheck.slice(-1);
  const calculatedCheck = calculateLuhnCheckDigit(baseNumber);
  
  return providedCheck === calculatedCheck;
}

/**
 * Generate TMNumber11 with Luhn check digit
 */
export async function generateTMNumber11(
  classCc: string, 
  countryCcc: string, 
  productPpppp: string
): Promise<string> {
  // Validate input format
  if (!/^\d{2}$/.test(classCc)) {
    throw new Error('Class code must be 2 digits (01-45)');
  }
  if (!/^\d{3}$/.test(countryCcc)) {
    throw new Error('Country code must be 3 digits (ISO numeric)');
  }
  if (!/^\d{5}$/.test(productPpppp)) {
    throw new Error('Product code must be 5 digits');
  }
  
  // Validate class range
  const classNum = parseInt(classCc);
  if (classNum < 1 || classNum > 45) {
    throw new Error('Class code must be between 01 and 45');
  }
  
  // Create base 10-digit number
  const base10 = classCc + countryCcc + productPpppp;
  
  // Calculate Luhn check digit
  const checkDigit = calculateLuhnCheckDigit(base10);
  
  // Create final 11-digit TMNumber
  const tmnumber11 = base10 + checkDigit;
  
  return tmnumber11;
}

/**
 * Validate TMNumber11 format and check digit
 */
export function validateTMNumber11(code: string): TMNumberValidation {
  // Basic format validation
  if (!/^\d{11}$/.test(code)) {
    return {
      isValid: false,
      reason: 'TMNumber11 must be exactly 11 digits'
    };
  }
  
  // Extract components
  const classCc = code.substring(0, 2);
  const countryCcc = code.substring(2, 5);
  const productPpppp = code.substring(5, 10);
  const checkD = code.substring(10, 11);
  
  // Validate class range
  const classNum = parseInt(classCc);
  if (classNum < 1 || classNum > 45) {
    return {
      isValid: false,
      reason: 'Invalid class code (must be 01-45)',
      components: { class: classCc, country: countryCcc, product: productPpppp, check: checkD }
    };
  }
  
  // Validate Luhn check digit
  const baseNumber = code.substring(0, 10);
  const calculatedCheck = calculateLuhnCheckDigit(baseNumber);
  
  if (checkD !== calculatedCheck) {
    return {
      isValid: false,
      reason: `Invalid check digit. Expected ${calculatedCheck}, got ${checkD}`,
      components: { class: classCc, country: countryCcc, product: productPpppp, check: checkD }
    };
  }
  
  return {
    isValid: true,
    components: { class: classCc, country: countryCcc, product: productPpppp, check: checkD }
  };
}

/**
 * Get next available product code for a class/country combination
 */
export async function getNextProductCode(classCc: string, countryCcc: string): Promise<string> {
  const lastNumber = await db
    .select()
    .from(tmNumbers)
    .where(and(
      eq(tmNumbers.classCc, classCc),
      eq(tmNumbers.countryCcc, countryCcc)
    ))
    .orderBy(desc(tmNumbers.productPpppp))
    .limit(1);
  
  if (lastNumber.length === 0) {
    return '00001';
  }
  
  const lastProductCode = parseInt(lastNumber[0].productPpppp);
  const nextCode = lastProductCode + 1;
  
  // Ensure 5-digit format with leading zeros
  return nextCode.toString().padStart(5, '0');
}

/**
 * Create a new TMNumber11 entry
 */
export async function createTMNumber11(data: {
  classCc: string;
  countryCcc: string;
  productPpppp?: string;
  title: string;
  longDesc?: string;
  keywords?: string[];
  segmentKey?: string;
  tenantId?: string;
  createdBy?: string;
}): Promise<TMNumber11> {
  // Get next product code if not provided
  const productCode = data.productPpppp || await getNextProductCode(data.classCc, data.countryCcc);
  
  // Generate TMNumber11
  const tmnumber11 = await generateTMNumber11(data.classCc, data.countryCcc, productCode);
  const checkDigit = calculateLuhnCheckDigit(data.classCc + data.countryCcc + productCode);
  
  // Create database record
  const [created] = await db.insert(tmNumbers).values({
    classCc: data.classCc,
    countryCcc: data.countryCcc,
    productPpppp: productCode,
    checkD: checkDigit,
    tmnumber11,
    title: data.title,
    longDesc: data.longDesc,
    keywords: data.keywords || [],
    segmentKey: data.segmentKey,
    tenantId: data.tenantId,
    createdBy: data.createdBy,
  }).returning();
  
  return {
    classCc: created.classCc,
    countryCcc: created.countryCcc,
    productPpppp: created.productPpppp,
    checkD: created.checkD,
    tmnumber11: created.tmnumber11,
    title: created.title,
    longDesc: created.longDesc || undefined,
    keywords: Array.isArray(created.keywords) ? created.keywords as string[] : [],
    segmentKey: created.segmentKey || undefined,
  };
}

/**
 * Search TMNumbers by criteria
 */
export async function searchTMNumbers(criteria: {
  classCc?: string;
  countryCcc?: string;
  keyword?: string;
  segmentKey?: string;
  status?: string;
  limit?: number;
}) {
  let query = db.select().from(tmNumbers);
  
  const conditions = [];
  
  if (criteria.classCc) {
    conditions.push(eq(tmNumbers.classCc, criteria.classCc));
  }
  
  if (criteria.countryCcc) {
    conditions.push(eq(tmNumbers.countryCcc, criteria.countryCcc));
  }
  
  if (criteria.segmentKey) {
    conditions.push(eq(tmNumbers.segmentKey, criteria.segmentKey));
  }
  
  if (criteria.status) {
    conditions.push(eq(tmNumbers.status, criteria.status));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  return await query.limit(criteria.limit || 50);
}

/**
 * Initialize Nice Classifications (01-45)
 */
export async function initializeNiceClassifications() {
  const classifications = [
    { classNumber: '01', title: 'Chemicals', description: 'Chemicals for use in industry, science and photography, as well as in agriculture, horticulture and forestry; unprocessed artificial resins, unprocessed plastics; fire extinguishing and fire prevention compositions; tempering and soldering preparations; substances for tanning animal skins and hides; adhesives for use in industry; putties and other paste fillers; compost, manures, fertilizers; biological preparations for use in industry and science.', category: 'goods' },
    { classNumber: '02', title: 'Paints', description: 'Paints, varnishes, lacquers; preservatives against rust and against deterioration of wood; colorants, dyes; inks for printing, marking and engraving; raw natural resins; metals in foil and powder form for use in painting, decorating, printing and art.', category: 'goods' },
    { classNumber: '03', title: 'Cosmetics and cleaning preparations', description: 'Non-medicated cosmetics and toiletry preparations; non-medicated dentifrices; perfumery, essential oils; bleaching preparations and other substances for laundry use; cleaning, polishing, scouring and abrasive preparations.', category: 'goods' },
    { classNumber: '04', title: 'Industrial oils and greases', description: 'Industrial oils and greases, wax; lubricants; dust absorbing, wetting and binding compositions; fuels and illuminants; candles and wicks for lighting.', category: 'goods' },
    { classNumber: '05', title: 'Pharmaceuticals', description: 'Pharmaceuticals, medical and veterinary preparations; sanitary preparations for medical purposes; dietetic food and substances adapted for medical or veterinary use, food for babies; dietary supplements for human beings and animals; plasters, materials for dressings; material for stopping teeth, dental wax; disinfectants; preparations for destroying vermin; fungicides, herbicides.', category: 'goods' },
    { classNumber: '09', title: 'Scientific and electric apparatus', description: 'Scientific, research, navigation, surveying, photographic, cinematographic, audiovisual, optical, weighing, measuring, signalling, detecting, testing, inspecting, life-saving and teaching apparatus and instruments; apparatus and instruments for conducting, switching, transforming, accumulating, regulating or controlling the distribution or use of electricity; apparatus and instruments for recording, transmitting, reproducing or processing sound, images or data; recorded and downloadable media, computer software, blank digital or analogue recording and storage media; mechanisms for coin-operated apparatus; cash registers, calculating devices; computers and computer peripheral devices; diving suits, divers\' masks, ear plugs for divers, nose clips for divers and swimmers, gloves for divers, breathing apparatus for underwater swimming; fire-extinguishing apparatus.', category: 'goods' },
    { classNumber: '35', title: 'Advertising and business', description: 'Advertising; business management, organization and administration; office functions.', category: 'services' },
    { classNumber: '42', title: 'Scientific and technological services', description: 'Scientific and technological services and research and design relating thereto; industrial analysis, industrial research and industrial design services; quality control and authentication services; design and development of computer hardware and software.', category: 'services' },
    { classNumber: '43', title: 'Services for providing food and drink', description: 'Services for providing food and drink; temporary accommodation.', category: 'services' },
  ];
  
  for (const classification of classifications) {
    try {
      await db.insert(niceClassifications).values({
        ...classification,
        examples: [],
      }).onConflictDoNothing();
    } catch (error) {
      // Classification already exists, skip
    }
  }
}

/**
 * Seed sample TMNumbers for India (356) - Classes 09 and 35
 */
export async function seedSampleTMNumbers() {
  const sampleData = [
    // Class 09 - Scientific and electric apparatus (20 items)
    { class: '09', title: 'Mobile Application Software', keywords: ['mobile', 'app', 'software', 'android', 'ios'], segment: 'software' },
    { class: '09', title: 'Computer Hardware Components', keywords: ['computer', 'hardware', 'components', 'processor', 'memory'], segment: 'hardware' },
    { class: '09', title: 'Digital Camera Equipment', keywords: ['camera', 'digital', 'photography', 'lens', 'sensor'], segment: 'optical' },
    { class: '09', title: 'Bluetooth Wireless Speakers', keywords: ['bluetooth', 'wireless', 'speakers', 'audio', 'portable'], segment: 'audio' },
    { class: '09', title: 'Smart Home Automation', keywords: ['smart', 'home', 'automation', 'iot', 'control'], segment: 'automation' },
    { class: '09', title: 'Artificial Intelligence Software', keywords: ['ai', 'artificial', 'intelligence', 'machine', 'learning'], segment: 'software' },
    { class: '09', title: 'Virtual Reality Headsets', keywords: ['vr', 'virtual', 'reality', 'headset', 'immersive'], segment: 'optical' },
    { class: '09', title: 'Electronic Payment Systems', keywords: ['payment', 'electronic', 'digital', 'transaction', 'fintech'], segment: 'software' },
    { class: '09', title: 'Drone Navigation Systems', keywords: ['drone', 'navigation', 'gps', 'autonomous', 'flight'], segment: 'navigation' },
    { class: '09', title: 'Cybersecurity Solutions', keywords: ['cybersecurity', 'security', 'protection', 'encryption', 'firewall'], segment: 'software' },
    { class: '09', title: 'Cloud Computing Platforms', keywords: ['cloud', 'computing', 'platform', 'hosting', 'saas'], segment: 'software' },
    { class: '09', title: 'Biometric Scanners', keywords: ['biometric', 'scanner', 'fingerprint', 'facial', 'recognition'], segment: 'security' },
    { class: '09', title: 'Solar Panel Controllers', keywords: ['solar', 'panel', 'controller', 'renewable', 'energy'], segment: 'energy' },
    { class: '09', title: 'Medical Diagnostic Devices', keywords: ['medical', 'diagnostic', 'health', 'monitoring', 'device'], segment: 'medical' },
    { class: '09', title: 'Educational Learning Apps', keywords: ['education', 'learning', 'app', 'training', 'elearning'], segment: 'software' },
    { class: '09', title: 'Cryptocurrency Wallets', keywords: ['cryptocurrency', 'wallet', 'blockchain', 'bitcoin', 'digital'], segment: 'software' },
    { class: '09', title: 'Fitness Tracking Devices', keywords: ['fitness', 'tracking', 'health', 'wearable', 'monitor'], segment: 'wearable' },
    { class: '09', title: 'Video Streaming Software', keywords: ['video', 'streaming', 'media', 'entertainment', 'platform'], segment: 'software' },
    { class: '09', title: 'GPS Navigation Systems', keywords: ['gps', 'navigation', 'mapping', 'location', 'routing'], segment: 'navigation' },
    { class: '09', title: 'Industrial Automation Equipment', keywords: ['industrial', 'automation', 'manufacturing', 'control', 'robotics'], segment: 'automation' },
    
    // Class 35 - Advertising and business (20 items)
    { class: '35', title: 'Digital Marketing Services', keywords: ['digital', 'marketing', 'advertising', 'online', 'promotion'], segment: 'marketing' },
    { class: '35', title: 'Business Process Outsourcing', keywords: ['bpo', 'outsourcing', 'business', 'process', 'services'], segment: 'consulting' },
    { class: '35', title: 'E-commerce Platform Management', keywords: ['ecommerce', 'platform', 'management', 'online', 'retail'], segment: 'ecommerce' },
    { class: '35', title: 'Human Resources Consulting', keywords: ['hr', 'human', 'resources', 'consulting', 'recruitment'], segment: 'consulting' },
    { class: '35', title: 'Market Research Analysis', keywords: ['market', 'research', 'analysis', 'data', 'insights'], segment: 'research' },
    { class: '35', title: 'Brand Strategy Development', keywords: ['brand', 'strategy', 'development', 'identity', 'positioning'], segment: 'marketing' },
    { class: '35', title: 'Supply Chain Management', keywords: ['supply', 'chain', 'management', 'logistics', 'operations'], segment: 'logistics' },
    { class: '35', title: 'Customer Relationship Management', keywords: ['crm', 'customer', 'relationship', 'management', 'service'], segment: 'software' },
    { class: '35', title: 'Financial Advisory Services', keywords: ['financial', 'advisory', 'consulting', 'investment', 'planning'], segment: 'consulting' },
    { class: '35', title: 'Event Management Services', keywords: ['event', 'management', 'planning', 'coordination', 'organizing'], segment: 'events' },
    { class: '35', title: 'Social Media Management', keywords: ['social', 'media', 'management', 'content', 'engagement'], segment: 'marketing' },
    { class: '35', title: 'Business Intelligence Solutions', keywords: ['business', 'intelligence', 'analytics', 'data', 'reporting'], segment: 'analytics' },
    { class: '35', title: 'Franchise Development Services', keywords: ['franchise', 'development', 'business', 'expansion', 'licensing'], segment: 'consulting' },
    { class: '35', title: 'Office Administration Services', keywords: ['office', 'administration', 'clerical', 'support', 'management'], segment: 'administration' },
    { class: '35', title: 'Procurement Management', keywords: ['procurement', 'purchasing', 'vendor', 'management', 'sourcing'], segment: 'logistics' },
    { class: '35', title: 'Quality Control Services', keywords: ['quality', 'control', 'assurance', 'testing', 'inspection'], segment: 'quality' },
    { class: '35', title: 'Retail Store Management', keywords: ['retail', 'store', 'management', 'operations', 'merchandising'], segment: 'retail' },
    { class: '35', title: 'Training and Development', keywords: ['training', 'development', 'education', 'skills', 'corporate'], segment: 'training' },
    { class: '35', title: 'Telemarketing Services', keywords: ['telemarketing', 'sales', 'calling', 'lead', 'generation'], segment: 'marketing' },
    { class: '35', title: 'Inventory Management Systems', keywords: ['inventory', 'management', 'stock', 'tracking', 'warehouse'], segment: 'logistics' },
  ];
  
  for (const item of sampleData) {
    try {
      const productCode = await getNextProductCode(item.class, '356'); // India
      const tmnumber11 = await generateTMNumber11(item.class, '356', productCode);
      const checkDigit = calculateLuhnCheckDigit(item.class + '356' + productCode);
      
      await db.insert(tmNumbers).values({
        classCc: item.class,
        countryCcc: '356',
        productPpppp: productCode,
        checkD: checkDigit,
        tmnumber11,
        title: item.title,
        longDesc: `Comprehensive ${item.title.toLowerCase()} solutions for Indian market`,
        keywords: item.keywords,
        segmentKey: item.segment,
        status: 'active',
      }).onConflictDoNothing();
    } catch (error) {
      console.error(`Error seeding TMNumber for ${item.title}:`, error);
    }
  }
  
  // Add one example alias/deprecation mapping
  try {
    const originalNumber = await db.select().from(tmNumbers).where(eq(tmNumbers.title, 'Mobile Application Software')).limit(1);
    if (originalNumber.length > 0) {
      const productCode = await getNextProductCode('09', '356');
      const tmnumber11 = await generateTMNumber11('09', '356', productCode);
      const checkDigit = calculateLuhnCheckDigit('09' + '356' + productCode);
      
      await db.insert(tmNumbers).values({
        classCc: '09',
        countryCcc: '356',
        productPpppp: productCode,
        checkD: checkDigit,
        tmnumber11,
        title: 'Mobile App Software (Deprecated)',
        longDesc: 'Deprecated version - use Mobile Application Software instead',
        keywords: ['mobile', 'app', 'software', 'deprecated'],
        segmentKey: 'software',
        status: 'deprecated',
        aliasOf: originalNumber[0].id,
      }).onConflictDoNothing();
    }
  } catch (error) {
    console.error('Error creating alias mapping:', error);
  }
}