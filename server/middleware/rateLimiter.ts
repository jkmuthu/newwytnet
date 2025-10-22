
import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Rate limiter middleware factory
 * Implements sliding window rate limiting
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100,
    message = 'Too many requests, please try again later'
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    // Get client identifier (IP + User ID if authenticated)
    const user = (req as any).user;
    const clientId = user ? `${req.ip}-${user.id}` : req.ip || 'unknown';
    
    const now = Date.now();
    
    // Initialize or get existing rate limit data
    if (!store[clientId] || store[clientId].resetTime < now) {
      store[clientId] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Increment request count
    store[clientId].count++;

    // Check if limit exceeded
    if (store[clientId].count > maxRequests) {
      const retryAfter = Math.ceil((store[clientId].resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', store[clientId].resetTime.toString());
      
      return res.status(429).json({
        error: message,
        retryAfter,
        limit: maxRequests,
        windowMs
      });
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - store[clientId].count).toString());
    res.setHeader('X-RateLimit-Reset', store[clientId].resetTime.toString());

    next();
  };
}

/**
 * Predefined rate limiters for different use cases
 */
export const rateLimiters = {
  // General API rate limit - 100 requests per 15 minutes
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'Too many API requests'
  }),

  // Authentication endpoints - 5 attempts per 15 minutes
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later'
  }),

  // Post creation - 10 posts per hour
  postCreation: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    message: 'Post creation limit reached, please try again later'
  }),

  // File upload - 20 uploads per hour
  fileUpload: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 20,
    message: 'File upload limit reached, please try again later'
  }),

  // Payment operations - 5 per hour
  payment: createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Payment operation limit reached, please contact support'
  }),

  // Admin operations - 200 per 15 minutes
  admin: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 200,
    message: 'Admin operation limit reached'
  })
};
