/**
 * Rate limiting with a pluggable backend:
 *   - Upstash Redis sliding window when UPSTASH_REDIS_REST_* is configured
 *     (correct across Vercel's serverless instances).
 *   - In-memory fixed window fallback for local development.
 *
 * Throttle tiers tune limits per route class (auth is strictest, heavy
 * compute/import is tightest).
 */
import "server-only";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "./env";
import { RateLimitError } from "./errors";

export type RateLimitTier = "auth" | "read" | "write" | "heavy";

const TIERS: Record<RateLimitTier, { tokens: number; window: Duration; windowMs: number }> = {
  auth: { tokens: 10, window: "60 s", windowMs: 60_000 },
  read: { tokens: 120, window: "60 s", windowMs: 60_000 },
  write: { tokens: 40, window: "60 s", windowMs: 60_000 },
  heavy: { tokens: 6, window: "60 s", windowMs: 60_000 },
};

// ---- Upstash backend (lazily constructed, one limiter per tier) ----
let redis: Redis | null = null;
const upstashLimiters = new Map<RateLimitTier, Ratelimit>();

function getUpstashLimiter(tier: RateLimitTier): Ratelimit | null {
  const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = serverEnv();
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) return null;

  if (!redis) {
    redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });
  }
  let limiter = upstashLimiters.get(tier);
  if (!limiter) {
    const cfg = TIERS[tier];
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
      prefix: `aoe:rl:${tier}`,
      analytics: false,
    });
    upstashLimiters.set(tier, limiter);
  }
  return limiter;
}

// ---- In-memory fallback (per-instance fixed window) ----
const memoryStore = new Map<string, { count: number; reset: number }>();

function memoryLimit(key: string, tier: RateLimitTier): { success: boolean; reset: number } {
  const cfg = TIERS[tier];
  const now = Date.now();

  if (memoryStore.size > 10_000) {
    for (const [k, v] of memoryStore) if (v.reset < now) memoryStore.delete(k);
  }

  const entry = memoryStore.get(key);
  if (!entry || entry.reset < now) {
    memoryStore.set(key, { count: 1, reset: now + cfg.windowMs });
    return { success: true, reset: now + cfg.windowMs };
  }
  entry.count += 1;
  return { success: entry.count <= cfg.tokens, reset: entry.reset };
}

/**
 * Enforce a rate limit for `identifier` (IP or user id) on a tier.
 * Throws RateLimitError(429) with a Retry-After when the limit is exceeded.
 */
export async function enforceRateLimit(tier: RateLimitTier, identifier: string): Promise<void> {
  const key = `${tier}:${identifier}`;
  const limiter = getUpstashLimiter(tier);

  if (limiter) {
    const { success, reset } = await limiter.limit(identifier);
    if (!success) {
      throw new RateLimitError(Math.max(1, Math.ceil((reset - Date.now()) / 1000)));
    }
    return;
  }

  const { success, reset } = memoryLimit(key, tier);
  if (!success) {
    throw new RateLimitError(Math.max(1, Math.ceil((reset - Date.now()) / 1000)));
  }
}
