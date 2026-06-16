-- =====================================================================
-- Athlete Opportunity Engine — 05 Profiles + relationships
-- ---------------------------------------------------------------------
-- Role-specific profiles (athlete / parent / coach), the multi-sport
-- junction (athlete_sports) and the guardian linkage (athlete_guardians)
-- that connects parents to the athletes they manage.
-- =====================================================================

-- ---------------------------------------------------------------------
-- athlete_profiles — 1:1 with a user whose role = 'athlete'.
-- ---------------------------------------------------------------------
create table public.athlete_profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users (id) on delete cascade,

  -- Identity / physical
  first_name            text,
  last_name             text,
  date_of_birth         date,
  gender                public.gender,
  height_cm             numeric(5,2),
  weight_kg             numeric(5,2),
  dominant_hand         text,                         -- 'left' | 'right' | 'both'

  -- Academics
  graduation_year       smallint,
  gpa                   numeric(3,2),
  sat_score             smallint,
  act_score             smallint,
  intended_major        text,
  ncaa_eligibility_id   text,                         -- NCAA Eligibility Center ID

  -- Location
  hometown_city         text,
  home_state            text,
  home_country          text not null default 'USA',
  current_school        text,                         -- high school / juco name

  -- Recruiting
  recruiting_status     public.athlete_recruiting_status not null default 'exploring',
  committed_school_id   uuid references public.schools (id) on delete set null,
  visibility            public.profile_visibility not null default 'recruiters_only',
  is_verified           boolean not null default false,

  bio                   text,
  -- Athlete recruiting goals (PRD §11): target division, timeline, etc.
  goals                 jsonb not null default '{}'::jsonb,
  -- Athlete preferences for matching (desired regions, size, distance...).
  preferences           jsonb not null default '{}'::jsonb,
  -- AI matching embedding of the athlete profile.
  embedding             extensions.vector(1536),
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint athlete_profiles_user_unique unique (user_id),
  constraint athlete_profiles_grad_year
    check (graduation_year is null or graduation_year between 1950 and 2100),
  constraint athlete_profiles_gpa
    check (gpa is null or gpa between 0 and 5),
  constraint athlete_profiles_sat
    check (sat_score is null or sat_score between 400 and 1600),
  constraint athlete_profiles_act
    check (act_score is null or act_score between 1 and 36),
  constraint athlete_profiles_height
    check (height_cm is null or height_cm between 50 and 280),
  constraint athlete_profiles_weight
    check (weight_kg is null or weight_kg between 20 and 300),
  constraint athlete_profiles_dob_past
    check (date_of_birth is null or date_of_birth < current_date)
);

comment on table public.athlete_profiles is
  'Athlete-specific profile (1:1 with users). Hub for sports, stats, videos and scores.';

create trigger trg_athlete_profiles_updated_at
  before update on public.athlete_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- parent_profiles — 1:1 with a user whose role = 'parent'.
-- ---------------------------------------------------------------------
create table public.parent_profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users (id) on delete cascade,
  occupation            text,
  contact_phone         text,
  preferred_contact     text not null default 'email',  -- 'email' | 'phone' | 'sms'
  notes                 text,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint parent_profiles_user_unique unique (user_id),
  constraint parent_profiles_phone_format
    check (contact_phone is null or contact_phone ~ '^\+?[0-9 ().-]{7,20}$')
);

comment on table public.parent_profiles is
  'Parent/guardian profile (1:1 with users). Linked to athletes via athlete_guardians.';

create trigger trg_parent_profiles_updated_at
  before update on public.parent_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- coach_profiles — 1:1 with a user whose role = 'coach'.
-- ---------------------------------------------------------------------
create table public.coach_profiles (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users (id) on delete cascade,
  coach_type            public.coach_type not null default 'high_school',
  school_id             uuid references public.schools (id) on delete set null,
  primary_sport_id      uuid references public.sports (id) on delete set null,
  title                 text,                            -- 'Head Coach', 'Assistant'
  organization          text,                            -- club/HS name if not a school
  years_experience      smallint,
  recruiting_regions    text[] not null default '{}',
  recruiting_email      text,
  is_verified           boolean not null default false,
  verified_at           timestamptz,
  bio                   text,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint coach_profiles_user_unique unique (user_id),
  constraint coach_profiles_years
    check (years_experience is null or years_experience between 0 and 80)
);

comment on table public.coach_profiles is
  'Coach profile (1:1 with users). May be affiliated with a school and a primary sport.';

create trigger trg_coach_profiles_updated_at
  before update on public.coach_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- athlete_sports — multi-sport junction: an athlete may play many sports.
-- ---------------------------------------------------------------------
create table public.athlete_sports (
  id                    uuid primary key default gen_random_uuid(),
  athlete_profile_id    uuid not null references public.athlete_profiles (id) on delete cascade,
  sport_id              uuid not null references public.sports (id) on delete restrict,
  is_primary            boolean not null default false,
  position              text,
  secondary_position    text,
  jersey_number         smallint,
  years_experience      smallint,
  club_team             text,
  is_active             boolean not null default true,
  metadata              jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint athlete_sports_unique unique (athlete_profile_id, sport_id),
  constraint athlete_sports_jersey
    check (jersey_number is null or jersey_number between 0 and 999)
);

comment on table public.athlete_sports is
  'Junction enabling multi-sport athletes; one row per (athlete, sport).';

create trigger trg_athlete_sports_updated_at
  before update on public.athlete_sports
  for each row execute function public.set_updated_at();

-- Enforce at most one primary sport per athlete.
create unique index uniq_athlete_primary_sport
  on public.athlete_sports (athlete_profile_id)
  where is_primary;

-- ---------------------------------------------------------------------
-- athlete_guardians — many:many between athletes and parents.
-- ---------------------------------------------------------------------
create table public.athlete_guardians (
  id                    uuid primary key default gen_random_uuid(),
  athlete_profile_id    uuid not null references public.athlete_profiles (id) on delete cascade,
  parent_profile_id     uuid not null references public.parent_profiles (id) on delete cascade,
  relationship          public.guardian_relationship not null default 'legal_guardian',
  is_primary            boolean not null default false,
  -- Whether this guardian may edit/manage the athlete account & data.
  can_manage            boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint athlete_guardians_unique unique (athlete_profile_id, parent_profile_id)
);

comment on table public.athlete_guardians is
  'Links parents/guardians to athletes; can_manage governs write access via RLS.';

create trigger trg_athlete_guardians_updated_at
  before update on public.athlete_guardians
  for each row execute function public.set_updated_at();

-- At most one primary guardian per athlete.
create unique index uniq_athlete_primary_guardian
  on public.athlete_guardians (athlete_profile_id)
  where is_primary;
