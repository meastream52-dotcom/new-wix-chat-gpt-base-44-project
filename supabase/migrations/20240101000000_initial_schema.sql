-- Athlete Opportunity Engine — Initial Schema
-- Migration: 20240101000000_initial_schema

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Enum types ───────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'athlete',
  'parent',
  'coach',
  'school_admin',
  'admin'
);

CREATE TYPE division_type AS ENUM (
  'NCAA_D1',
  'NCAA_D2',
  'NCAA_D3',
  'NAIA',
  'JUCO',
  'NJCAA'
);

CREATE TYPE gender_type AS ENUM ('M', 'F', 'COED');

CREATE TYPE video_platform AS ENUM ('youtube', 'hudl', 'vimeo', 'other');

CREATE TYPE highlight_type AS ENUM (
  'highlight_reel',
  'game_film',
  'skill',
  'interview'
);

CREATE TYPE recommendation_type AS ENUM (
  'strong_match',
  'good_match',
  'possible_match',
  'reach',
  'unlikely'
);

-- ─── Users (mirrors auth.users) ───────────────────────────────────────────────

CREATE TABLE public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        UNIQUE NOT NULL,
  role        user_role   NOT NULL DEFAULT 'athlete',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Athlete profiles ─────────────────────────────────────────────────────────

