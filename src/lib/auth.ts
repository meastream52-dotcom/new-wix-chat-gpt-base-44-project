/**
 * Authentication + role-based access control helpers for server code.
 *
 * `getAuthContext` resolves the current user (RLS-scoped Supabase client +
 * app role). `requireAuth` / `requireRole` throw typed errors that the API
 * handler maps to 401/403.
 */
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase/server";
import type { Database, Tables, UserRole } from "./supabase/types";
import { ForbiddenError, UnauthorizedError } from "./errors";

export interface AuthContext {
  userId: string;
  email: string;
  role: UserRole;
  profile: Tables<"users"> | null;
  supabase: SupabaseClient<Database>;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const role: UserRole =
    profile?.role ?? ((user.app_metadata?.role as UserRole | undefined) ?? "athlete");

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? "",
    role,
    profile: profile ?? null,
    supabase,
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new UnauthorizedError();
  return ctx;
}

export async function requireRole(...roles: UserRole[]): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!roles.includes(ctx.role)) {
    throw new ForbiddenError(`This action requires one of: ${roles.join(", ")}`);
  }
  return ctx;
}

export const isAdmin = (ctx: AuthContext): boolean => ctx.role === "admin";

/** Best-effort client IP for rate-limit identity (Vercel/proxy aware). */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}
