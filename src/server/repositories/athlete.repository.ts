import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, InsertDto, Tables, UpdateDto } from "@/lib/supabase/types";
import { unwrap, unwrapList, unwrapMaybe } from "./helpers";

export class AthleteRepository {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async getByUserId(userId: string): Promise<Tables<"athlete_profiles"> | null> {
    return unwrapMaybe(
      await this.db.from("athlete_profiles").select("*").eq("user_id", userId).maybeSingle()
    );
  }

  async getById(id: string): Promise<Tables<"athlete_profiles"> | null> {
    return unwrapMaybe(
      await this.db.from("athlete_profiles").select("*").eq("id", id).maybeSingle()
    );
  }

  async create(input: InsertDto<"athlete_profiles">): Promise<Tables<"athlete_profiles">> {
    return unwrap(await this.db.from("athlete_profiles").insert(input).select("*").single());
  }

  async update(
    id: string,
    patch: UpdateDto<"athlete_profiles">
  ): Promise<Tables<"athlete_profiles">> {
    return unwrap(
      await this.db.from("athlete_profiles").update(patch).eq("id", id).select("*").single()
    );
  }

  async listSports(athleteProfileId: string): Promise<Tables<"athlete_sports">[]> {
    return unwrapList(
      await this.db
        .from("athlete_sports")
        .select("*")
        .eq("athlete_profile_id", athleteProfileId)
        .order("is_primary", { ascending: false })
    );
  }

  async getPrimarySport(athleteProfileId: string): Promise<Tables<"athlete_sports"> | null> {
    return unwrapMaybe(
      await this.db
        .from("athlete_sports")
        .select("*")
        .eq("athlete_profile_id", athleteProfileId)
        .eq("is_primary", true)
        .maybeSingle()
    );
  }

  /** Clear the primary flag across an athlete's sports (before promoting one). */
  async clearPrimaryFlags(athleteProfileId: string): Promise<void> {
    const { error } = await this.db
      .from("athlete_sports")
      .update({ is_primary: false })
      .eq("athlete_profile_id", athleteProfileId)
      .eq("is_primary", true);
    if (error) throw error;
  }

  async upsertSport(input: InsertDto<"athlete_sports">): Promise<Tables<"athlete_sports">> {
    return unwrap(
      await this.db
        .from("athlete_sports")
        .upsert(input, { onConflict: "athlete_profile_id,sport_id" })
        .select("*")
        .single()
    );
  }
}
