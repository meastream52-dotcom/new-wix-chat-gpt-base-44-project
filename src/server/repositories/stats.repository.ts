import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, InsertDto, Tables, UpdateDto } from "@/lib/supabase/types";
import { unwrap, unwrapList, unwrapMaybe } from "./helpers";

export class StatsRepository {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async createMany(rows: InsertDto<"athlete_stats">[]): Promise<Tables<"athlete_stats">[]> {
    return unwrapList(await this.db.from("athlete_stats").insert(rows).select("*"));
  }

  async getById(id: string): Promise<Tables<"athlete_stats"> | null> {
    return unwrapMaybe(
      await this.db.from("athlete_stats").select("*").eq("id", id).maybeSingle()
    );
  }

  async update(id: string, patch: UpdateDto<"athlete_stats">): Promise<Tables<"athlete_stats">> {
    return unwrap(
      await this.db.from("athlete_stats").update(patch).eq("id", id).select("*").single()
    );
  }

  async listByAthlete(
    athleteProfileId: string,
    filters: { sportId?: string; metricKey?: string } = {}
  ): Promise<Tables<"athlete_stats">[]> {
    let query = this.db
      .from("athlete_stats")
      .select("*")
      .eq("athlete_profile_id", athleteProfileId);

    if (filters.sportId) query = query.eq("sport_id", filters.sportId);
    if (filters.metricKey) query = query.eq("metric_key", filters.metricKey);

    return unwrapList(await query.order("recorded_at", { ascending: false, nullsFirst: false }));
  }
}
