import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

/** Lazy Redis client. Returns null when REDIS_URL is unset — callers must degrade gracefully. */
export function getRedis(): Redis | null {
  if (globalForRedis.redis !== undefined) return globalForRedis.redis;
  const url = process.env.REDIS_URL;
  globalForRedis.redis = url
    ? new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true })
    : null;
  return globalForRedis.redis;
}
