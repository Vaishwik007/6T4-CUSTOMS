/**
 * In-memory rate limiter for public API routes. Adequate for a single-region
 * Vercel deployment; swap to Upstash Ratelimit when running multi-region.
 *
 * Usage:
 *   const ok = rateLimit(`stock:${ip}`, 60, 60_000);
 *   if (!ok) return new NextResponse("Too many requests", { status: 429 });
 */

type Bucket = { hits: number[]; expires: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000;

// Sweep on the millionth call OR every minute, whichever comes first.
let lastSweep = Date.now();
function maybeSweep() {
  const now = Date.now();
  if (buckets.size < MAX_KEYS && now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, b] of buckets) if (b.expires < now) buckets.delete(k);
  if (buckets.size > MAX_KEYS) {
    // Drop oldest 20% by expires
    const sorted = [...buckets.entries()].sort((a, b) => a[1].expires - b[1].expires);
    for (let i = 0; i < Math.floor(MAX_KEYS * 0.2); i++) {
      buckets.delete(sorted[i][0]);
    }
  }
}

/**
 * Returns true if the request is allowed; false if rate-limited.
 * `key` should encode the identity (IP + endpoint + optional user/session).
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  maybeSweep();
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { hits: [now], expires: now + windowMs });
    return true;
  }
  // Drop hits outside the window
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  bucket.expires = now + windowMs;
  if (bucket.hits.length >= limit) return false;
  bucket.hits.push(now);
  return true;
}

/**
 * Extract the best-guess client IP from a NextRequest. Falls back to a
 * generic key so a single-process burst is still rate-limited even
 * without trustworthy headers.
 */
export function getClientKey(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