CREATE TABLE public.athlete_profiles (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  first_name          TEXT        NOT NULL,
  last_name           TEXT        NOT NULL,
  date_of_birth       DATE,
  graduation_year     INTEGER     NOT NULL,
  sport               TEXT        NOT NULL,
  position            TEXT,
  height_inches       INTEGER     CHECK (height_inches BETWEEN 48 AND 96),
  weight_lbs          INTEGER     CHECK (weight_lbs BETWEEN 80 AND 400),
  gpa                 DECIMAL(3,2) CHECK (gpa BETWEEN 0.00 AND 4.00),
  sat_score           INTEGER     CHECK (sat_score BETWEEN 400 AND 1600),
  act_score           INTEGER     CHECK (act_score BETWEEN 1 AND 36),
  state               TEXT,
  city                TEXT,
  bio                 TEXT,
  profile_image_url   TEXT,
  twitter_handle      TEXT,
  instagram_handle    TEXT,
  preferred_divisions division_type[],
  preferred_states    TEXT[],
  intended_major      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ─── Parent profiles ──────────────────────────────────────────────────────────

CREATE TABLE public.parent_profiles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  athlete_id   UUID        REFERENCES public.athlete_profiles(id) ON DELETE SET NULL,
  first_name   TEXT        NOT NULL,
  last_name    TEXT        NOT NULL,
  phone        TEXT,
  relationship TEXT        NOT NULL DEFAULT 'parent'
                           CHECK (relationship IN ('parent', 'guardian', 'other')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ─── Schools ──────────────────────────────────────────────────────────────────

CREATE TABLE public.schools (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT          NOT NULL,
  slug                 TEXT          UNIQUE NOT NULL,
  division             division_type NOT NULL,
  conference           TEXT,
  state                TEXT          NOT NULL,
  city                 TEXT          NOT NULL,
  website_url          TEXT,
  logo_url             TEXT,
  enrollment           INTEGER,
  endowment_millions   DECIMAL(10,2),
  acceptance_rate      DECIMAL(5,2)  CHECK (acceptance_rate BETWEEN 0 AND 100),
  avg_gpa              DECIMAL(3,2)  CHECK (avg_gpa BETWEEN 0.00 AND 4.00),
  avg_sat              INTEGER       CHECK (avg_sat BETWEEN 400 AND 1600),
  avg_act              INTEGER       CHECK (avg_act BETWEEN 1 AND 36),
  tuition_in_state     INTEGER,
  tuition_out_state    INTEGER,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── Coach profiles ───────────────────────────────────────────────────────────

CREATE TABLE public.coach_profiles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  school_id   UUID        REFERENCES public.schools(id) ON DELETE SET NULL,
  first_name  TEXT        NOT NULL,
  last_name   TEXT        NOT NULL,
  sport       TEXT        NOT NULL,
  title       TEXT,
  phone       TEXT,
  verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ─── School sports programs ───────────────────────────────────────────────────

CREATE TABLE public.school_sports (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id                 UUID          NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sport                     TEXT          NOT NULL,
  gender                    gender_type   NOT NULL DEFAULT 'M',
  scholarships_total        INTEGER,
  scholarships_remaining    INTEGER,
  head_coach_name           TEXT,
  head_coach_email          TEXT,
  roster_size               INTEGER,
  typical_positions_needed  TEXT[],
  min_gpa                   DECIMAL(3,2),
  min_sat                   INTEGER,
  min_act                   INTEGER,
  recruiting_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, sport, gender)
);

-- ─── Athlete stats ────────────────────────────────────────────────────────────

CREATE TABLE public.athlete_stats (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  UUID        NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  season      TEXT        NOT NULL,
  sport       TEXT        NOT NULL,
  stat_key    TEXT        NOT NULL,
  stat_value  DECIMAL(10,3) NOT NULL,
  unit        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, season, sport, stat_key)
);

-- ─── Videos ───────────────────────────────────────────────────────────────────

CREATE TABLE public.videos (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id       UUID           NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  title            TEXT           NOT NULL,
  url              TEXT           NOT NULL,
  platform         video_platform NOT NULL DEFAULT 'youtube',
  duration_seconds INTEGER,
  highlight_type   highlight_type NOT NULL DEFAULT 'highlight_reel',
  is_primary       BOOLEAN        NOT NULL DEFAULT FALSE,
  views            INTEGER        NOT NULL DEFAULT 0,
  thumbnail_url    TEXT,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ─── Opportunity scores ───────────────────────────────────────────────────────

CREATE TABLE public.opportunity_scores (
  id                        UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id                UUID                NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  school_sport_id           UUID                NOT NULL REFERENCES public.school_sports(id) ON DELETE CASCADE,
  overall_score             DECIMAL(5,2)        NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  athletic_fit_score        DECIMAL(5,2)        CHECK (athletic_fit_score BETWEEN 0 AND 100),
  academic_fit_score        DECIMAL(5,2)        CHECK (academic_fit_score BETWEEN 0 AND 100),
  financial_fit_score       DECIMAL(5,2)        CHECK (financial_fit_score BETWEEN 0 AND 100),
  geographic_fit_score      DECIMAL(5,2)        CHECK (geographic_fit_score BETWEEN 0 AND 100),
  profile_completeness_score DECIMAL(5,2)       CHECK (profile_completeness_score BETWEEN 0 AND 100),
  score_breakdown           JSONB,
  recommendation            recommendation_type NOT NULL,
  calculated_at             TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  UNIQUE (athlete_id, school_sport_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_athlete_profiles_user_id        ON public.athlete_profiles(user_id);
CREATE INDEX idx_athlete_profiles_sport          ON public.athlete_profiles(sport);
CREATE INDEX idx_athlete_profiles_graduation_year ON public.athlete_profiles(graduation_year);
CREATE INDEX idx_athlete_profiles_state          ON public.athlete_profiles(state);
CREATE INDEX idx_parent_profiles_user_id         ON public.parent_profiles(user_id);
CREATE INDEX idx_parent_profiles_athlete_id      ON public.parent_profiles(athlete_id);
CREATE INDEX idx_coach_profiles_school_id        ON public.coach_profiles(school_id);
CREATE INDEX idx_schools_division                ON public.schools(division);
CREATE INDEX idx_schools_state                   ON public.schools(state);
CREATE INDEX idx_school_sports_school_id         ON public.school_sports(school_id);
CREATE INDEX idx_school_sports_sport             ON public.school_sports(sport);
CREATE INDEX idx_school_sports_recruiting        ON public.school_sports(recruiting_active) WHERE recruiting_active = TRUE;
CREATE INDEX idx_athlete_stats_athlete_id        ON public.athlete_stats(athlete_id);
CREATE INDEX idx_athlete_stats_season_sport      ON public.athlete_stats(athlete_id, season, sport);
CREATE INDEX idx_videos_athlete_id               ON public.videos(athlete_id);
CREATE INDEX idx_videos_primary                  ON public.videos(athlete_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_opportunity_scores_athlete_id   ON public.opportunity_scores(athlete_id);
CREATE INDEX idx_opportunity_scores_school_sport ON public.opportunity_scores(school_sport_id);
CREATE INDEX idx_opportunity_scores_overall      ON public.opportunity_scores(overall_score DESC);

-- Full-text search on schools
CREATE INDEX idx_schools_name_trgm ON public.schools USING gin(name gin_trgm_ops);

-- ─── Triggers: updated_at ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER athlete_profiles_updated_at
  BEFORE UPDATE ON public.athlete_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER parent_profiles_updated_at
  BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER coach_profiles_updated_at
  BEFORE UPDATE ON public.coach_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER school_sports_updated_at
  BEFORE UPDATE ON public.school_sports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Trigger: auto-create user row on auth signup ─────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'athlete')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
