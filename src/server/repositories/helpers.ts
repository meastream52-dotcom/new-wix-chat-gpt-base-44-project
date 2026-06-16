import type { PostgrestError } from "@supabase/supabase-js";
import { fromPostgrest, NotFoundError } from "@/lib/errors";

interface Result<T> {
  data: T | null;
  error: PostgrestError | null;
}

/** Unwrap a single-row result; throws NotFound when absent. */
export function unwrap<T>(res: Result<T>): T {
  if (res.error) throw fromPostgrest(res.error);
  if (res.data === null) throw new NotFoundError();
  return res.data;
}

/** Unwrap a possibly-null single-row result. */
export function unwrapMaybe<T>(res: Result<T>): T | null {
  if (res.error) throw fromPostgrest(res.error);
  return res.data;
}

/** Unwrap a list result, normalizing null to []. */
export function unwrapList<T>(res: { data: T[] | null; error: PostgrestError | null }): T[] {
  if (res.error) throw fromPostgrest(res.error);
  return res.data ?? [];
}
