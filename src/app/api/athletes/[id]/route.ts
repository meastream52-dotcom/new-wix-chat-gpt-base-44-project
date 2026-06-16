import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateAthleteSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().date().optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  sport: z.string().min(1).optional(),
  position: z.string().nullable().optional(),
  heightInches: z.number().int().min(48).max(96).nullable().optional(),
  weightLbs: z.number().int().min(80).max(400).nullable().optional(),
  gpa: z.number().min(0).max(4).nullable().optional(),
  satScore: z.number().int().min(400).max(1600).nullable().optional(),
  actScore: z.number().int().min(1).max(36).nullable().optional(),
  state: z.string().length(2).nullable().optional(),
  city: z.string().nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  profileImageUrl: z.string().url().nullable().optional(),
  twitterHandle: z.string().nullable().optional(),
  instagramHandle: z.string().nullable().optional(),
  preferredDivisions: z
    .array(z.enum(['NCAA_D1', 'NCAA_D2', 'NCAA_D3', 'NAIA', 'JUCO', 'NJCAA']))
    .nullable()
    .optional(),
  preferredStates: z.array(z.string().length(2)).nullable().optional(),
  intendedMajor: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('athlete_profiles')
    .select(`
      *,
      stats:athlete_stats(*),
      videos(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json(
      { data: null, error: status === 404 ? 'Athlete not found' : error.message },
      { status }
    );
  }

  return NextResponse.json({ data, error: null });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  // Only the owning athlete or an admin can update
  const { data: existing } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ data: null, error: 'Athlete not found' }, { status: 404 });
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (existing.user_id !== user.id && dbUser?.role !== 'admin') {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = UpdateAthleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const updates: Record<string, unknown> = {};
  if (d.firstName !== undefined) updates.first_name = d.firstName;
  if (d.lastName !== undefined) updates.last_name = d.lastName;
  if (d.dateOfBirth !== undefined) updates.date_of_birth = d.dateOfBirth;
  if (d.graduationYear !== undefined) updates.graduation_year = d.graduationYear;
  if (d.sport !== undefined) updates.sport = d.sport;
  if (d.position !== undefined) updates.position = d.position;
  if (d.heightInches !== undefined) updates.height_inches = d.heightInches;
  if (d.weightLbs !== undefined) updates.weight_lbs = d.weightLbs;
  if (d.gpa !== undefined) updates.gpa = d.gpa;
  if (d.satScore !== undefined) updates.sat_score = d.satScore;
  if (d.actScore !== undefined) updates.act_score = d.actScore;
  if (d.state !== undefined) updates.state = d.state;
  if (d.city !== undefined) updates.city = d.city;
  if (d.bio !== undefined) updates.bio = d.bio;
  if (d.profileImageUrl !== undefined) updates.profile_image_url = d.profileImageUrl;
  if (d.twitterHandle !== undefined) updates.twitter_handle = d.twitterHandle;
  if (d.instagramHandle !== undefined) updates.instagram_handle = d.instagramHandle;
  if (d.preferredDivisions !== undefined) updates.preferred_divisions = d.preferredDivisions;
  if (d.preferredStates !== undefined) updates.preferred_states = d.preferredStates;
  if (d.intendedMajor !== undefined) updates.intended_major = d.intendedMajor;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ data: null, error: 'No fields to update' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('athlete_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ data: null, error: 'Athlete not found' }, { status: 404 });
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (existing.user_id !== user.id && dbUser?.role !== 'admin') {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase.from('athlete_profiles').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null });
}
