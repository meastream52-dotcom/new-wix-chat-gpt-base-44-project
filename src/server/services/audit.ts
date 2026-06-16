import type { AuthContext } from "@/lib/auth";
import type { Json } from "@/lib/supabase/types";

/**
 * Best-effort audit write via the SECURITY DEFINER `log_audit` function.
 * Never throws — auditing must not break the primary operation.
 */
export async function audit(
  ctx: AuthContext,
  action: string,
  entityType: string,
  entityId: string | null,
  changes: Record<string, unknown> = {}
): Promise<void> {
  try {
    await ctx.supabase.rpc("log_audit", {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_changes: changes as Json,
    });
  } catch {
    // swallow — auditing is non-critical
  }
}
