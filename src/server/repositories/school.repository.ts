import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AthleticAssociation,
  Database,
  InsertDto,
  Tables,
  UpdateDto,
} from "@/lib/supabase/types";
import { unwrap, unwrapList, unwrapMaybe } from "./helpers";

export interface ListSchoolsParams {
  q?: string;
  association?: AthleticAssociation;
  state?: string;
  limit: number;
  offset: number;
}

export class SchoolRepository {
  constructor(private readonly db: SupabaseClient<Database>) {}

  async list(params: ListSchoolsParams): Promise<{ rows: Tables<"schools">[]; total: number }> {
    let query = this.db.from("schools").select("*", { count: "exact" });

    if (params.q) query = query.ilike("name", `%${params.q}%`);
    if (params.association) query = query.eq("association", params.association);
    if (params.state) query = query.eq("state", params.state);

    const { data, error, count } = await query
      .order("name", { ascending: true })
      .range(params.offset, params.offset + params.limit - 1);

    if (error) throw error;
    return { rows: data ?? [], total: count ?? 0 };
  }

  async listForMatching(params: {
    associations?: AthleticAssociation[];
    states?: string[];
    limit: number;
  }): Promise<Tables<"schools">[]> {
    let query = this.db.from("schools").select("*").eq("is_active", true);
    if (params.associations?.length) query = query.in("association", params.associations);
    if (params.states?.length) query = query.in("state", params.states);
    return unwrapList(await query.limit(params.limit));
  }

  async getById(id: string): Promise<Tables<"schools"> | null> {
    return unwrapMaybe(await this.db.from("schools").select("*").eq("id", id).maybeSingle());
  }

  async create(input: InsertDto<"schools">): Promise<Tables<"schools">> {
    return unwrap(await this.db.from("schools").insert(input).select("*").single());
  }

  async createMany(rows: InsertDto<"schools">[]): Promise<Tables<"schools">[]> {
    return unwrapList(
      await this.db.from("schools").upsert(rows, { onConflict: "slug" }).select("*")
    );
  }

  async update(id: string, patch: UpdateDto<"schools">): Promise<Tables<"schools">> {
    return unwrap(await this.db.from("schools").update(patch).eq("id", id).select("*").single());
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.db.from("schools").delete().eq("id", id);
    if (error) throw error;
  }
}
