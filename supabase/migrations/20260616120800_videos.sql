-- =====================================================================
-- Athlete Opportunity Engine — 08 Videos
-- ---------------------------------------------------------------------
-- Highlight / film assets uploaded to Supabase Storage or linked from
-- external providers (Hudl, YouTube). Includes AI analysis + embedding
-- columns for future automated film breakdown and semantic search.
-- =====================================================================

create table public.videos (
  id                    uuid primary key default gen_random_uuid(),
  athlete_profile_id    uuid not null references public.athlete_profiles (id) on delete cascade,
  sport_id              uuid references public.sports (id) on delete set null,

  title                 text not null,
  description           text,
  video_type            public.video_type not null default 'highlight',

  -- Source: a Supabase Storage object path and/or an external URL.
  storage_bucket        text,
  storage_path          text,
  external_url          text,
  public_url            text,
  thumbnail_url         text,

  duration_seconds      integer,
  size_bytes            bigint,
  width                 integer,
  height                integer,

  status                public.video_status not null default 'processing',
  is_public             boolean not null default false,
  is_featured           boolean not null default false,
  views_count           integer not null default 0,
  recorded_on           date,

  -- AI film breakdown (future AI agent): tags, detected events, summary.
  ai_analysis           jsonb not null default '{}'::jsonb,
  ai_tags               text[] not null default '{}',
  -- Semantic search embedding of title/description/AI summary.
  embedding             extensions.vector(1536),
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint videos_source_present
    check (storage_path is not null or external_url is not null),
  constraint videos_duration_nonneg
    check (duration_seconds is null or duration_seconds >= 0),
  constraint videos_views_nonneg
    check (views_count >= 0)
);

comment on table public.videos is
  'Athlete film assets (Storage or external); carries AI analysis + embedding for search.';

create trigger trg_videos_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();
