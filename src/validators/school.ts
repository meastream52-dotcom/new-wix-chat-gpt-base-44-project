import { z } from "zod";
import {
  athleticAssociationEnum,
  competitionDivisionEnum,
  jsonObjectSchema,
  paginationSchema,
  schoolTypeEnum,
  uuidSchema,
} from "./common";

const schoolCore = {
  short_name: z.string().trim().max(120).optional(),
  school_type: schoolTypeEnum.optional(),
  city: z.string().trim().max(120).optional(),
  state: z.string().trim().max(60).optional(),
  region: z.string().trim().max(60).optional(),
  country: z.string().trim().max(60).optional(),
  postal_code: z.string().trim().max(20).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  website_url: z.string().url().max(300).optional(),
  logo_url: z.string().url().max(300).optional(),
  mascot: z.string().trim().max(80).optional(),
  conference: z.string().trim().max(120).optional(),
  enrollment_total: z.number().int().min(0).max(1_000_000).optional(),
  acceptance_rate: z.number().min(0).max(1).optional(),
  avg_gpa: z.number().min(0).max(5).optional(),
  sat_total_25: z.number().int().min(400).max(1600).optional(),
  sat_total_75: z.number().int().min(400).max(1600).optional(),
  act_composite_25: z.number().int().min(1).max(36).optional(),
  act_composite_75: z.number().int().min(1).max(36).optional(),
  graduation_rate: z.number().min(0).max(1).optional(),
  offered_majors: z.array(z.string().trim().min(1).max(120)).max(500).optional(),
  tuition_in_state: z.number().min(0).optional(),
  tuition_out_state: z.number().min(0).optional(),
  room_and_board: z.number().min(0).optional(),
  cost_of_attendance: z.number().min(0).optional(),
  description: z.string().trim().max(4000).optional(),
  metadata: jsonObjectSchema.optional(),
};

export const createSchoolSchema = z.object({
  name: z.string().trim().min(1).max(200),
  association: athleticAssociationEnum,
  ...schoolCore,
});

export const updateSchoolSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    association: athleticAssociationEnum.optional(),
    is_active: z.boolean().optional(),
    ...schoolCore,
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

export const listSchoolsQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  association: athleticAssociationEnum.optional(),
  state: z.string().trim().max(60).optional(),
});

// ---- school_sports ----
const schoolSportCore = {
  division: competitionDivisionEnum,
  conference: z.string().trim().max(120).optional(),
  recruiting_email: z.string().email().max(160).optional(),
  recruiting_phone: z.string().trim().max(40).optional(),
  recruiting_url: z.string().url().max(300).optional(),
  is_recruiting_active: z.boolean().optional(),
  roster_size: z.number().int().min(0).max(500).optional(),
  is_scholarship_sport: z.boolean().optional(),
  scholarships_total: z.number().min(0).optional(),
  scholarships_available: z.number().min(0).optional(),
  avg_scholarship_amount: z.number().min(0).optional(),
  avg_recruit_gpa: z.number().min(0).max(5).optional(),
  position_needs: jsonObjectSchema.optional(),
  recruiting_priorities: jsonObjectSchema.optional(),
};

export const createSchoolSportSchema = z.object({
  school_id: uuidSchema,
  sport_id: uuidSchema,
  ...schoolSportCore,
});

export const updateSchoolSportSchema = z
  .object({
    ...schoolSportCore,
    division: competitionDivisionEnum.optional(),
    is_active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type CreateSchoolSportInput = z.infer<typeof createSchoolSportSchema>;
export type UpdateSchoolSportInput = z.infer<typeof updateSchoolSportSchema>;
