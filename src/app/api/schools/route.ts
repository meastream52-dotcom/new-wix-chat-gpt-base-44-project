import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateSchoolSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  division: z.enum(['NCAA_D1', 'NCAA_D2', 'NCAA_D3', 'NAIA', 'JUCO', 'NJCAA']),
  conference: z.string().optional(),
  state: z.string().length(2),
  city: z.string().min(1),
  websiteUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  enrollment: z.number().int().positive().optional(),
  endowmentMillions: z.number().positive().optional(),
  acceptanceRate: z.number().min(0).max(100).optional(),
  avgGpa: z.number().min(0).max(4).optional(),
  avgSat: z.number().int().min(400).max(1600).optional(),
  avgAct: z.number().int().min(1).max(36).optional(),
  tuitionInState: z.number().int().positive().optional(),
  tuitionOutState: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const division = searchParams.get('division');
  const state = searchParams.get('state');
  const query = searchParams.get('q');
  const sport = searchParams.get('sport');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
  const offset = (page - 1) * limit;

  let dbQuery = supabase
    .from('schools')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('name');

  if (division) dbQuery = dbQuery.eq('division', division);
  if (state) dbQuery = dbQuery.eq('state', state);
  if (query) dbQuery = dbQuery.ilike('name', `%${query}%`);

  if (sport) {
    // Filter to schools that have a program for this sport
    const { data: schoolIds } = await supabase
      .from('school_sports')
      .select('school_id')
      .eq('sport', sport)
      .eq('recruiting_active', true);

    const ids = (schoolIds ?? []).map((r: { school_id: string }) => r.school_id);
    if (ids.length === 0) {
      return NextResponse.json(
        { data: { schools: [], total: 0, page, limit }, error: null }
      );
    }
    dbQuery = dbQuery.in('id', ids);
  }

  const { data, error, count } = await dbQuery;

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { schools: data, total: count ?? 0, page, limit }, error: null });
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

  if (dbUser?.role !== 'admin') {
    return NextResponse.json({ data: null, error: 'Admin access required' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateSchoolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const { data: school, error } = await supabase
    .from('schools')
    .insert({
      name: d.name,
      slug: d.slug,
      division: d.division,
      conference: d.conference ?? null,
      state: d.state,
      city: d.city,
      website_url: d.websiteUrl ?? null,
      logo_url: d.logoUrl ?? null,
      enrollment: d.enrollment ?? null,
      endowment_millions: d.endowmentMillions ?? null,
      acceptance_rate: d.acceptanceRate ?? null,
      avg_gpa: d.avgGpa ?? null,
      avg_sat: d.avgSat ?? null,
      avg_act: d.avgAct ?? null,
      tuition_in_state: d.tuitionInState ?? null,
      tuition_out_state: d.tuitionOutState ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { data: null, error: 'A school with this slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: school, error: null }, { status: 201 });
}
