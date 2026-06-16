import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, InsertDto, Tables, VideoStatus } from "@/lib/supabase/types";
import { unwrap, unwrapList } from "./helpers";

export class VideoRepository {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async create(input: InsertDto<"videos">): Promise<Tables<"videos">> {
    return unwrap(await this.db.from("videos").insert(input).select("*").single());
  }

  async listByAthlete(
    athleteProfileId: string,
    opts: { status?: VideoStatus; limit: number; offset: number }
  ): Promise<Tables<"videos">[]> {
    let query = this.db.from("videos").select("*").eq("athlete_profile_id", athleteProfileId);
    if (opts.status) query = query.eq("status", opts.status);

    return unwrapList(
      await query
        .order("created_at", { ascending: false })
        .range(opts.offset, opts.offset + opts.limit - 1)
    );
  }
}
