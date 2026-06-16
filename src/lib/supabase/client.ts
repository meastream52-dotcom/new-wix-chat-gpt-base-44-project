/**
 * Browser Supabase client (anon key + persisted session). Use in Client
 * Components for auth flows and RLS-scoped reads.
 */
"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import { publicEnv } from "../env";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
