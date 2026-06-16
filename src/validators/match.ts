import { z } from "zod";
import {
  athleticAssociationEnum,
  competitionDivisionEnum,
  matchTierEnum,
  paginationSchema,
  uuidSchema,
} from "./common";

export const generateMatchesSchema = z.object({
  // Defaults to the athlete's primary sport when omitted.
  sport_id: uuidSchema.optional(),
  limit: z.number().int().min(1).max(200).default(50),
  associations: z.array(athleticAssociationEnum).max(3).optional(),
  divisions: z.array(competitionDivisionEnum).max(7).optional(),
  states: z.array(z.string().trim().max(60)).max(60).optional(),
  persist: z.boolean().default(true),
});

export const listMatchesQuerySchema = paginationSchema.extend({
  sport_id: uuidSchema.optional(),
  min_score: z.coerce.number().min(0).max(100).optional(),
  tier: matchTierEnum.optional(),
});

export type GenerateMatchesInput = z.infer<typeof generateMatchesSchema>;
