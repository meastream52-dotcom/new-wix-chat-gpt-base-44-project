import { z } from "zod";
import type { Json } from "@/lib/supabase/types";

export const uuidSchema = z.string().uuid("Must be a valid UUID");

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// ---- Enum mirrors of the database types (validators/common keeps them DRY) ----
export const genderEnum = z.enum(["male", "female", "nonbinary", "prefer_not_to_say"]);
export const athleticAssociationEnum = z.enum(["NCAA", "NAIA", "NJCAA"]);
export const competitionDivisionEnum = z.enum([
  "NCAA_DI",
  "NCAA_DII",
  "NCAA_DIII",
  "NAIA",
  "NJCAA_DI",
  "NJCAA_DII",
  "NJCAA_DIII",
]);
export const schoolTypeEnum = z.enum(["public", "private", "community", "tribal", "military"]);
export const recruitingStatusEnum = z.enum([
  "exploring",
  "actively_recruiting",
  "committed",
  "signed",
  "enrolled",
  "inactive",
]);
export const profileVisibilityEnum = z.enum([
  "public",
  "recruiters_only",
  "connections_only",
  "private",
]);
export const statSourceEnum = z.enum([
  "self_reported",
  "parent_reported",
  "coach_verified",
  "event_timed",
  "third_party",
  "imported",
]);
export const videoTypeEnum = z.enum([
  "highlight",
  "full_game",
  "skills_session",
  "training",
  "interview",
  "combine",
]);
export const matchTierEnum = z.enum(["high_reach", "reach", "target", "likely", "safety"]);

// Recursive JSON validator whose output is assignable to the DB `Json` type.
export const jsonValueSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

export const jsonObjectSchema = z.record(z.string(), jsonValueSchema);
