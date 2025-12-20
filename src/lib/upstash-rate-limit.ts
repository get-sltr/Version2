/**
 * Upstash Redis-based rate limiter
 *
 * This provides distributed rate limiting that works across
 * multiple serverless instances (unlike in-memory rate limiting)
 *
 * Setup:
 * 1. Create account at https://upstash.com
 * 2. Create a Redis database
 * 3. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Check if Upstash is configured
const isUpstashConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client (only if configured)
const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Rate limiter configurations for different endpoints
 */
export const rateLimiters = {
  /**
   * Authentication endpoints - strict limit to prevent brute force
   * 5 requests per 15 minutes
   */
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        prefix: 'ratelimit:auth',
        analytics: true,
      })
    : null,

  /**
   * General API endpoints
   * 100 requests per minute
   */
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        prefix: 'ratelimit:api',
        analytics: true,
      })
    : null,

  /**
   * Email sending
   * 10 emails per minute
   */
  email: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'ratelimit:email',
        analytics: true,
      })
    : null,

  /**
   * Video call creation
   * 10 calls per minute
   */
  calls: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'ratelimit:calls',
        analytics: true,
      })
    : null,

  /**
   * LiveKit room/token generation
   * 20 requests per minute
   */
  livekit: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: 'ratelimit:livekit',
        analytics: true,
      })
    : null,

  /**
   * Map tile requests - high limit for map interaction
   * 500 requests per minute
   */
  tiles: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(500, '1 m'),
        prefix: 'ratelimit:tiles',
        analytics: true,
      })
    : null,
};

export type RateLimiterType = keyof typeof rateLimiters;

/**
 * Check rate limit for a given identifier
 */
export async function checkUpstashRateLimit(
  identifier: string,
  type: RateLimiterType
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const limiter = rateLimiters[type];

  // If Upstash is not configured, allow all requests (development mode)
  if (!limiter) {
    console.warn(`Upstash rate limiting not configured. Allowing request for ${type}.`);
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // If rate limiting fails, allow the request but log the error
    console.error('Rate limiting error:', error);
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Validates an IP address format (basic validation)
 */
function isValidIpAddress(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

  if (ipv4Pattern.test(ip)) {
    // Validate each octet is 0-255
    const octets = ip.split('.');
    return octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Pattern.test(ip);
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
 * Get client identifier from request
 *
 * Security notes:
 * - When behind a trusted proxy (Vercel, Cloudflare), X-Forwarded-For is reliable
 * - The proxy should be configured to strip/overwrite client-provided X-Forwarded-For
 * - We validate IP format to prevent injection attacks
 * - Fallback creates a semi-unique identifier from request characteristics
 */
export function getClientIdentifier(request: Request): string {
  // Try X-Forwarded-For first (common for proxied requests)
  // Note: Vercel automatically sets this from the actual client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP (client IP when behind single proxy)
    // or last IP before our proxy in multi-proxy setups
    const ip = forwardedFor.split(',')[0].trim();

    // Validate IP format to prevent header injection
    if (isValidIpAddress(ip)) {
      return ip;
    }
    // If invalid, fall through to other methods
  }

  // Try X-Real-IP (used by nginx)
  const realIp = request.headers.get('x-real-ip');
  if (realIp && isValidIpAddress(realIp.trim())) {
    return realIp.trim();
  }

  // Try CF-Connecting-IP (Cloudflare)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && isValidIpAddress(cfIp.trim())) {
    return cfIp.trim();
  }

  // Fallback: Create a semi-unique identifier from request characteristics
  // This prevents all unknown clients from sharing a single rate limit bucket
  const ua = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';
  const acceptLang = request.headers.get('accept-language') || '';
  const acceptEnc = request.headers.get('accept-encoding') || '';

  // Combine multiple headers for better uniqueness
  const fingerprint = `${ua}|${accept}|${acceptLang}|${acceptEnc}`;
  return `fallback:${simpleHash(fingerprint)}`;
}

/**
 * Create rate limit headers for response
 */
export function rateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
  };
}

/**
 * Helper to check if Upstash is configured
 */
export function isRateLimitingEnabled(): boolean {
  return isUpstashConfigured;
}
