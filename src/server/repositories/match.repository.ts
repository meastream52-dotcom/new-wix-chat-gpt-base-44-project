import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, InsertDto, MatchTier, Tables } from "@/lib/supabase/types";
import { unwrapList, unwrapMaybe } from "./helpers";

export interface ListMatchesParams {
  sportId?: string;
  minScore?: number;
  tier?: MatchTier;
  limit: number;
  offset: number;
}

export class MatchRepository {
  constructor(private readonly db: SupabaseClient<Database>) {}

  /** Upsert computed scores (one current row per athlete/school/sport). */
  async upsertScores(
    rows: InsertDto<"opportunity_scores">[]
  ): Promise<Tables<"opportunity_scores">[]> {
    if (rows.length === 0) return [];
    return unwrapList(
      await this.db
        .from("opportunity_scores")
        .upsert(rows, { onConflict: "athlete_profile_id,school_id,sport_id" })
        .select("*")
    );
  }

  async listByAthlete(
    athleteProfileId: string,
    params: ListMatchesParams
  ): Promise<Tables<"opportunity_scores">[]> {
    let query = this.db
      .from("opportunity_scores")
      .select("*")
      .eq("athlete_profile_id", athleteProfileId);

    if (params.sportId) query = query.eq("sport_id", params.sportId);
    if (params.tier) query = query.eq("match_tier", params.tier);
    if (params.minScore !== undefined) query = query.gte("overall_score", params.minScore);

    return unwrapList(
      await query
        .order("overall_score", { ascending: false })
        .range(params.offset, params.offset + params.limit - 1)
    );
  }

  async getById(id: string): Promise<Tables<"opportunity_scores"> | null> {
    return unwrapMaybe(
      await this.db.from("opportunity_scores").select("*").eq("id", id).maybeSingle()
    );
  }
}
