-- =====================================================================
-- Athlete Opportunity Engine — 09 Opportunity scores
-- ---------------------------------------------------------------------
-- The core output of the matching engine: how good a fit a given school
-- program is for a given athlete. Stores the composite score, its
-- component breakdown, scholarship projection (future scholarship engine)
-- and a machine-readable explanation (future AI agent).
-- =====================================================================

create table public.opportunity_scores (
  id                          uuid primary key default gen_random_uuid(),
  athlete_profile_id          uuid not null references public.athlete_profiles (id) on delete cascade,
  school_id                   uuid not null references public.schools (id) on delete cascade,
  sport_id                    uuid not null references public.sports (id) on delete restrict,
  -- Resolved program (nullable so a score can exist before a program row).
  school_sport_id             uuid references public.school_sports (id) on delete set null,

  -- Composite + component fits, all on a 0..100 scale. Component weights
  -- per PRD §12: athletic 30%, academic 20%, roster 25%, major 10%,
  -- location 10%, program-level 5%. financial_fit is reserved for the
  -- future scholarship engine and excluded from the v1 weighting.
  overall_score               numeric(5,2) not null,
  athletic_fit                numeric(5,2),              -- 30%
  academic_fit                numeric(5,2),              -- 20%
  roster_fit                  numeric(5,2),              -- 25% (roster opportunity)
  major_fit                   numeric(5,2),              -- 10%
  location_fit                numeric(5,2),              -- 10%
  program_level_fit           numeric(5,2),              --  5%
  financial_fit               numeric(5,2),              -- future scholarship engine

  -- PRD §12 score category, derived from overall_score.
  score_band text generated always as (
    case
      when overall_score >= 90 then 'exceptional'
      when overall_score >= 80 then 'strong'
      when overall_score >= 70 then 'good'
      when overall_score >= 60 then 'possible'
      else 'low'
    end
  ) stored,

  match_tier                  public.match_tier,
  confidence                  numeric(5,2),              -- 0..100 model confidence

  -- Future scholarship engine
  scholarship_likelihood      numeric(5,2),              -- 0..100
  projected_scholarship_amount numeric(10,2),

  -- Future AI agent: human-readable + structured rationale.
  explanation                 text,
  factors                     jsonb not null default '{}'::jsonb,

  status                      public.opportunity_status not null default 'computed',
  model_version               text not null default 'v1',
  computed_at                 timestamptz not null default now(),
  expires_at                  timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  -- One current score per (athlete, school, sport). History/versioning is
  -- handled by re-computing & updating this row; archival snapshots, if
  -- needed, belong in a dedicated history table.
  constraint opportunity_scores_unique unique (athlete_profile_id, school_id, sport_id),
  constraint opportunity_scores_overall_range
    check (overall_score between 0 and 100),
  constraint opportunity_scores_components_range check (
    (athletic_fit      is null or athletic_fit      between 0 and 100) and
    (academic_fit      is null or academic_fit      between 0 and 100) and
    (roster_fit        is null or roster_fit        between 0 and 100) and
    (major_fit         is null or major_fit         between 0 and 100) and
    (location_fit      is null or location_fit      between 0 and 100) and
    (program_level_fit is null or program_level_fit between 0 and 100) and
    (financial_fit     is null or financial_fit     between 0 and 100)
  ),
  constraint opportunity_scores_confidence_range
    check (confidence is null or confidence between 0 and 100),
  constraint opportunity_scores_scholarship_range
    check (scholarship_likelihood is null or scholarship_likelihood between 0 and 100),
  constraint opportunity_scores_scholarship_amount_nonneg
    check (projected_scholarship_amount is null or projected_scholarship_amount >= 0)
);

comment on table public.opportunity_scores is
  'Engine output: athlete↔school-program fit with component breakdown, scholarship projection and AI explanation.';
comment on column public.opportunity_scores.factors is
  'Structured rationale (feature contributions) for explainability and AI agents.';

create trigger trg_opportunity_scores_updated_at
  before update on public.opportunity_scores
  for each row execute function public.set_updated_at();
