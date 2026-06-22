// In-memory rate limiter using sliding window.
// On Vercel Pro+: swap for Vercel KV (Upstash) for cross-instance limits.
// Works per-instance on Hobby: stops burst attacks but not distributed ones.

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

function cleanupStale() {
  const now = Date.now();
  for (const [key, val] of store) {
    if (val.resetAt < now) store.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  cleanupStale();
  const now = Date.now();

  const entry = store.get(key) ?? { count: 0, resetAt: now + windowMs };

  if (entry.resetAt < now) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  entry.count += 1;
  store.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    retryAfterMs: 0,
  };
}

// Convenience wrappers
export function rateLimitAuth(key: string) {
  return checkRateLimit(`auth:${key}`, 10, 60_000); // 10 per minute per identifier
}
export function rateLimitPublic(key: string) {
  return checkRateLimit(`pub:${key}`, 60, 60_000); // 60 per minute per IP
}
export function rateLimitOrder(key: string) {
  return checkRateLimit(`order:${key}`, 5, 60_000); // 5 orders per minute per IP
}