import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateCoachSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  sport: z.string().min(1),
  schoolId: z.string().uuid().optional(),
  title: z.string().optional(),
  phone: z.string().optional(),
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
  const schoolId = searchParams.get('school_id');
  const sport = searchParams.get('sport');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const offset = (page - 1) * limit;

  let query = supabase
    .from('coach_profiles')
    .select('*, school:schools(id,name,division,state)', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('last_name');

  if (schoolId) query = query.eq('school_id', schoolId);
  if (sport) query = query.eq('sport', sport);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { coaches: data, total: count ?? 0, page, limit }, error: null });
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

  if (!dbUser || !['coach', 'school_admin', 'admin'].includes(dbUser.role)) {
    return NextResponse.json(
      { data: null, error: 'Only coach accounts can create coach profiles' },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateCoachSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const { data: profile, error } = await supabase
    .from('coach_profiles')
    .insert({
      user_id: user.id,
      first_name: d.firstName,
      last_name: d.lastName,
      sport: d.sport,
      school_id: d.schoolId ?? null,
      title: d.title ?? null,
      phone: d.phone ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { data: null, error: 'A coach profile already exists for this account' },
        { status: 409 }
      );
    }
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: profile, error: null }, { status: 201 });
}
