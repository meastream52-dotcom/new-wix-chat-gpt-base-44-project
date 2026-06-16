-- =====================================================================
-- Athlete Opportunity Engine — 10 Indexes
-- ---------------------------------------------------------------------
-- Index strategy:
--   * Every foreign key has a supporting btree index (except where a
--     composite UNIQUE already leads with that column).
--   * Composite indexes target the hot read paths (ranking scores,
--     stat lookups, program search).
--   * Partial indexes keep "active/public" working sets small.
--   * GIN (trgm) powers fuzzy name search; GIN (jsonb/array) powers
--     attribute filters; HNSW (pgvector) powers AI/semantic retrieval.
-- =====================================================================

-- ---------- users ----------
create index idx_users_role on public.users (role);
create index idx_users_active on public.users (id) where is_active;

-- ---------- sports ----------
create index idx_sports_active on public.sports (sort_order) where is_active;
create index idx_sports_gender_season on public.sports (gender_category, season);

-- ---------- schools ----------
create index idx_schools_association on public.schools (association);
create index idx_schools_state on public.schools (state);
create index idx_schools_conference on public.schools (conference);
create index idx_schools_active on public.schools (id) where is_active;
create index idx_schools_name_trgm
  on public.schools using gin (name extensions.gin_trgm_ops);
create index idx_schools_metadata
  on public.schools using gin (metadata jsonb_path_ops);
create index idx_schools_offered_majors
  on public.schools using gin (offered_majors);
create index idx_schools_embedding
  on public.schools using hnsw (embedding extensions.vector_cosine_ops);

-- ---------- athlete_profiles ----------
create index idx_athlete_profiles_committed_school on public.athlete_profiles (committed_school_id);
create index idx_athlete_profiles_grad_year on public.athlete_profiles (graduation_year);
create index idx_athlete_profiles_recruiting_status on public.athlete_profiles (recruiting_status);
create index idx_athlete_profiles_visibility on public.athlete_profiles (visibility);
create index idx_athlete_profiles_home_state on public.athlete_profiles (home_state);
create index idx_athlete_profiles_preferences
  on public.athlete_profiles using gin (preferences jsonb_path_ops);
create index idx_athlete_profiles_embedding
  on public.athlete_profiles using hnsw (embedding extensions.vector_cosine_ops);

-- ---------- coach_profiles ----------
create index idx_coach_profiles_school on public.coach_profiles (school_id);
create index idx_coach_profiles_sport on public.coach_profiles (primary_sport_id);
create index idx_coach_profiles_verified on public.coach_profiles (id) where is_verified;

-- ---------- athlete_sports ----------
-- (athlete_profile_id leads the UNIQUE index, so athlete lookups are covered.)
create index idx_athlete_sports_sport on public.athlete_sports (sport_id);

-- ---------- athlete_guardians ----------
-- (athlete_profile_id leads the UNIQUE index.)
create index idx_athlete_guardians_parent on public.athlete_guardians (parent_profile_id);

-- ---------- school_sports ----------
-- (school_id leads the UNIQUE index.)
create index idx_school_sports_sport on public.school_sports (sport_id);
create index idx_school_sports_sport_division on public.school_sports (sport_id, division);
create index idx_school_sports_division on public.school_sports (division);
create index idx_school_sports_head_coach on public.school_sports (head_coach_id);
create index idx_school_sports_recruiting
  on public.school_sports (sport_id, division)
  where is_recruiting_active and is_active;
create index idx_school_sports_position_needs
  on public.school_sports using gin (position_needs jsonb_path_ops);

-- ---------- athlete_stats ----------
create index idx_athlete_stats_athlete_sport_metric
  on public.athlete_stats (athlete_profile_id, sport_id, metric_key);
create index idx_athlete_stats_benchmark
  on public.athlete_stats (sport_id, metric_key, metric_value);
create index idx_athlete_stats_verified
  on public.athlete_stats (athlete_profile_id) where is_verified;

-- ---------- videos ----------
create index idx_videos_athlete on public.videos (athlete_profile_id);
create index idx_videos_sport on public.videos (sport_id);
create index idx_videos_status on public.videos (status);
create index idx_videos_public_ready
  on public.videos (athlete_profile_id)
  where is_public and status = 'ready';
create index idx_videos_ai_tags on public.videos using gin (ai_tags);
create index idx_videos_embedding
  on public.videos using hnsw (embedding extensions.vector_cosine_ops);

-- ---------- opportunity_scores ----------
create index idx_opportunity_scores_school on public.opportunity_scores (school_id);
create index idx_opportunity_scores_sport on public.opportunity_scores (sport_id);
create index idx_opportunity_scores_school_sport on public.opportunity_scores (school_sport_id);
-- Rank an athlete's opportunities by score (primary dashboard query).
create index idx_opportunity_scores_athlete_rank
  on public.opportunity_scores (athlete_profile_id, overall_score desc);
-- Find the strongest-fit athletes for a school program (recruiter view).
create index idx_opportunity_scores_school_rank
  on public.opportunity_scores (school_id, sport_id, overall_score desc);
create index idx_opportunity_scores_tier on public.opportunity_scores (match_tier);
create index idx_opportunity_scores_band on public.opportunity_scores (score_band);
create index idx_opportunity_scores_stale
  on public.opportunity_scores (expires_at)
  where status = 'computed' and expires_at is not null;
create index idx_opportunity_scores_factors
  on public.opportunity_scores using gin (factors jsonb_path_ops);
