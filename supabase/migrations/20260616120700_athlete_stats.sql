-- =====================================================================
-- Athlete Opportunity Engine — 07 Athlete stats
-- ---------------------------------------------------------------------
-- Sport-agnostic performance measurements. A hybrid model: one row per
-- measured metric (metric_key/value/unit) keeps it flexible across every
-- sport while remaining fully queryable & indexable. Verification fields
-- capture trust/provenance for downstream scoring.
-- =====================================================================

create table public.athlete_stats (
  id                    uuid primary key default gen_random_uuid(),
  athlete_profile_id    uuid not null references public.athlete_profiles (id) on delete cascade,
  sport_id              uuid not null references public.sports (id) on delete restrict,

  -- What was measured
  metric_key            text not null,                  -- e.g. 'forty_yard_dash', 'ppg'
  metric_value          numeric,                        -- numeric form (preferred)
  metric_text           text,                           -- display/non-numeric form ('4:32.10')
  unit                  text,                            -- 's','in','cm','mph','ppg'...
  percentile            numeric(5,2),                    -- 0..100 vs peer cohort

  -- When / where
  season_year           smallint,
  competition_level     text,                            -- 'varsity','club','combine'
  recorded_at           date,

  -- Trust / provenance
  is_verified           boolean not null default false,
  verification_source   public.stat_source not null default 'self_reported',
  verified_by           uuid references public.users (id) on delete set null,
  verified_at           timestamptz,

  context               jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint athlete_stats_value_present
    check (metric_value is not null or metric_text is not null),
  constraint athlete_stats_percentile
    check (percentile is null or percentile between 0 and 100),
  constraint athlete_stats_season
    check (season_year is null or season_year between 1950 and 2100)
);

comment on table public.athlete_stats is
  'Flexible per-metric athlete performance data; multi-sport via metric_key + sport_id.';
comment on column public.athlete_stats.metric_key is
  'Sport-specific metric identifier; should match a key in sports.stat_schema.';

create trigger trg_athlete_stats_updated_at
  before update on public.athlete_stats
  for each row execute function public.set_updated_at();

-- Keep verified_at consistent with is_verified.
create or replace function public.athlete_stats_sync_verification()
returns trigger
language plpgsql
as $$
begin
  if new.is_verified and new.verified_at is null then
    new.verified_at := now();
  elsif not new.is_verified then
    new.verified_at := null;
    new.verified_by := null;
  end if;
  return new;
end;
$$;

create trigger trg_athlete_stats_sync_verification
  before insert or update of is_verified on public.athlete_stats
  for each row execute function public.athlete_stats_sync_verification();
