import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateParentSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  relationship: z.enum(['parent', 'guardian', 'other']).optional(),
  athleteId: z.string().uuid().nullable().optional(),
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
    .from('parent_profiles')
    .select('*, athlete:athlete_profiles(*)')
    .eq('id', id)
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json(
      { data: null, error: status === 404 ? 'Parent not found' : error.message },
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

  const { data: existing } = await supabase
    .from('parent_profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ data: null, error: 'Parent profile not found' }, { status: 404 });
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

  const parsed = UpdateParentSchema.safeParse(body);
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
  if (d.phone !== undefined) updates.phone = d.phone;
  if (d.relationship !== undefined) updates.relationship = d.relationship;
  if (d.athleteId !== undefined) {
    if (d.athleteId !== null) {
      const { data: athlete } = await supabase
        .from('athlete_profiles')
        .select('id')
        .eq('id', d.athleteId)
        .single();
      if (!athlete) {
        return NextResponse.json({ data: null, error: 'Athlete not found' }, { status: 404 });
      }
    }
    updates.athlete_id = d.athleteId;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ data: null, error: 'No fields to update' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('parent_profiles')
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
    .from('parent_profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ data: null, error: 'Parent profile not found' }, { status: 404 });
  }

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (existing.user_id !== user.id && dbUser?.role !== 'admin') {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase.from('parent_profiles').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null });
}
