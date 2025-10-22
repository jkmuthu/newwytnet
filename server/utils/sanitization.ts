
/**
 * Enterprise-grade input sanitization utilities
 * Prevents XSS, SQL injection, and other security vulnerabilities
 */

/**
 * Remove HTML tags and sanitize text input
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  
  const sanitized = email.toLowerCase().trim();
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
}

/**
 * Sanitize phone number (Indian format)
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Validate Indian phone number (10 digits)
  if (cleaned.length !== 10 || !cleaned.match(/^[6-9]/)) {
    throw new Error('Invalid Indian phone number');
  }
  
  return cleaned;
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    return parsed.toString();
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

/**
 * Check for SQL injection patterns
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION.*SELECT)/gi,
    /(;.*--)/gi,
    /('.*OR.*'.*=.*')/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for XSS patterns
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation
 */
export function validateAndSanitizeInput(
  input: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowedChars?: RegExp;
    checkSql?: boolean;
    checkXss?: boolean;
  } = {}
): string {
  const {
    minLength = 0,
    maxLength = 10000,
    checkSql = true,
    checkXss = true
  } = options;
  
  if (!input) {
    throw new Error('Input is required');
  }
  
  const trimmed = input.trim();
  
  if (trimmed.length < minLength) {
    throw new Error(`Input must be at least ${minLength} characters`);
  }
  
  if (trimmed.length > maxLength) {
    throw new Error(`Input cannot exceed ${maxLength} characters`);
  }
  
  if (checkSql && containsSqlInjection(trimmed)) {
    throw new Error('Input contains prohibited SQL patterns');
  }
  
  if (checkXss && containsXss(trimmed)) {
    throw new Error('Input contains prohibited script patterns');
  }
  
  return sanitizeText(trimmed);
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) throw new Error('File name is required');
  
  // Remove path separators and dangerous characters
  return fileName
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255); // Limit length
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(input: any, options: {
  min?: number;
  max?: number;
  allowFloat?: boolean;
} = {}): number {
  const {
    min = -Infinity,
    max = Infinity,
    allowFloat = false
  } = options;
  
  const num = Number(input);
  
  if (isNaN(num)) {
    throw new Error('Invalid number format');
  }
  
  if (!allowFloat && !Number.isInteger(num)) {
    throw new Error('Only integers are allowed');
  }
  
  if (num < min || num > max) {
    throw new Error(`Number must be between ${min} and ${max}`);
  }
  
  return num;
}
