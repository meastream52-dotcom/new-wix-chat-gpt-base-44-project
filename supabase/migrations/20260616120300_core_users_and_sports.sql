-- =====================================================================
-- Athlete Opportunity Engine — 03 Core: users + sports reference
-- ---------------------------------------------------------------------
-- public.users    : 1:1 mirror of auth.users carrying app-level identity.
-- public.sports   : canonical, multi-sport reference catalog. Every
--                   sport-scoped table (athlete_sports, school_sports,
--                   athlete_stats, videos, opportunity_scores) references
--                   this so the platform is multi-sport by construction.
-- =====================================================================

-- ---------------------------------------------------------------------
-- users — application profile keyed to Supabase Auth.
-- The PK IS auth.users.id, giving a guaranteed 1:1 link and letting RLS
-- policies compare rows directly against auth.uid().
-- ---------------------------------------------------------------------
create table public.users (
  id                    uuid primary key references auth.users (id) on delete cascade,
  email                 extensions.citext not null,
  role                  public.user_role not null default 'athlete',
  full_name             text,
  display_name          text,
  avatar_url            text,
  phone                 text,
  locale                text not null default 'en-US',
  timezone              text not null default 'America/New_York',
  marketing_opt_in      boolean not null default false,
  onboarding_completed  boolean not null default false,
  last_active_at        timestamptz,
  is_active             boolean not null default true,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint users_email_unique unique (email),
  constraint users_phone_format
    check (phone is null or phone ~ '^\+?[0-9 ().-]{7,20}$')
);

comment on table public.users is
  'Application-level user, 1:1 with auth.users (shared id). Source of role for RLS.';
comment on column public.users.role is
  'Account role; mirrored into auth JWT app_metadata.role for stateless RLS checks.';

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- sports — reference catalog enabling the multi-sport architecture.
-- ---------------------------------------------------------------------
create table public.sports (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null,
  name              text not null,
  display_name      text not null,
  gender_category   public.sport_gender_category not null,
  season            public.sport_season not null,
  -- Whether the sport is sponsored as a championship sport by each body.
  ncaa_sponsored    boolean not null default false,
  naia_sponsored    boolean not null default false,
  njcaa_sponsored   boolean not null default false,
  is_team_sport     boolean not null default true,
  -- Canonical stat keys this sport tracks (drives stat entry UIs & AI).
  stat_schema       jsonb not null default '{}'::jsonb,
  description       text,
  sort_order        integer not null default 1000,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- A sport is unique per name + competition gender (e.g. Men's vs
  -- Women's Basketball are distinct rows for clean scoping/scholarships).
  constraint sports_slug_unique unique (slug),
  constraint sports_name_gender_unique unique (name, gender_category)
);

comment on table public.sports is
  'Canonical multi-sport catalog. All sport-scoped data references sports.id.';
comment on column public.sports.stat_schema is
  'JSON descriptor of metric keys/units/labels for this sport; powers stat entry and AI parsing.';

create trigger trg_sports_updated_at
  before update on public.sports
  for each row execute function public.set_updated_at();
