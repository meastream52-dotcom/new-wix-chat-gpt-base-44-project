import { z } from "zod";
import { statSourceEnum, uuidSchema } from "./common";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const createStatSchema = z
  .object({
    sport_id: uuidSchema,
    metric_key: z.string().trim().min(1).max(80),
    metric_value: z.number().finite().optional(),
    metric_text: z.string().trim().max(120).optional(),
    unit: z.string().trim().max(20).optional(),
    percentile: z.number().min(0).max(100).optional(),
    season_year: z.number().int().min(1950).max(2100).optional(),
    competition_level: z.string().trim().max(40).optional(),
    recorded_at: isoDate.optional(),
    verification_source: statSourceEnum.optional(),
  })
  .refine((v) => v.metric_value !== undefined || v.metric_text !== undefined, {
    message: "Provide metric_value or metric_text",
    path: ["metric_value"],
  });

/** Accepts a single stat, an array of stats, or `{ stats: [...] }`. */
export const addStatsSchema = z.preprocess(
  (raw) => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && "stats" in raw) {
      return (raw as { stats: unknown }).stats;
    }
    return [raw];
  },
  z.array(createStatSchema).min(1).max(100)
);

export const updateStatSchema = z
  .object({
    metric_value: z.number().finite().nullable().optional(),
    metric_text: z.string().trim().max(120).nullable().optional(),
    unit: z.string().trim().max(20).nullable().optional(),
    percentile: z.number().min(0).max(100).nullable().optional(),
    season_year: z.number().int().min(1950).max(2100).nullable().optional(),
    competition_level: z.string().trim().max(40).nullable().optional(),
    recorded_at: isoDate.nullable().optional(),
    verification_source: statSourceEnum.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

export const listStatsQuerySchema = z.object({
  sport_id: uuidSchema.optional(),
  metric_key: z.string().trim().max(80).optional(),
});

export type CreateStatInput = z.infer<typeof createStatSchema>;
export type UpdateStatInput = z.infer<typeof updateStatSchema>;
