-- =====================================================================
-- Athlete Opportunity Engine — 04 Schools
-- ---------------------------------------------------------------------
-- Institutions across NCAA / NAIA / NJCAA. Carries academic, financial
-- and geographic attributes consumed by the opportunity engine, plus an
-- embedding column for AI / semantic matching.
-- =====================================================================

create table public.schools (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null,
  name                  text not null,
  short_name            text,
  association           public.athletic_association not null,
  school_type           public.school_type,

  -- Location
  city                  text,
  state                 text,                       -- US 2-letter or province
  region               text,                        -- e.g. 'Southeast', 'Midwest'
  country               text not null default 'USA',
  postal_code           text,
  latitude              numeric(9,6),
  longitude             numeric(9,6),

  -- Branding
  website_url           text,
  logo_url              text,
  mascot                text,
  primary_color         text,
  secondary_color       text,
  conference            text,                        -- school-wide primary conference

  -- Academics (used by academic_fit scoring)
  enrollment_total      integer,
  enrollment_undergrad  integer,
  acceptance_rate       numeric(5,4),                -- 0..1
  avg_gpa               numeric(3,2),
  sat_total_25          smallint,
  sat_total_75          smallint,
  act_composite_25      smallint,
  act_composite_75      smallint,
  graduation_rate       numeric(5,4),                -- 0..1
  -- Offered majors/programs of study (used by major_fit scoring).
  offered_majors        text[] not null default '{}',

  -- Cost / aid (used by financial_fit + future scholarship engine)
  tuition_in_state      numeric(10,2),
  tuition_out_state     numeric(10,2),
  room_and_board        numeric(10,2),
  cost_of_attendance    numeric(10,2),
  avg_financial_aid     numeric(10,2),
  avg_athletic_aid      numeric(10,2),

  description           text,
  -- AI matching / semantic retrieval (OpenAI text-embedding-3-small = 1536d)
  embedding             extensions.vector(1536),
  metadata              jsonb not null default '{}'::jsonb,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint schools_slug_unique unique (slug),
  constraint schools_latitude_range
    check (latitude is null or latitude between -90 and 90),
  constraint schools_longitude_range
    check (longitude is null or longitude between -180 and 180),
  constraint schools_acceptance_rate_range
    check (acceptance_rate is null or acceptance_rate between 0 and 1),
  constraint schools_graduation_rate_range
    check (graduation_rate is null or graduation_rate between 0 and 1),
  constraint schools_avg_gpa_range
    check (avg_gpa is null or avg_gpa between 0 and 5),
  constraint schools_sat_range check (
    (sat_total_25 is null or sat_total_25 between 400 and 1600)
    and (sat_total_75 is null or sat_total_75 between 400 and 1600)
  ),
  constraint schools_act_range check (
    (act_composite_25 is null or act_composite_25 between 1 and 36)
    and (act_composite_75 is null or act_composite_75 between 1 and 36)
  )
);

comment on table public.schools is
  'Institutions across NCAA/NAIA/NJCAA with academic, cost and geo attributes for matching.';
comment on column public.schools.embedding is
  'pgvector embedding of the school profile for AI/semantic matching (cosine).';

create trigger trg_schools_updated_at
  before update on public.schools
  for each row execute function public.set_updated_at();

-- Auto-populate slug from name on insert/update when not explicitly set.
create or replace function public.schools_set_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or length(trim(new.slug)) = 0 then
    new.slug := public.slugify(
      coalesce(new.name, '') ||
      case when new.state is not null then '-' || new.state else '' end
    );
  end if;
  return new;
end;
$$;

create trigger trg_schools_set_slug
  before insert or update of name, state, slug on public.schools
  for each row execute function public.schools_set_slug();
