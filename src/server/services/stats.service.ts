import type { AuthContext } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { InsertDto, Tables } from "@/lib/supabase/types";
import { StatsRepository } from "@/server/repositories/stats.repository";
import type { CreateStatInput, UpdateStatInput } from "@/validators/stats";
import { assertManageAthlete } from "./access";
import { audit } from "./audit";

export const statsService = {
  async addStats(
    ctx: AuthContext,
    athleteProfileId: string,
    stats: CreateStatInput[]
  ): Promise<Tables<"athlete_stats">[]> {
    await assertManageAthlete(ctx, athleteProfileId);

    const rows: InsertDto<"athlete_stats">[] = stats.map((s) => ({
      athlete_profile_id: athleteProfileId,
      sport_id: s.sport_id,
      metric_key: s.metric_key,
      metric_value: s.metric_value,
      metric_text: s.metric_text,
      unit: s.unit,
      percentile: s.percentile,
      season_year: s.season_year,
      competition_level: s.competition_level,
      recorded_at: s.recorded_at,
      verification_source: s.verification_source,
    }));

    const repo = new StatsRepository(ctx.supabase);
    const created = await repo.createMany(rows);
    await audit(ctx, "athlete_stats.create", "athlete_stats", athleteProfileId, {
      count: created.length,
    });
    return created;
  },

  async listStats(
    ctx: AuthContext,
    athleteProfileId: string,
    filters: { sportId?: string; metricKey?: string }
  ): Promise<Tables<"athlete_stats">[]> {
    const repo = new StatsRepository(ctx.supabase);
    return repo.listByAthlete(athleteProfileId, filters);
  },

  async updateStat(
    ctx: AuthContext,
    statId: string,
    patch: UpdateStatInput
  ): Promise<Tables<"athlete_stats">> {
    const repo = new StatsRepository(ctx.supabase);
    const existing = await repo.getById(statId);
    if (!existing) throw new NotFoundError("Stat not found");
    await assertManageAthlete(ctx, existing.athlete_profile_id);

    let updated: Tables<"athlete_stats">;
    try {
      updated = await repo.update(statId, patch);
    } catch (err) {
      if (err instanceof NotFoundError) throw new ForbiddenError("You cannot update this stat");
      throw err;
    }
    await audit(ctx, "athlete_stats.update", "athlete_stats", statId, patch);
    return updated;
  },
};
