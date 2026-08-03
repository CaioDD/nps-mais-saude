import 'server-only';

type Bucket = {
  count: number;
  resetAt: number;
};

declare global {
  var __npsRateLimitBuckets: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__npsRateLimitBuckets ?? new Map<string, Bucket>();
globalThis.__npsRateLimitBuckets = buckets;

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}


