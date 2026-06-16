import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateVideoSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
  platform: z.enum(['youtube', 'hudl', 'vimeo', 'other']).default('youtube'),
  durationSeconds: z.number().int().positive().optional(),
  highlightType: z
    .enum(['highlight_reel', 'game_film', 'skill', 'interview'])
    .default('highlight_reel'),
  isPrimary: z.boolean().default(false),
  thumbnailUrl: z.string().url().optional(),
});

const UpdateVideoSchema = CreateVideoSchema.partial();

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

  const { data: athlete } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!athlete) {
    return NextResponse.json({ data: null, error: 'Athlete not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('athlete_id', id)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

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

  const parsed = CreateVideoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;

  // If this video is being set as primary, unset any existing primary
  if (d.isPrimary) {
    await supabase
      .from('videos')
      .update({ is_primary: false })
      .eq('athlete_id', id)
      .eq('is_primary', true);
  }

  const { data: video, error } = await supabase
    .from('videos')
    .insert({
      athlete_id: id,
      title: d.title,
      url: d.url,
      platform: d.platform,
      duration_seconds: d.durationSeconds ?? null,
      highlight_type: d.highlightType,
      is_primary: d.isPrimary,
      thumbnail_url: d.thumbnailUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: video, error: null }, { status: 201 });
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
  const videoId = searchParams.get('video_id');
  if (!videoId) {
    return NextResponse.json({ data: null, error: 'video_id query param required' }, { status: 422 });
  }

  const { data: athlete } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!athlete || athlete.user_id !== user.id) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = UpdateVideoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const d = parsed.data;
  const updates: Record<string, unknown> = {};
  if (d.title !== undefined) updates.title = d.title;
  if (d.url !== undefined) updates.url = d.url;
  if (d.platform !== undefined) updates.platform = d.platform;
  if (d.durationSeconds !== undefined) updates.duration_seconds = d.durationSeconds;
  if (d.highlightType !== undefined) updates.highlight_type = d.highlightType;
  if (d.thumbnailUrl !== undefined) updates.thumbnail_url = d.thumbnailUrl;

  if (d.isPrimary === true) {
    await supabase
      .from('videos')
      .update({ is_primary: false })
      .eq('athlete_id', id)
      .eq('is_primary', true);
    updates.is_primary = true;
  }

  const { data: video, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', videoId)
    .eq('athlete_id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: video, error: null });
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

  if (!athlete || athlete.user_id !== user.id) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('video_id');
  if (!videoId) {
    return NextResponse.json({ data: null, error: 'video_id query param required' }, { status: 422 });
  }

  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId)
    .eq('athlete_id', id);

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: { deleted: videoId }, error: null });
}
