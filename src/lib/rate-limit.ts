/**
 * Simple in-memory rate limiter for API routes
 *
 * For production, consider using:
 * - @upstash/ratelimit with Upstash Redis (recommended for serverless)
 * - Redis with ioredis
 * - Vercel's built-in rate limiting
 *
 * This implementation uses a sliding window algorithm
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store - NOTE: This won't work across multiple serverless instances
// For production, use Redis or similar distributed cache
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((entry, key) => {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    });
  }, 60000); // Clean every minute
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Unique identifier prefix for this limiter */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for an identifier (usually IP or user ID)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup();

  const { limit, windowMs, prefix = 'default' } = config;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  // Increment count
  entry.count += 1;

  const remaining = Math.max(0, limit - entry.count);
  const success = entry.count <= limit;

  return {
    success,
    limit,
    remaining,
    reset: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header (for proxies) or falls back to a hash
 */
export function getClientIdentifier(request: Request): string {
  // Try X-Forwarded-For first (common for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP if multiple are present
    return forwardedFor.split(',')[0].trim();
  }

  // Try X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a hash of user-agent + some other headers
  const ua = request.headers.get('user-agent') || 'unknown';
  const accept = request.headers.get('accept') || '';
  return `fallback:${simpleHash(ua + accept)}`;
}

/**
 * Simple hash function for fallback identifier
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
  };
}

/**
 * Higher-order function to wrap an API handler with rate limiting
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: Request, ...args: unknown[]) => Promise<Response>
) {
  return async (request: Request, ...args: unknown[]): Promise<Response> => {
    const identifier = getClientIdentifier(request);
    const result = checkRateLimit(identifier, config);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            ...rateLimitHeaders(result),
          },
        }
      );
    }

    const response = await handler(request, ...args);

    // Add rate limit headers to response
    const headers = new Headers(response.headers);
    Object.entries(rateLimitHeaders(result)).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// Preset configurations for common use cases
export const RATE_LIMITS = {
  /** Strict limit for authentication endpoints */
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000, prefix: 'auth' }, // 5 per 15 min

  /** Standard API limit */
  API: { limit: 100, windowMs: 60 * 1000, prefix: 'api' }, // 100 per min

  /** Email sending limit */
  EMAIL: { limit: 10, windowMs: 60 * 1000, prefix: 'email' }, // 10 per min

  /** Video call creation limit */
  CALLS: { limit: 10, windowMs: 60 * 1000, prefix: 'calls' }, // 10 per min

  /** Tile requests (less strict due to map usage) */
  TILES: { limit: 500, windowMs: 60 * 1000, prefix: 'tiles' }, // 500 per min
} as const;
