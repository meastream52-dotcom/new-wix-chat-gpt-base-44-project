import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateSchoolSportSchema = z.object({
  sport: z.string().min(1),
  gender: z.enum(['M', 'F', 'COED']).default('M'),
  scholarshipsTotal: z.number().int().min(0).optional(),
  scholarshipsRemaining: z.number().int().min(0).optional(),
  headCoachName: z.string().optional(),
  headCoachEmail: z.string().email().optional(),
  rosterSize: z.number().int().positive().optional(),
  typicalPositionsNeeded: z.array(z.string()).optional(),
  minGpa: z.number().min(0).max(4).optional(),
  minSat: z.number().int().min(400).max(1600).optional(),
  minAct: z.number().int().min(1).max(36).optional(),
  recruitingActive: z.boolean().default(true),
});

const UpdateSchoolSportSchema = CreateSchoolSportSchema.partial();

type RouteParams = { params: Promise<{ id: string }> };

async function assertAdminOrSchoolCoach(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  schoolId: string
): Promise<boolean> {
  const { data: dbUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (dbUser?.role === 'admin') return true;

  const { data: coach } = await supabase
    .from('coach_profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('school_id', schoolId)
    .single();

  return !!coach;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('school_sports')
    .select('*')
    .eq('school_id', id)
    .order('sport')
    .order('gender');

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

  const allowed = await assertAdminOrSchoolCoach(supabase, user.id, id);
  if (!allowed) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  // Verify school exists
  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .eq('id', id)
    .single();

  if (!school) {
    return NextResponse.json({ data: null, error: 'School not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = CreateSchoolSportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const { data: sportRow, error } = await supabase
    .from('school_sports')
    .insert({
      school_id: id,
      sport: d.sport,
      gender: d.gender,
      scholarships_total: d.scholarshipsTotal ?? null,
      scholarships_remaining: d.scholarshipsRemaining ?? null,
      head_coach_name: d.headCoachName ?? null,
      head_coach_email: d.headCoachEmail ?? null,
      roster_size: d.rosterSize ?? null,
      typical_positions_needed: d.typicalPositionsNeeded ?? null,
      min_gpa: d.minGpa ?? null,
      min_sat: d.minSat ?? null,
      min_act: d.minAct ?? null,
      recruiting_active: d.recruitingActive,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { data: null, error: 'This sport/gender combination already exists for this school' },
        { status: 409 }
      );
    }
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: sportRow, error: null }, { status: 201 });
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

  const { searchParams } = new URL(request.url);
  const sportId = searchParams.get('sport_id');
  if (!sportId) {
    return NextResponse.json({ data: null, error: 'sport_id query param required' }, { status: 422 });
  }

  const allowed = await assertAdminOrSchoolCoach(supabase, user.id, id);
  if (!allowed) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = UpdateSchoolSportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const updates: Record<string, unknown> = {};
  if (d.sport !== undefined) updates.sport = d.sport;
  if (d.gender !== undefined) updates.gender = d.gender;
  if (d.scholarshipsTotal !== undefined) updates.scholarships_total = d.scholarshipsTotal;
  if (d.scholarshipsRemaining !== undefined) updates.scholarships_remaining = d.scholarshipsRemaining;
  if (d.headCoachName !== undefined) updates.head_coach_name = d.headCoachName;
  if (d.headCoachEmail !== undefined) updates.head_coach_email = d.headCoachEmail;
  if (d.rosterSize !== undefined) updates.roster_size = d.rosterSize;
  if (d.typicalPositionsNeeded !== undefined) updates.typical_positions_needed = d.typicalPositionsNeeded;
  if (d.minGpa !== undefined) updates.min_gpa = d.minGpa;
  if (d.minSat !== undefined) updates.min_sat = d.minSat;
  if (d.minAct !== undefined) updates.min_act = d.minAct;
  if (d.recruitingActive !== undefined) updates.recruiting_active = d.recruitingActive;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ data: null, error: 'No fields to update' }, { status: 422 });
  }

  const { data, error } = await supabase
    .from('school_sports')
    .update(updates)
    .eq('id', sportId)
    .eq('school_id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, error: null });
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

  const { searchParams } = new URL(request.url);
  const sportId = searchParams.get('sport_id');
  if (!sportId) {
    return NextResponse.json({ data: null, error: 'sport_id query param required' }, { status: 422 });
  }

  const allowed = await assertAdminOrSchoolCoach(supabase, user.id, id);
  if (!allowed) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('school_sports')
    .delete()
    .eq('id', sportId)
    .eq('school_id', id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { id: sportId }, error: null });
}
