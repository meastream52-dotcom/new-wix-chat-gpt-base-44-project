import type { AuthContext } from "@/lib/auth";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import type { InsertDto, Tables } from "@/lib/supabase/types";
import { AthleteRepository } from "@/server/repositories/athlete.repository";
import type {
  CreateAthleteProfileInput,
  UpdateAthleteProfileInput,
} from "@/validators/athlete";
import { audit } from "./audit";

export interface AthleteProfileWithSports extends Tables<"athlete_profiles"> {
  sports: Tables<"athlete_sports">[];
}

export const athleteService = {
  async createProfile(
    ctx: AuthContext,
    input: CreateAthleteProfileInput
  ): Promise<AthleteProfileWithSports> {
    const repo = new AthleteRepository(ctx.supabase);

    if (await repo.getByUserId(ctx.userId)) {
      throw new ConflictError("Athlete profile already exists for this account");
    }

    const { sports, ...fields } = input;
    const profile = await repo.create({ user_id: ctx.userId, ...fields } as InsertDto<"athlete_profiles">);

    const createdSports: Tables<"athlete_sports">[] = [];
    if (sports?.length) {
      let primaryAssigned = false;
      for (const s of sports) {
        const isPrimary = Boolean(s.is_primary) && !primaryAssigned;
        if (isPrimary) primaryAssigned = true;
        createdSports.push(
          await repo.upsertSport({
            athlete_profile_id: profile.id,
            sport_id: s.sport_id,
            position: s.position,
            secondary_position: s.secondary_position,
            is_primary: isPrimary,
            jersey_number: s.jersey_number,
            years_experience: s.years_experience,
            club_team: s.club_team,
          })
        );
      }
      // Guarantee exactly one primary sport.
      if (!primaryAssigned && createdSports[0]) {
        createdSports[0] = await repo.upsertSport({
          athlete_profile_id: profile.id,
          sport_id: createdSports[0].sport_id,
          is_primary: true,
        });
      }
    }

    await audit(ctx, "athlete_profile.create", "athlete_profiles", profile.id);
    return { ...profile, sports: createdSports };
  },

  async getOwnProfile(ctx: AuthContext): Promise<AthleteProfileWithSports> {
    const repo = new AthleteRepository(ctx.supabase);
    const profile = await repo.getByUserId(ctx.userId);
    if (!profile) throw new NotFoundError("Athlete profile not found");
    const sports = await repo.listSports(profile.id);
    return { ...profile, sports };
  },

  async getProfile(ctx: AuthContext, id: string): Promise<AthleteProfileWithSports> {
    const repo = new AthleteRepository(ctx.supabase);
    const profile = await repo.getById(id); // RLS enforces visibility
    if (!profile) throw new NotFoundError("Athlete profile not found");
    const sports = await repo.listSports(id);
    return { ...profile, sports };
  },

  async updateProfile(
    ctx: AuthContext,
    id: string,
    patch: UpdateAthleteProfileInput
  ): Promise<AthleteProfileWithSports> {
    const repo = new AthleteRepository(ctx.supabase);
    const existing = await repo.getById(id);
    if (!existing) throw new NotFoundError("Athlete profile not found");

    let updated: Tables<"athlete_profiles">;
    try {
      updated = await repo.update(id, patch);
    } catch (err) {
      if (err instanceof NotFoundError) throw new ForbiddenError("You cannot update this profile");
      throw err;
    }

    await audit(ctx, "athlete_profile.update", "athlete_profiles", id, patch);
    const sports = await repo.listSports(id);
    return { ...updated, sports };
  },
};
