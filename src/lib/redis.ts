import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export async function enqueue(queue: string, payload: unknown): Promise<void> {
  await redis.rpush(queue, JSON.stringify(payload));
}

export async function dequeue(queue: string): Promise<unknown | null> {
  const raw = await redis.lpop(queue);
  return raw ? JSON.parse(raw) : null;
}
