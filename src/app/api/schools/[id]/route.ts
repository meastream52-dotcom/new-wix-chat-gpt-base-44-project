import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const UpdateSchoolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  division: z.enum(['NCAA_D1', 'NCAA_D2', 'NCAA_D3', 'NAIA', 'JUCO', 'NJCAA']).optional(),
  conference: z.string().nullable().optional(),
  state: z.string().length(2).optional(),
  city: z.string().min(1).optional(),
  websiteUrl: z.string().url().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  enrollment: z.number().int().positive().nullable().optional(),
  endowmentMillions: z.number().positive().nullable().optional(),
  acceptanceRate: z.number().min(0).max(100).nullable().optional(),
  avgGpa: z.number().min(0).max(4).nullable().optional(),
  avgSat: z.number().int().min(400).max(1600).nullable().optional(),
  avgAct: z.number().int().min(1).max(36).nullable().optional(),
  tuitionInState: z.number().int().positive().nullable().optional(),
  tuitionOutState: z.number().int().positive().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('schools')
    .select('*, sports:school_sports(*)')
    .eq('id', id)
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json(
      { data: null, error: status === 404 ? 'School not found' : error.message },
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

  const parsed = UpdateSchoolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const updates: Record<string, unknown> = {};
  if (d.name !== undefined) updates.name = d.name;
  if (d.division !== undefined) updates.division = d.division;
  if (d.conference !== undefined) updates.conference = d.conference;
  if (d.state !== undefined) updates.state = d.state;
  if (d.city !== undefined) updates.city = d.city;
  if (d.websiteUrl !== undefined) updates.website_url = d.websiteUrl;
  if (d.logoUrl !== undefined) updates.logo_url = d.logoUrl;
  if (d.enrollment !== undefined) updates.enrollment = d.enrollment;
  if (d.endowmentMillions !== undefined) updates.endowment_millions = d.endowmentMillions;
  if (d.acceptanceRate !== undefined) updates.acceptance_rate = d.acceptanceRate;
  if (d.avgGpa !== undefined) updates.avg_gpa = d.avgGpa;
  if (d.avgSat !== undefined) updates.avg_sat = d.avgSat;
  if (d.avgAct !== undefined) updates.avg_act = d.avgAct;
  if (d.tuitionInState !== undefined) updates.tuition_in_state = d.tuitionInState;
  if (d.tuitionOutState !== undefined) updates.tuition_out_state = d.tuitionOutState;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ data: null, error: 'No fields to update' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('schools')
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

  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (dbUser?.role !== 'admin') {
    return NextResponse.json({ data: null, error: 'Admin access required' }, { status: 403 });
  }

  const { error } = await supabase.from('schools').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id }, error: null });
}
