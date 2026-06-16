import type { AuthContext } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

/**
 * Authorization helper mirroring the DB `can_manage_athlete` policy in app
 * code, so we can return precise 403/404s (and gate service-role storage
 * signing) instead of relying solely on RLS row-count side effects.
 */
export async function canManageAthlete(
  ctx: AuthContext,
  athleteProfileId: string
): Promise<{ exists: boolean; canManage: boolean }> {
  if (ctx.role === "admin") return { exists: true, canManage: true };

  const { data: profile } = await ctx.supabase
    .from("athlete_profiles")
    .select("id, user_id")
    .eq("id", athleteProfileId)
    .maybeSingle();

  if (!profile) return { exists: false, canManage: false };
  if (profile.user_id === ctx.userId) return { exists: true, canManage: true };

  // Guardian path: does the current user have a managing guardian link?
  const { data: parent } = await ctx.supabase
    .from("parent_profiles")
    .select("id")
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (parent) {
    const { data: link } = await ctx.supabase
      .from("athlete_guardians")
      .select("can_manage")
      .eq("athlete_profile_id", athleteProfileId)
      .eq("parent_profile_id", parent.id)
      .maybeSingle();
    if (link?.can_manage) return { exists: true, canManage: true };
  }

  return { exists: true, canManage: false };
}

export async function assertManageAthlete(
  ctx: AuthContext,
  athleteProfileId: string
): Promise<void> {
  const { exists, canManage } = await canManageAthlete(ctx, athleteProfileId);
  if (!exists) throw new NotFoundError("Athlete profile not found");
  if (!canManage) throw new ForbiddenError("You cannot manage this athlete's data");
}
