import { z } from "zod";
import {
  genderEnum,
  jsonObjectSchema,
  profileVisibilityEnum,
  recruitingStatusEnum,
  uuidSchema,
} from "./common";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const athleteSportInputSchema = z.object({
  sport_id: uuidSchema,
  position: z.string().trim().max(60).optional(),
  secondary_position: z.string().trim().max(60).optional(),
  is_primary: z.boolean().optional(),
  jersey_number: z.number().int().min(0).max(999).optional(),
  years_experience: z.number().int().min(0).max(60).optional(),
  club_team: z.string().trim().max(120).optional(),
});

const profileCore = {
  first_name: z.string().trim().min(1).max(80).optional(),
  last_name: z.string().trim().min(1).max(80).optional(),
  date_of_birth: isoDate.optional(),
  gender: genderEnum.optional(),
  height_cm: z.number().min(50).max(280).optional(),
  weight_kg: z.number().min(20).max(300).optional(),
  dominant_hand: z.enum(["left", "right", "both"]).optional(),
  graduation_year: z.number().int().min(1950).max(2100).optional(),
  gpa: z.number().min(0).max(5).optional(),
  sat_score: z.number().int().min(400).max(1600).optional(),
  act_score: z.number().int().min(1).max(36).optional(),
  intended_major: z.string().trim().max(120).optional(),
  ncaa_eligibility_id: z.string().trim().max(40).optional(),
  hometown_city: z.string().trim().max(120).optional(),
  home_state: z.string().trim().max(60).optional(),
  home_country: z.string().trim().max(60).optional(),
  current_school: z.string().trim().max(160).optional(),
  recruiting_status: recruitingStatusEnum.optional(),
  committed_school_id: uuidSchema.nullable().optional(),
  visibility: profileVisibilityEnum.optional(),
  bio: z.string().trim().max(2000).optional(),
  goals: jsonObjectSchema.optional(),
  preferences: jsonObjectSchema.optional(),
};

export const createAthleteProfileSchema = z.object({
  ...profileCore,
  sports: z.array(athleteSportInputSchema).max(10).optional(),
});

export const updateAthleteProfileSchema = z
  .object(profileCore)
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field is required" });

export type CreateAthleteProfileInput = z.infer<typeof createAthleteProfileSchema>;
export type UpdateAthleteProfileInput = z.infer<typeof updateAthleteProfileSchema>;
export type AthleteSportInput = z.infer<typeof athleteSportInputSchema>;
