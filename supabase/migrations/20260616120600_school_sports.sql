-- =====================================================================
-- Athlete Opportunity Engine — 06 School sports programs
-- ---------------------------------------------------------------------
-- A specific sport program offered by a school, at a specific division.
-- This is the true unit a recruit is matched against and carries the
-- roster/scholarship economics consumed by the future scholarship engine.
-- =====================================================================

create table public.school_sports (
  id                        uuid primary key default gen_random_uuid(),
  school_id                 uuid not null references public.schools (id) on delete cascade,
  sport_id                  uuid not null references public.sports (id) on delete restrict,
  division                  public.competition_division not null,
  conference                text,

  -- Program operations
  head_coach_id             uuid references public.coach_profiles (id) on delete set null,
  recruiting_email          text,
  recruiting_phone          text,
  recruiting_url            text,
  is_recruiting_active      boolean not null default true,

  -- Roster & scholarship economics (future scholarship engine)
  roster_size               smallint,
  is_scholarship_sport      boolean not null default true,
  scholarships_total        numeric(6,2),              -- equivalency limit
  scholarships_available    numeric(6,2),
  avg_scholarship_amount    numeric(10,2),

  -- Recruiting needs (PRD §13): open positions and priority by position,
  -- consumed by roster_fit scoring. e.g. {"LB": {"need": 3, "priority": "high"}}
  position_needs            jsonb not null default '{}'::jsonb,
  recruiting_priorities     jsonb not null default '{}'::jsonb,

  -- Recruit benchmarks (used by athletic_fit scoring)
  avg_recruit_gpa           numeric(3,2),
  recruit_benchmarks        jsonb not null default '{}'::jsonb,
  metadata                  jsonb not null default '{}'::jsonb,
  is_active                 boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),

  constraint school_sports_unique unique (school_id, sport_id),
  constraint school_sports_roster
    check (roster_size is null or roster_size between 0 and 500),
  constraint school_sports_scholarships_nonneg
    check (
      (scholarships_total is null or scholarships_total >= 0)
      and (scholarships_available is null or scholarships_available >= 0)
    ),
  constraint school_sports_scholarships_consistent
    check (
      scholarships_total is null
      or scholarships_available is null
      or scholarships_available <= scholarships_total
    ),
  constraint school_sports_avg_gpa
    check (avg_recruit_gpa is null or avg_recruit_gpa between 0 and 5)
);

comment on table public.school_sports is
  'A school''s program for a sport at a division; unit of recruiting & scholarship matching.';
comment on column public.school_sports.scholarships_total is
  'Scholarship equivalency limit for the program; consumed by the scholarship engine.';

create trigger trg_school_sports_updated_at
  before update on public.school_sports
  for each row execute function public.set_updated_at();

-- Guardrail: a program''s division must belong to its school''s association.
create or replace function public.school_sports_validate_division()
returns trigger
language plpgsql
as $$
declare
  v_association public.athletic_association;
begin
  select association into v_association
  from public.schools
  where id = new.school_id;

  if v_association is null then
    raise exception 'school % not found', new.school_id;
  end if;

  if (v_association = 'NCAA'  and new.division not in ('NCAA_DI','NCAA_DII','NCAA_DIII'))
  or (v_association = 'NAIA'  and new.division <> 'NAIA')
  or (v_association = 'NJCAA' and new.division not in ('NJCAA_DI','NJCAA_DII','NJCAA_DIII'))
  then
    raise exception 'division % is not valid for a % institution',
      new.division, v_association;
  end if;

  return new;
end;
$$;

create trigger trg_school_sports_validate_division
  before insert or update of school_id, division on public.school_sports
  for each row execute function public.school_sports_validate_division();
