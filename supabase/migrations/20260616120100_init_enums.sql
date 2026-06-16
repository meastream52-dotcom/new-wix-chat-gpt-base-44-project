-- =====================================================================
-- Athlete Opportunity Engine — 01 Enumerated types
-- ---------------------------------------------------------------------
-- Strongly-typed domains used across the schema. Enums are preferred over
-- free-text CHECKs where the value set is small, stable and shared by
-- multiple tables, giving us type safety end-to-end (DB → API → client).
-- New values can be appended later with `ALTER TYPE ... ADD VALUE`.
-- =====================================================================

-- Top-level account role. Drives RLS and UI routing.
create type public.user_role as enum (
  'athlete',
  'parent',
  'coach',
  'admin'
);

-- Self-described gender identity (separate from the competition category
-- of a sport, which lives in public.sport_gender_category).
create type public.gender as enum (
  'male',
  'female',
  'nonbinary',
  'prefer_not_to_say'
);

-- Governing athletic associations supported at launch.
create type public.athletic_association as enum (
  'NCAA',
  'NAIA',
  'NJCAA'
);

-- Concrete competition division. Encodes association + division so a
-- single value is unambiguous across the multi-association architecture.
create type public.competition_division as enum (
  'NCAA_DI',
  'NCAA_DII',
  'NCAA_DIII',
  'NAIA',
  'NJCAA_DI',
  'NJCAA_DII',
  'NJCAA_DIII'
);

-- Gender category a sport program competes in.
create type public.sport_gender_category as enum (
  'mens',
  'womens',
  'coed'
);

-- Primary competitive season for a sport.
create type public.sport_season as enum (
  'fall',
  'winter',
  'spring',
  'year_round'
);

-- Institution governance/funding model.
create type public.school_type as enum (
  'public',
  'private',
  'community',
  'tribal',
  'military'
);

-- Guardian relationship to an athlete.
create type public.guardian_relationship as enum (
  'mother',
  'father',
  'stepparent',
  'grandparent',
  'legal_guardian',
  'sibling',
  'other'
);

-- Where an athlete is in the recruiting lifecycle.
create type public.athlete_recruiting_status as enum (
  'exploring',
  'actively_recruiting',
  'committed',
  'signed',
  'enrolled',
  'inactive'
);

-- Who an athlete profile is visible to.
create type public.profile_visibility as enum (
  'public',
  'recruiters_only',
  'connections_only',
  'private'
);

-- Type/level of a coach account.
create type public.coach_type as enum (
  'high_school',
  'club',
  'college',
  'private_trainer'
);

-- Provenance / trust level of a recorded stat.
create type public.stat_source as enum (
  'self_reported',
  'parent_reported',
  'coach_verified',
  'event_timed',
  'third_party',
  'imported'
);

-- Category of an uploaded video.
create type public.video_type as enum (
  'highlight',
  'full_game',
  'skills_session',
  'training',
  'interview',
  'combine'
);

-- Lifecycle of an uploaded video asset.
create type public.video_status as enum (
  'uploading',
  'processing',
  'ready',
  'failed',
  'archived'
);

-- Recruiting fit bucket for an opportunity score.
create type public.match_tier as enum (
  'high_reach',
  'reach',
  'target',
  'likely',
  'safety'
);

-- Lifecycle of a computed opportunity score row.
create type public.opportunity_status as enum (
  'draft',
  'computed',
  'stale',
  'archived'
);
