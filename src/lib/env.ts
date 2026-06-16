/**
 * Environment configuration (validated at module load).
 *
 * Public values (NEXT_PUBLIC_*) are safe in the browser bundle. The service
 * role key and Upstash credentials are server-only and must never be imported
 * into client components.
 */
import { z } from "zod";

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_VIDEO_BUCKET: z.string().min(1).default("athlete-videos"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function read<T extends z.ZodTypeAny>(schema: T, values: Record<string, unknown>): z.infer<T> {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
}

// NEXT_PUBLIC_* must be referenced as static property accesses so Next.js can
// inline them into the client bundle at build time.
export const publicEnv = read(publicSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

/** Lazily validate and cache server-only env (never call from client code). */
export function serverEnv(): z.infer<typeof serverSchema> {
  if (!cachedServerEnv) {
    cachedServerEnv = read(serverSchema, {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_VIDEO_BUCKET: process.env.SUPABASE_VIDEO_BUCKET,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NODE_ENV: process.env.NODE_ENV,
    });
  }
  return cachedServerEnv;
}

export function requireServiceRoleKey(): string {
  const key = serverEnv().SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for this operation but is not configured."
    );
  }
  return key;
}
