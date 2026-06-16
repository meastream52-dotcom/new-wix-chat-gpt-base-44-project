import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateStatSchema = z.object({
  season: z.string().min(1),
  sport: z.string().min(1),
  statKey: z.string().min(1),
  statValue: z.number(),
  unit: z.string().optional(),
});

const BulkCreateStatSchema = z.object({
  stats: z.array(CreateStatSchema).min(1).max(100),
});

type RouteParams = { params: Promise<{ id: string }> };

async function verifyAthleteAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  athleteId: string,
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const { data: athlete } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .eq('id', athleteId)
    .single();

  if (!athlete) return { allowed: false, reason: 'Athlete not found' };

  if (athlete.user_id === userId) return { allowed: true };

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (['admin', 'coach', 'school_admin'].includes(dbUser?.role ?? '')) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Forbidden' };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  const access = await verifyAthleteAccess(supabase, id, user.id);
  if (!access.allowed) {
    const status = access.reason === 'Athlete not found' ? 404 : 403;
    return NextResponse.json({ data: null, error: access.reason }, { status });
  }

  const { data, error } = await supabase
    .from('athlete_stats')
    .select('*')
    .eq('athlete_id', id)
    .order('season', { ascending: false })
    .order('stat_key');

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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
    .eq('id', id)
    .single();

  if (!athlete) {
    return NextResponse.json({ data: null, error: 'Athlete not found' }, { status: 404 });
  }
  if (athlete.user_id !== user.id) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  // Accept either a single stat or a bulk array
  const bulkParsed = BulkCreateStatSchema.safeParse(body);
  const singleParsed = CreateStatSchema.safeParse(body);

  let statsToInsert: z.infer<typeof CreateStatSchema>[] = [];

  if (bulkParsed.success) {
    statsToInsert = bulkParsed.data.stats;
  } else if (singleParsed.success) {
    statsToInsert = [singleParsed.data];
  } else {
    return NextResponse.json(
      { data: null, error: singleParsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const rows = statsToInsert.map((s) => ({
    athlete_id: id,
    season: s.season,
    sport: s.sport,
    stat_key: s.statKey,
    stat_value: s.statValue,
    unit: s.unit ?? null,
  }));

  const { data, error } = await supabase
    .from('athlete_stats')
    .upsert(rows, { onConflict: 'athlete_id,season,sport,stat_key' })
    .select();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null }, { status: 201 });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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
    .eq('id', id)
    .single();

  if (!athlete) {
    return NextResponse.json({ data: null, error: 'Athlete not found' }, { status: 404 });
  }
  if (athlete.user_id !== user.id) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statId = searchParams.get('stat_id');

  if (statId) {
    const { error } = await supabase
      .from('athlete_stats')
      .delete()
      .eq('id', statId)
      .eq('athlete_id', id);

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: { deleted: statId }, error: null });
  }

  // Delete all stats for a season if provided
  const season = searchParams.get('season');
  if (season) {
    const { error } = await supabase
      .from('athlete_stats')
      .delete()
      .eq('athlete_id', id)
      .eq('season', season);

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data: { deletedSeason: season }, error: null });
  }

  return NextResponse.json(
    { data: null, error: 'Provide stat_id or season query param' },
    { status: 422 }
  );
}
