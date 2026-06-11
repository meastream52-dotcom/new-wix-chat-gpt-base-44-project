import { getRedis } from "@/lib/redis";

/**
 * Fixed-window rate limiter on Redis. This is the *assist* layer for abuse
 * protection (spam, heartbeat flooding) — business rules like the 2 posts/day
 * limit are always enforced against the database, never solely here.
 *
 * Fails open: if Redis is unavailable the request is allowed and the
 * DB-level checks remain the backstop.
 */
export async function rateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;
  try {
    const bucket = `rl:${key}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
    const count = await redis.incr(bucket);
    if (count === 1) await redis.expire(bucket, windowSeconds);
    return count <= max;
  } catch {
    return true;
  }
}
