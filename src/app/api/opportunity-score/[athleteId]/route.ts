import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { DBAthleteProfile } from '@/lib/athlete-types';

type RouteParams = { params: Promise<{ athleteId: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { athleteId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  // Verify access to this athlete's scores
  const { data: athlete } = await supabase
    .from('athlete_profiles')
    .select('user_id')
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

  const isOwner = (athlete as Pick<DBAthleteProfile, 'user_id'>).user_id === user.id;
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

  const { searchParams } = new URL(request.url);
  const recommendation = searchParams.get('recommendation');
  const minScore = parseFloat(searchParams.get('min_score') ?? '0');
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '25')));
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('opportunity_scores')
    .select(
      `
      *,
      school_sport:school_sports(
        *,
        school:schools(*)
      )
    `,
      { count: 'exact' }
    )
    .eq('athlete_id', athleteId)
    .gte('overall_score', minScore)
    .order('overall_score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (recommendation) {
    query = query.eq('recommendation', recommendation);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      scores: data,
      total: count ?? 0,
      page,
      limit,
    },
    error: null,
  });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { athleteId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: athlete } = await supabase
    .from('athlete_profiles')
    .select('user_id')
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

  if ((athlete as Pick<DBAthleteProfile, 'user_id'>).user_id !== user.id && dbUser?.role !== 'admin') {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  // Allow deleting a single score by school_sport_id query param, or all scores
  const { searchParams } = new URL(request.url);
  const schoolSportId = searchParams.get('school_sport_id');

  let deleteQuery = supabase
    .from('opportunity_scores')
    .delete()
    .eq('athlete_id', athleteId);

  if (schoolSportId) {
    deleteQuery = deleteQuery.eq('school_sport_id', schoolSportId);
  }

  const { error } = await deleteQuery;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: { athleteId, schoolSportId: schoolSportId ?? 'all' },
    error: null,
  });
}
