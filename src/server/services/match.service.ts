import type { AuthContext } from "@/lib/auth";
import { NotFoundError, UnprocessableError } from "@/lib/errors";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { InsertDto, Json, Tables } from "@/lib/supabase/types";
import { AthleteRepository } from "@/server/repositories/athlete.repository";
import { MatchRepository, type ListMatchesParams } from "@/server/repositories/match.repository";
import { SchoolRepository } from "@/server/repositories/school.repository";
import { SchoolSportRepository } from "@/server/repositories/schoolSport.repository";
import { StatsRepository } from "@/server/repositories/stats.repository";
import type { GenerateMatchesInput } from "@/validators/match";
import { audit } from "./audit";
import {
  SCORING_MODEL_VERSION,
  scoreOpportunity,
  type ScoreBreakdown,
  type ScoringAthlete,
} from "./scoring";

type SchoolSummary = Pick<
  Tables<"schools">,
  "id" | "name" | "association" | "city" | "state" | "conference" | "logo_url"
>;
type ProgramSummary = Pick<
  Tables<"school_sports">,
  "id" | "division" | "conference" | "roster_size" | "scholarships_available"
>;

export interface RankedMatch {
  school: SchoolSummary;
  program: ProgramSummary;
  score: ScoreBreakdown;
}

function schoolSummary(s: Tables<"schools">): SchoolSummary {
  return {
    id: s.id,
    name: s.name,
    association: s.association,
    city: s.city,
    state: s.state,
    conference: s.conference,
    logo_url: s.logo_url,
  };
}

function programSummary(p: Tables<"school_sports">): ProgramSummary {
  return {
    id: p.id,
    division: p.division,
    conference: p.conference,
    roster_size: p.roster_size,
    scholarships_available: p.scholarships_available,
  };
}

export const matchService = {
  async generateMatches(
    ctx: AuthContext,
    input: GenerateMatchesInput
  ): Promise<{ sport_id: string; evaluated: number; matches: RankedMatch[] }> {
    const athleteRepo = new AthleteRepository(ctx.supabase);
    const profile = await athleteRepo.getByUserId(ctx.userId);
    if (!profile) {
      throw new UnprocessableError("Create an athlete profile before generating matches");
    }

    const sports = await athleteRepo.listSports(profile.id);
    let athleteSport: Tables<"athlete_sports"> | null;
    if (input.sport_id) {
      athleteSport = sports.find((s) => s.sport_id === input.sport_id) ?? null;
      if (!athleteSport) throw new UnprocessableError("That sport is not on your profile");
    } else {
      athleteSport = sports.find((s) => s.is_primary) ?? sports[0] ?? null;
      if (!athleteSport) {
        throw new UnprocessableError("Add a sport to your profile before generating matches");
      }
    }
    const sportId = athleteSport.sport_id;

    const statsRepo = new StatsRepository(ctx.supabase);
    const stats = await statsRepo.listByAthlete(profile.id, { sportId });
    const statPercentiles = stats
      .map((s) => s.percentile)
      .filter((p): p is number => p !== null);

    const schoolRepo = new SchoolRepository(ctx.supabase);
    const schools = await schoolRepo.listForMatching({
      associations: input.associations,
      states: input.states,
      limit: 500,
    });
    const schoolMap = new Map(schools.map((s) => [s.id, s]));

    const schoolSportRepo = new SchoolSportRepository(ctx.supabase);
    const programs = await schoolSportRepo.listBySportAndSchools(
      sportId,
      [...schoolMap.keys()],
      input.divisions
    );

    const scoringAthlete: ScoringAthlete = {
      gpa: profile.gpa,
      sat_score: profile.sat_score,
      act_score: profile.act_score,
      intended_major: profile.intended_major,
      home_state: profile.home_state,
      position: athleteSport.position,
      goals: profile.goals,
      preferences: profile.preferences,
      statPercentiles,
    };

    const ranked: RankedMatch[] = [];
    for (const program of programs) {
      const school = schoolMap.get(program.school_id);
      if (!school) continue;
      ranked.push({
        school: schoolSummary(school),
        program: programSummary(program),
        score: scoreOpportunity(scoringAthlete, school, program),
      });
    }
    ranked.sort((a, b) => b.score.overall_score - a.score.overall_score);
    const top = ranked.slice(0, input.limit);

    if (input.persist && top.length > 0) {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const rows: InsertDto<"opportunity_scores">[] = top.map((m) => ({
        athlete_profile_id: profile.id,
        school_id: m.school.id,
        sport_id: sportId,
        school_sport_id: m.program.id,
        overall_score: m.score.overall_score,
        athletic_fit: m.score.athletic_fit,
        academic_fit: m.score.academic_fit,
        roster_fit: m.score.roster_fit,
        major_fit: m.score.major_fit,
        location_fit: m.score.location_fit,
        program_level_fit: m.score.program_level_fit,
        match_tier: m.score.match_tier,
        confidence: m.score.confidence,
        explanation: m.score.explanation,
        factors: m.score.factors as unknown as Json,
        status: "computed",
        model_version: SCORING_MODEL_VERSION,
        computed_at: now.toISOString(),
        expires_at: expiresAt,
      }));
      // Scores are written with the service role (RLS restricts writes to admin).
      await new MatchRepository(createSupabaseAdminClient()).upsertScores(rows);
    }

    await audit(ctx, "matches.generate", "athlete_profiles", profile.id, {
      sport_id: sportId,
      evaluated: programs.length,
      returned: top.length,
    });

    return { sport_id: sportId, evaluated: programs.length, matches: top };
  },

  async listMatches(
    ctx: AuthContext,
    params: ListMatchesParams
  ): Promise<Array<Tables<"opportunity_scores"> & { school: SchoolSummary | null }>> {
    const athleteRepo = new AthleteRepository(ctx.supabase);
    const profile = await athleteRepo.getByUserId(ctx.userId);
    if (!profile) throw new NotFoundError("Athlete profile not found");

    const rows = await new MatchRepository(ctx.supabase).listByAthlete(profile.id, params);
    if (rows.length === 0) return [];

    const schoolIds = [...new Set(rows.map((r) => r.school_id))];
    const { data: schools, error } = await ctx.supabase
      .from("schools")
      .select("id, name, association, city, state, conference, logo_url")
      .in("id", schoolIds);
    if (error) throw error;

    const map = new Map((schools ?? []).map((s) => [s.id, s as SchoolSummary]));
    return rows.map((r) => ({ ...r, school: map.get(r.school_id) ?? null }));
  },

  async getMatchDetail(
    ctx: AuthContext,
    id: string
  ): Promise<
    Tables<"opportunity_scores"> & {
      school: Tables<"schools"> | null;
      program: Tables<"school_sports"> | null;
    }
  > {
    const score = await new MatchRepository(ctx.supabase).getById(id);
    if (!score) throw new NotFoundError("Match not found");

    const school = await new SchoolRepository(ctx.supabase).getById(score.school_id);
    const program = score.school_sport_id
      ? await new SchoolSportRepository(ctx.supabase).getById(score.school_sport_id)
      : null;

    return { ...score, school, program };
  },
};
