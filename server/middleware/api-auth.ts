import { Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../services/api-key-service';
import { apiUsageService } from '../services/api-usage-service';

export interface ApiAuthRequest extends Request {
  apiAuth?: {
    keyId: string;
    userId: string;
    tier: string;
    keyName: string;
  };
}

export async function apiAuthMiddleware(
  req: ApiAuthRequest,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await logFailedRequest(req, 401, 'Missing or invalid Authorization header');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Use: Authorization: Bearer <api_key>',
      });
    }

    const apiKey = authHeader.substring(7);

    const validation = await apiKeyService.validateKey(apiKey);

    if (!validation.valid) {
      await logFailedRequest(req, 401, validation.reason);
      return res.status(401).json({
        error: 'Unauthorized',
        message: validation.reason || 'Invalid API key',
      });
    }

    const { keyData } = validation;

    const rateLimit = await apiUsageService.checkRateLimit(keyData.id, keyData.tier);
    
    res.setHeader('X-RateLimit-Limit', rateLimit.limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimit.limit - rateLimit.current - 1).toString());
    res.setHeader('X-RateLimit-Reset', rateLimit.resetAt.toISOString());

    if (!rateLimit.allowed) {
      await apiUsageService.logRequest({
        apiKeyId: keyData.id,
        userId: keyData.userId,
        endpoint: req.path,
        method: req.method,
        statusCode: 429,
        responseTime: Date.now() - startTime,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        errorMessage: 'Rate limit exceeded',
      });

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Limit: ${rateLimit.limit} requests/minute`,
        retryAfter: rateLimit.resetAt,
      });
    }

    const monthlyLimit = await apiUsageService.checkMonthlyLimit(keyData.userId, keyData.tier);

    if (!monthlyLimit.allowed) {
      await apiUsageService.logRequest({
        apiKeyId: keyData.id,
        userId: keyData.userId,
        endpoint: req.path,
        method: req.method,
        statusCode: 429,
        responseTime: Date.now() - startTime,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        errorMessage: 'Monthly quota exceeded',
      });

      return res.status(429).json({
        error: 'Quota Exceeded',
        message: `Monthly quota exceeded. Limit: ${monthlyLimit.limit} requests/month. Upgrade your tier for more requests.`,
        resetAt: monthlyLimit.resetAt,
      });
    }

    req.apiAuth = {
      keyId: keyData.id,
      userId: keyData.userId,
      tier: keyData.tier,
      keyName: keyData.name,
    };

    const originalJson = res.json.bind(res);
    res.json = function(body: any) {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;

      apiUsageService.logRequest({
        apiKeyId: keyData.id,
        userId: keyData.userId,
        endpoint: req.path,
        method: req.method,
        statusCode,
        responseTime,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestParams: {
          query: req.query,
          params: req.params,
        },
      }).catch(err => console.error('[API Auth] Failed to log request:', err));

      return originalJson(body);
    };

    next();
  } catch (error) {
    console.error('[API Auth] Middleware error:', error);
    await logFailedRequest(req, 500, 'Internal server error');
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while processing your request',
    });
  }
}

async function logFailedRequest(req: Request, statusCode: number, errorMessage?: string) {
  try {
    const apiKey = req.headers.authorization?.substring(7);
    if (apiKey) {
      const validation = await apiKeyService.validateKey(apiKey);
      if (validation.valid && validation.keyData) {
        await apiUsageService.logRequest({
          apiKeyId: validation.keyData.id,
          userId: validation.keyData.userId,
          endpoint: req.path,
          method: req.method,
          statusCode,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          errorMessage,
        });
      }
    }
  } catch (error) {
    console.error('[API Auth] Failed to log failed request:', error);
  }
}
