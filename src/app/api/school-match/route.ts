import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchSchools } from '@/lib/school-matcher';
import { z } from 'zod';
import type { DBAthleteProfile } from '@/lib/athlete-types';

const SchoolMatchSchema = z.object({
  athleteId: z.string().uuid(),
  sport: z.string().optional(),
  gender: z.enum(['M', 'F', 'COED']).optional(),
  divisions: z
    .array(z.enum(['NCAA_D1', 'NCAA_D2', 'NCAA_D3', 'NAIA', 'JUCO', 'NJCAA']))
    .optional(),
  states: z.array(z.string().length(2)).optional(),
  minScholarships: z.number().int().min(0).optional(),
  recruitingOnly: z.boolean().default(true),
  limit: z.number().int().min(1).max(100).default(25),
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

  const parsed = SchoolMatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { athleteId, ...filters } = parsed.data;

  // Access check
  const { data: athlete } = await supabase
    .from('athlete_profiles')
    .select('user_id, sport')
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

  const isOwner = (athlete as Pick<DBAthleteProfile, 'user_id' | 'sport'>).user_id === user.id;
  const isParent = await (async () => {
    if (!isOwner) {
      const { data: pp } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('athlete_id', athleteId)
        .single();
      return !!pp;
    }
    return false;
  })();

  const hasAccess =
    isOwner ||
    isParent ||
    ['admin', 'coach', 'school_admin'].includes(dbUser?.role ?? '');

  if (!hasAccess) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  // Use athlete's sport as default if not specified in filters
  const sport =
    filters.sport ?? (athlete as Pick<DBAthleteProfile, 'user_id' | 'sport'>).sport;

  try {
    const matches = await matchSchools(supabase, athleteId, {
      sport,
      gender: filters.gender,
      divisions: filters.divisions,
      states: filters.states,
      minScholarships: filters.minScholarships,
      recruitingOnly: filters.recruitingOnly,
      limit: filters.limit,
    });

    return NextResponse.json({
      data: {
        athleteId,
        sport,
        totalMatches: matches.length,
        matches,
      },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Matching failed';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const athleteId = searchParams.get('athlete_id');

  if (!athleteId) {
    return NextResponse.json({ data: null, error: 'athlete_id query param required' }, { status: 422 });
  }

  // Return previously computed scores for this athlete with school data
  const { data, error } = await supabase
    .from('opportunity_scores')
    .select(
      `
      *,
      school_sport:school_sports(
        *,
        school:schools(*)
      )
    `
    )
    .eq('athlete_id', athleteId)
    .order('overall_score', { ascending: false })
    .limit(parseInt(searchParams.get('limit') ?? '25'));

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      athleteId,
      matches: data,
    },
    error: null,
  });
}
