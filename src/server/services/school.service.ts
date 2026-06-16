import type { AuthContext } from "@/lib/auth";
import { ValidationError } from "@/lib/errors";
import type { InsertDto, Tables } from "@/lib/supabase/types";
import { parseCsv } from "@/lib/csv";
import {
  SchoolRepository,
  type ListSchoolsParams,
} from "@/server/repositories/school.repository";
import { SchoolSportRepository } from "@/server/repositories/schoolSport.repository";
import {
  createSchoolSchema,
  type CreateSchoolInput,
  type CreateSchoolSportInput,
  type UpdateSchoolInput,
  type UpdateSchoolSportInput,
} from "@/validators/school";
import { audit } from "./audit";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  return Number(value); // NaN is rejected by zod validation downstream
}

export interface CsvImportResult {
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export const schoolService = {
  async list(
    ctx: AuthContext,
    params: ListSchoolsParams
  ): Promise<{ rows: Tables<"schools">[]; total: number }> {
    return new SchoolRepository(ctx.supabase).list(params);
  },

  async create(ctx: AuthContext, input: CreateSchoolInput): Promise<Tables<"schools">> {
    const school = await new SchoolRepository(ctx.supabase).create(
      input as InsertDto<"schools">
    );
    await audit(ctx, "school.create", "schools", school.id);
    return school;
  },

  async update(
    ctx: AuthContext,
    id: string,
    patch: UpdateSchoolInput
  ): Promise<Tables<"schools">> {
    const school = await new SchoolRepository(ctx.supabase).update(id, patch);
    await audit(ctx, "school.update", "schools", id, patch);
    return school;
  },

  async remove(ctx: AuthContext, id: string): Promise<void> {
    await new SchoolRepository(ctx.supabase).remove(id);
    await audit(ctx, "school.delete", "schools", id);
  },

  async importCsv(ctx: AuthContext, csvText: string): Promise<CsvImportResult> {
    const records = parseCsv(csvText);
    if (records.length === 0) throw new ValidationError("CSV contained no data rows");

    const inserts: InsertDto<"schools">[] = [];
    const errors: CsvImportResult["errors"] = [];

    records.forEach((record, index) => {
      const rowNumber = index + 2; // header is row 1
      const majorsRaw = record.offered_majors ?? record.majors ?? "";
      const candidate = {
        name: record.name ?? record.school_name,
        association: record.association,
        short_name: record.short_name || undefined,
        school_type: record.school_type || undefined,
        city: record.city || undefined,
        state: record.state || undefined,
        region: record.region || undefined,
        conference: record.conference || undefined,
        website_url: record.website_url || undefined,
        avg_gpa: toNumber(record.avg_gpa ?? record.average_gpa),
        acceptance_rate: toNumber(record.acceptance_rate),
        sat_total_25: toNumber(record.sat_total_25),
        sat_total_75: toNumber(record.sat_total_75),
        enrollment_total: toNumber(record.enrollment_total),
        tuition_in_state: toNumber(record.tuition_in_state),
        tuition_out_state: toNumber(record.tuition_out_state),
        room_and_board: toNumber(record.room_and_board),
        cost_of_attendance: toNumber(record.cost_of_attendance),
        offered_majors: majorsRaw
          ? majorsRaw.split(/[;|]/).map((m) => m.trim()).filter(Boolean)
          : undefined,
      };

      const parsed = createSchoolSchema.safeParse(candidate);
      if (!parsed.success) {
        errors.push({
          row: rowNumber,
          message: parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        });
        return;
      }

      const slugBase = parsed.data.state
        ? `${parsed.data.name}-${parsed.data.state}`
        : parsed.data.name;
      inserts.push({ ...parsed.data, slug: slugify(slugBase) } as InsertDto<"schools">);
    });

    let imported = 0;
    if (inserts.length > 0) {
      // De-dupe by slug within the batch, then upsert (idempotent re-imports).
      const bySlug = new Map(inserts.map((row) => [row.slug, row]));
      const rows = await new SchoolRepository(ctx.supabase).createMany([...bySlug.values()]);
      imported = rows.length;
    }

    await audit(ctx, "school.import_csv", "schools", null, {
      imported,
      failed: errors.length,
    });

    return { imported, failed: errors.length, errors };
  },

  async createSport(
    ctx: AuthContext,
    input: CreateSchoolSportInput
  ): Promise<Tables<"school_sports">> {
    const program = await new SchoolSportRepository(ctx.supabase).create(
      input as InsertDto<"school_sports">
    );
    await audit(ctx, "school_sport.create", "school_sports", program.id);
    return program;
  },

  async updateSport(
    ctx: AuthContext,
    id: string,
    patch: UpdateSchoolSportInput
  ): Promise<Tables<"school_sports">> {
    const program = await new SchoolSportRepository(ctx.supabase).update(id, patch);
    await audit(ctx, "school_sport.update", "school_sports", id, patch);
    return program;
  },

  async removeSport(ctx: AuthContext, id: string): Promise<void> {
    await new SchoolSportRepository(ctx.supabase).remove(id);
    await audit(ctx, "school_sport.delete", "school_sports", id);
  },
};
