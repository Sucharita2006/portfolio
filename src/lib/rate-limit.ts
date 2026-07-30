/**
 * Token bucket, three tokens per hour, refilling continuously.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS IS NOT
 *
 * This is a per-instance, in-memory limit, and on a serverless platform that
 * makes it much weaker than it looks:
 *
 *   • It resets on cold start. An idle deployment forgets every bucket.
 *   • It is not shared. Vercel may run several instances concurrently, each
 *     with its own Map, so the real ceiling is three per hour per instance —
 *     not three per hour.
 *
 * It is kept anyway because it is honest about what it buys: it stops the
 * ordinary case, which is one person or one naive script hammering the form,
 * at a cost of zero dependencies and zero network calls. For a portfolio's
 * traffic that is the right trade.
 *
 * The upgrade path, when it is worth taking: replace the Map with Upstash Redis
 * (`@upstash/ratelimit`), keyed on the same hashed IP with the same capacity and
 * window. Only `take()` changes; every caller stays as it is. That is the reason
 * the bucket arithmetic lives behind a function rather than inline in the route.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CAPACITY = 3;
const WINDOW_MS = 60 * 60 * 1000;

// Above this many tracked keys, full buckets are swept before inserting. A Map
// keyed on hashed addresses otherwise grows for the lifetime of the instance,
// which is a slow memory leak dressed as a rate limiter.
const SWEEP_THRESHOLD = 10_000;

type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

function tokensAt(bucket: Bucket, now: number): number {
  const elapsed = Math.max(0, now - bucket.updatedAt);
  return Math.min(CAPACITY, bucket.tokens + (elapsed * CAPACITY) / WINDOW_MS);
}

function sweep(now: number): void {
  if (buckets.size < SWEEP_THRESHOLD) return;
  for (const [key, bucket] of buckets) {
    // A refilled bucket is indistinguishable from a key never seen before, so
    // dropping it loses no information.
    if (tokensAt(bucket, now) >= CAPACITY) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the next token, 0 when allowed. */
  retryAfter: number;
};

/**
 * `now` is a parameter rather than a call to Date.now() inside so the window can
 * be tested without sleeping through an hour.
 */
export function take(key: string, now: number = Date.now()): RateLimitResult {
  const existing = buckets.get(key);
  const available = existing ? tokensAt(existing, now) : CAPACITY;

  if (available < 1) {
    // Keep updatedAt moving so the refill accrues from the correct instant.
    buckets.set(key, { tokens: available, updatedAt: now });
    const msToNextToken = ((1 - available) * WINDOW_MS) / CAPACITY;
    return { allowed: false, retryAfter: Math.ceil(msToNextToken / 1000) };
  }

  sweep(now);
  buckets.set(key, { tokens: available - 1, updatedAt: now });
  return { allowed: true, retryAfter: 0 };
}

/** Test-only. Buckets are module state, so a suite would otherwise leak between cases. */
export function reset(): void {
  buckets.clear();
}
