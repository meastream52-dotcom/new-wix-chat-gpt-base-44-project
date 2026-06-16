import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateParentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  relationship: z.enum(['parent', 'guardian', 'other']).default('parent'),
  athleteId: z.string().uuid().optional(),
});

export async function GET(_request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  let query = supabase
    .from('parent_profiles')
    .select('*, athlete:athlete_profiles(id,first_name,last_name,sport)')
    .order('last_name');

  // Non-admins can only see their own parent profile
  if (dbUser?.role !== 'admin') {
    query = query.eq('user_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!dbUser || !['parent', 'admin'].includes(dbUser.role)) {
    return NextResponse.json(
      { data: null, error: 'Only parent accounts can create parent profiles' },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateParentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;

  // Verify athleteId exists if provided
  if (d.athleteId) {
    const { data: athlete } = await supabase
      .from('athlete_profiles')
      .select('id')
      .eq('id', d.athleteId)
      .single();

    if (!athlete) {
      return NextResponse.json({ data: null, error: 'Athlete not found' }, { status: 404 });
    }
  }

  const { data: profile, error } = await supabase
    .from('parent_profiles')
    .insert({
      user_id: user.id,
      first_name: d.firstName,
      last_name: d.lastName,
      phone: d.phone ?? null,
      relationship: d.relationship,
      athlete_id: d.athleteId ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { data: null, error: 'A parent profile already exists for this account' },
        { status: 409 }
      );
    }
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: profile, error: null }, { status: 201 });
}
