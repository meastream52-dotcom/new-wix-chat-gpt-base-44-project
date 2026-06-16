import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CompetitionDivision,
  Database,
  InsertDto,
  Tables,
  UpdateDto,
} from "@/lib/supabase/types";
import { unwrap, unwrapList, unwrapMaybe } from "./helpers";

export class SchoolSportRepository {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async getById(id: string): Promise<Tables<"school_sports"> | null> {
    return unwrapMaybe(
      await this.db.from("school_sports").select("*").eq("id", id).maybeSingle()
    );
  }

  async listBySportAndSchools(
    sportId: string,
    schoolIds: string[],
    divisions?: CompetitionDivision[]
  ): Promise<Tables<"school_sports">[]> {
    if (schoolIds.length === 0) return [];
    let query = this.db
      .from("school_sports")
      .select("*")
      .eq("sport_id", sportId)
      .eq("is_active", true)
      .in("school_id", schoolIds);
    if (divisions?.length) query = query.in("division", divisions);
    return unwrapList(await query);
  }

  async create(input: InsertDto<"school_sports">): Promise<Tables<"school_sports">> {
    return unwrap(await this.db.from("school_sports").insert(input).select("*").single());
  }

  async update(
    id: string,
    patch: UpdateDto<"school_sports">
  ): Promise<Tables<"school_sports">> {
    return unwrap(
      await this.db.from("school_sports").update(patch).eq("id", id).select("*").single()
    );
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.db.from("school_sports").delete().eq("id", id);
    if (error) throw error;
  }
}
