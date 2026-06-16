import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { scoreOpportunity } from '@/lib/opportunity-scorer';
import { z } from 'zod';
import type {
  DBAthleteProfile,
  DBSchoolSport,
  DBSchool,
  DBStats,
  DBVideo,
} from '@/lib/athlete-types';

const ScoreRequestSchema = z.object({
  athleteId: z.string().uuid(),
  schoolSportId: z.string().uuid(),
});

const BulkScoreRequestSchema = z.object({
  athleteId: z.string().uuid(),
  schoolSportIds: z.array(z.string().uuid()).min(1).max(50),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  // Support both single and bulk scoring
  const bulkParsed = BulkScoreRequestSchema.safeParse(body);
  const singleParsed = ScoreRequestSchema.safeParse(body);

  if (!bulkParsed.success && !singleParsed.success) {
    return NextResponse.json(
      { data: null, error: singleParsed.error?.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const athleteId = bulkParsed.success
    ? bulkParsed.data.athleteId
    : singleParsed.data!.athleteId;

  const schoolSportIds = bulkParsed.success
    ? bulkParsed.data.schoolSportIds
    : [singleParsed.data!.schoolSportId];

  // Verify athlete belongs to the requesting user (or admin)
  const { data: athlete } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('id', athleteId)
    .single();

  if (!athlete) {
    return NextResponse.json({ data: null, error: 'Athlete not found' }, { status: 404 });
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((athlete as DBAthleteProfile).user_id !== user.id && dbUser?.role !== 'admin') {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  // Load athlete stats and videos once
  const [{ data: stats }, { data: videos }] = await Promise.all([
    supabase.from('athlete_stats').select('*').eq('athlete_id', athleteId),
    supabase.from('videos').select('*').eq('athlete_id', athleteId),
  ]);

  const results = [];

  for (const schoolSportId of schoolSportIds) {
    const { data: schoolSport } = await supabase
      .from('school_sports')
      .select('*, school:schools(*)')
      .eq('id', schoolSportId)
      .single();

    if (!schoolSport) {
      results.push({
        schoolSportId,
        error: 'School sport program not found',
        score: null,
      });
      continue;
    }

    const school = (schoolSport as { school: DBSchool }).school;
    const scored = scoreOpportunity({
      athlete: athlete as DBAthleteProfile,
      stats: (stats ?? []) as DBStats[],
      videos: (videos ?? []) as DBVideo[],
      schoolSport: schoolSport as DBSchoolSport,
      school,
    });

    // Persist to DB
    const { data: savedScore, error: saveErr } = await supabase
      .from('opportunity_scores')
      .upsert(
        {
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
        },
        { onConflict: 'athlete_id,school_sport_id' }
      )
      .select()
      .single();

    if (saveErr) {
      results.push({ schoolSportId, error: saveErr.message, score: null });
    } else {
      results.push({ schoolSportId, error: null, score: savedScore });
    }
  }

  const status = results.every((r) => r.error === null) ? 200 : 207;
  return NextResponse.json({ data: results, error: null }, { status });
}
