/**
 * Service-role Supabase client. Bypasses Row Level Security — use ONLY in
 * trusted server contexts (the opportunity engine, admin operations, storage
 * signing). Never import this into client code.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { publicEnv, requireServiceRoleKey } from "../env";

let cached: SupabaseClient<Database> | null = null;

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  if (!cached) {
    cached = createClient<Database>(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      requireServiceRoleKey(),
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return cached;
}
