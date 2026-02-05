/**
 * Simple in-memory rate limiter.
 * For production, use Redis or a similar distributed store.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 100,     // 100 requests per minute
};

/**
 * Check if a request should be rate limited.
 *
 * @param identifier - Unique identifier for rate limiting (e.g., shop ID, IP)
 * @param config - Rate limit configuration
 * @returns Object with limited status and retry-after header value
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { limited: boolean; remaining: number; resetAt: number; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entry
  if (entry && entry.resetAt <= now) {
    rateLimitStore.delete(identifier);
  }

  const currentEntry = rateLimitStore.get(identifier);

  if (!currentEntry) {
    // First request in this window
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (currentEntry.count >= config.maxRequests) {
    // Rate limited
    const retryAfter = Math.ceil((currentEntry.resetAt - now) / 1000);

    return {
      limited: true,
      remaining: 0,
      resetAt: currentEntry.resetAt,
      retryAfter,
    };
  }

  // Increment count
  currentEntry.count++;
  rateLimitStore.set(identifier, currentEntry);

  return {
    limited: false,
    remaining: config.maxRequests - currentEntry.count,
    resetAt: currentEntry.resetAt,
  };
}

/**
 * Create rate limit response headers.
 */
export function rateLimitHeaders(
  remaining: number,
  resetAt: number,
  limit: number = DEFAULT_CONFIG.maxRequests
): HeadersInit {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.floor(resetAt / 1000)),
  };
}

/**
 * Middleware-style rate limiter for API routes.
 */
export async function withRateLimit(
  identifier: string,
  handler: () => Promise<Response>,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<Response> {
  const { limited, remaining, resetAt, retryAfter } = checkRateLimit(identifier, config);

  if (limited) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          ...rateLimitHeaders(remaining, resetAt, config.maxRequests),
        },
      }
    );
  }

  const response = await handler();

  // Add rate limit headers to successful responses
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', String(config.maxRequests));
  headers.set('X-RateLimit-Remaining', String(remaining));
  headers.set('X-RateLimit-Reset', String(Math.floor(resetAt / 1000)));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
