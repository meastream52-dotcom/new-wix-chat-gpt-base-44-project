import type { SupabaseClient } from '@supabase/supabase-js';
import { scoreOpportunity } from './opportunity-scorer';
import type {
  DBAthleteProfile,
  DBSchool,
  DBSchoolSport,
  DBSchoolSportWithSchool,
  DBStats,
  DBVideo,
  DBOpportunityScore,
  SchoolMatchFilters,
  SchoolMatchResult,
  GenderType,
  DivisionType,
} from './athlete-types';

interface AthleteWithRelations extends DBAthleteProfile {
  stats: DBStats[];
  videos: DBVideo[];
}

async function loadAthlete(
  supabase: SupabaseClient,
  athleteId: string
): Promise<AthleteWithRelations> {
  const { data: athlete, error: aErr } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('id', athleteId)
    .single();
  if (aErr || !athlete) {
    throw new Error(aErr?.message ?? 'Athlete not found');
  }

  const { data: stats } = await supabase
    .from('athlete_stats')
    .select('*')
    .eq('athlete_id', athleteId);

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('athlete_id', athleteId);

  return {
    ...(athlete as DBAthleteProfile),
    stats: (stats ?? []) as DBStats[],
    videos: (videos ?? []) as DBVideo[],
  };
}

async function loadCandidateSchoolSports(
  supabase: SupabaseClient,
  filters: SchoolMatchFilters
): Promise<DBSchoolSportWithSchool[]> {
  let query = supabase
    .from('school_sports')
    .select('*, school:schools(*)')
    .eq('sport', filters.sport);

  if (filters.gender) {
    query = query.eq('gender', filters.gender);
  }
  if (filters.recruitingOnly !== false) {
    query = query.eq('recruiting_active', true);
  }
  if (filters.minScholarships != null) {
    query = query.gte('scholarships_remaining', filters.minScholarships);
  }
  if (filters.divisions && filters.divisions.length > 0) {
    // Filter via the joined schools table
    query = query.in('school.division', filters.divisions);
  }
  if (filters.states && filters.states.length > 0) {
    query = query.in('school.state', filters.states);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  // Apply joined-table filters that Supabase can't filter inline via PostgREST
  let rows = (data ?? []) as DBSchoolSportWithSchool[];

  if (filters.divisions && filters.divisions.length > 0) {
    rows = rows.filter((r) => filters.divisions!.includes(r.school.division));
  }
  if (filters.states && filters.states.length > 0) {
    rows = rows.filter((r) => filters.states!.includes(r.school.state));
  }

  return rows;
}

async function persistScore(
  supabase: SupabaseClient,
  athleteId: string,
  schoolSportId: string,
  scored: ReturnType<typeof scoreOpportunity>
): Promise<DBOpportunityScore> {
  const payload = {
    athlete_id: athleteId,
    school_sport_id: schoolSportId,
    overall_score: scored.overallScore,
    athletic_fit_score: scored.athleticFitScore,
    academic_fit_score: scored.academicFitScore,
    financial_fit_score: scored.financialFitScore,
    geographic_fit_score: scored.geographicFitScore,
    profile_completeness_score: scored.profileCompletenessScore,
    score_breakdown: scored.breakdown,
    recommendation: scored.recommendation,
    calculated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('opportunity_scores')
    .upsert(payload, { onConflict: 'athlete_id,school_sport_id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DBOpportunityScore;
}

export async function matchSchools(
  supabase: SupabaseClient,
  athleteId: string,
  filters: SchoolMatchFilters
): Promise<SchoolMatchResult[]> {
  const athlete = await loadAthlete(supabase, athleteId);
  const candidates = await loadCandidateSchoolSports(supabase, {
    ...filters,
    sport: filters.sport ?? athlete.sport,
  });

  const results: SchoolMatchResult[] = [];

  for (const candidate of candidates) {
    const scored = scoreOpportunity({
      athlete,
      stats: athlete.stats,
      videos: athlete.videos,
      schoolSport: candidate,
      school: candidate.school,
    });

    const score = await persistScore(supabase, athleteId, candidate.id, scored);

    results.push({
      school: candidate.school,
      schoolSport: candidate,
      score,
    });
  }

  // Sort descending by overall score
  results.sort((a, b) => b.score.overall_score - a.score.overall_score);

  const limit = filters.limit ?? 25;
  return results.slice(0, limit);
}
