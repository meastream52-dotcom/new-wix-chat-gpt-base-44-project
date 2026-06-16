import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateAthleteSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().date().optional(),
  graduationYear: z.number().int().min(2020).max(2035),
  sport: z.string().min(1),
  position: z.string().optional(),
  heightInches: z.number().int().min(48).max(96).optional(),
  weightLbs: z.number().int().min(80).max(400).optional(),
  gpa: z.number().min(0).max(4).optional(),
  satScore: z.number().int().min(400).max(1600).optional(),
  actScore: z.number().int().min(1).max(36).optional(),
  state: z.string().length(2).optional(),
  city: z.string().optional(),
  bio: z.string().max(2000).optional(),
  profileImageUrl: z.string().url().optional(),
  twitterHandle: z.string().optional(),
  instagramHandle: z.string().optional(),
  preferredDivisions: z
    .array(z.enum(['NCAA_D1', 'NCAA_D2', 'NCAA_D3', 'NAIA', 'JUCO', 'NJCAA']))
    .optional(),
  preferredStates: z.array(z.string().length(2)).optional(),
  intendedMajor: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport');
  const graduationYear = searchParams.get('graduation_year');
  const state = searchParams.get('state');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const offset = (page - 1) * limit;

  // Only admin/coach/school_admin can list all athletes
  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = dbUser?.role;

  let query = supabase
    .from('athlete_profiles')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (role === 'athlete') {
    query = query.eq('user_id', user.id);
  }

  if (sport) query = query.eq('sport', sport);
  if (graduationYear) query = query.eq('graduation_year', parseInt(graduationYear));
  if (state) query = query.eq('state', state);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      athletes: data,
      total: count ?? 0,
      page,
      limit,
    },
    error: null,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the user is registered as an athlete role
  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!dbUser || !['athlete', 'admin'].includes(dbUser.role)) {
    return NextResponse.json(
      { data: null, error: 'Only athlete accounts can create athlete profiles' },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateAthleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const { data: profile, error } = await supabase
    .from('athlete_profiles')
    .insert({
      user_id: user.id,
      first_name: d.firstName,
      last_name: d.lastName,
      date_of_birth: d.dateOfBirth ?? null,
      graduation_year: d.graduationYear,
      sport: d.sport,
      position: d.position ?? null,
      height_inches: d.heightInches ?? null,
      weight_lbs: d.weightLbs ?? null,
      gpa: d.gpa ?? null,
      sat_score: d.satScore ?? null,
      act_score: d.actScore ?? null,
      state: d.state ?? null,
      city: d.city ?? null,
      bio: d.bio ?? null,
      profile_image_url: d.profileImageUrl ?? null,
      twitter_handle: d.twitterHandle ?? null,
      instagram_handle: d.instagramHandle ?? null,
      preferred_divisions: d.preferredDivisions ?? null,
      preferred_states: d.preferredStates ?? null,
      intended_major: d.intendedMajor ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { data: null, error: 'An athlete profile already exists for this account' },
        { status: 409 }
      );
    }
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: profile, error: null }, { status: 201 });
}
