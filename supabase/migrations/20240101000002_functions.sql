-- Athlete Opportunity Engine — Database Functions
-- Migration: 20240101000002_functions

-- ─── Opportunity score calculation (runs server-side) ─────────────────────────

CREATE OR REPLACE FUNCTION public.calculate_and_store_opportunity_score(
  p_athlete_id    UUID,
  p_school_sport_id UUID
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_athlete       public.athlete_profiles%ROWTYPE;
  v_ss            public.school_sports%ROWTYPE;
  v_school        public.schools%ROWTYPE;
  v_stats_count   INTEGER;
  v_video_count   INTEGER;
  v_athletic      DECIMAL(5,2);
  v_academic      DECIMAL(5,2);
  v_financial     DECIMAL(5,2);
  v_geographic    DECIMAL(5,2);
  v_completeness  DECIMAL(5,2);
  v_overall       DECIMAL(5,2);
  v_rec           recommendation_type;
  v_breakdown     JSONB;
BEGIN
  SELECT * INTO v_athlete FROM public.athlete_profiles WHERE id = p_athlete_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'athlete_not_found: %', p_athlete_id;
  END IF;

  SELECT * INTO v_ss FROM public.school_sports WHERE id = p_school_sport_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'school_sport_not_found: %', p_school_sport_id;
  END IF;

  SELECT * INTO v_school FROM public.schools WHERE id = v_ss.school_id;

  -- ── Athletic fit (0–100) ──────────────────────────────────────────────────
  v_athletic := 45.0;

  IF v_ss.recruiting_active THEN
    v_athletic := v_athletic + 20.0;
  END IF;

  IF v_ss.scholarships_remaining IS NOT NULL AND v_ss.scholarships_remaining > 0 THEN
    v_athletic := v_athletic + LEAST(15.0, v_ss.scholarships_remaining * 3.0);
  END IF;

  IF v_athlete.position IS NOT NULL
     AND v_ss.typical_positions_needed IS NOT NULL
     AND v_athlete.position = ANY(v_ss.typical_positions_needed) THEN
    v_athletic := v_athletic + 15.0;
  END IF;

  IF v_athlete.preferred_divisions IS NOT NULL
     AND v_school.division = ANY(v_athlete.preferred_divisions) THEN
    v_athletic := v_athletic + 5.0;
  END IF;

  v_athletic := GREATEST(0, LEAST(100, v_athletic));

  -- ── Academic fit (0–100) ──────────────────────────────────────────────────
  v_academic := 50.0;

  IF v_athlete.gpa IS NOT NULL AND v_school.avg_gpa IS NOT NULL THEN
    IF v_athlete.gpa >= v_school.avg_gpa THEN
      v_academic := v_academic + 30.0;
    ELSIF v_athlete.gpa >= v_school.avg_gpa - 0.3 THEN
      v_academic := v_academic + 15.0;
    ELSIF v_athlete.gpa >= v_school.avg_gpa - 0.7 THEN
      v_academic := v_academic + 5.0;
    ELSE
      v_academic := v_academic - 20.0;
    END IF;
  END IF;

  IF v_athlete.sat_score IS NOT NULL AND v_school.avg_sat IS NOT NULL THEN
    IF v_athlete.sat_score >= v_school.avg_sat THEN
      v_academic := v_academic + 10.0;
    ELSIF v_athlete.sat_score >= v_school.avg_sat - 100 THEN
      v_academic := v_academic + 5.0;
    ELSE
      v_academic := v_academic - 5.0;
    END IF;
  ELSIF v_athlete.act_score IS NOT NULL AND v_school.avg_act IS NOT NULL THEN
    IF v_athlete.act_score >= v_school.avg_act THEN
      v_academic := v_academic + 10.0;
    ELSIF v_athlete.act_score >= v_school.avg_act - 3 THEN
      v_academic := v_academic + 5.0;
    ELSE
      v_academic := v_academic - 5.0;
    END IF;
  END IF;

  -- Hard cutoff: if athlete is below minimum GPA requirement score is 0
  IF v_ss.min_gpa IS NOT NULL AND v_athlete.gpa IS NOT NULL AND v_athlete.gpa < v_ss.min_gpa THEN
    v_academic := 0.0;
  END IF;
  IF v_ss.min_sat IS NOT NULL AND v_athlete.sat_score IS NOT NULL AND v_athlete.sat_score < v_ss.min_sat THEN
    v_academic := 0.0;
  END IF;

  v_academic := GREATEST(0, LEAST(100, v_academic));

  -- ── Financial fit (0–100) ─────────────────────────────────────────────────
  v_financial := CASE v_school.division
    WHEN 'NCAA_D1'  THEN 75.0
    WHEN 'NCAA_D2'  THEN 70.0
    WHEN 'NCAA_D3'  THEN 55.0
    WHEN 'NAIA'     THEN 65.0
    WHEN 'JUCO'     THEN 85.0
    WHEN 'NJCAA'    THEN 88.0
    ELSE 60.0
  END;

  IF v_ss.scholarships_remaining IS NOT NULL AND v_ss.scholarships_remaining > 2 THEN
    v_financial := v_financial + 12.0;
  ELSIF v_ss.scholarships_remaining IS NOT NULL AND v_ss.scholarships_remaining = 1 THEN
    v_financial := v_financial + 5.0;
  END IF;

  v_financial := GREATEST(0, LEAST(100, v_financial));

  -- ── Geographic fit (0–100) ────────────────────────────────────────────────
  v_geographic := 55.0;

  IF v_athlete.preferred_states IS NOT NULL AND v_school.state = ANY(v_athlete.preferred_states) THEN
    v_geographic := 100.0;
  ELSIF v_athlete.state IS NOT NULL AND v_athlete.state = v_school.state THEN
    v_geographic := 85.0;
  END IF;

  -- ── Profile completeness (0–100) ─────────────────────────────────────────
  SELECT COUNT(*) INTO v_stats_count FROM public.athlete_stats WHERE athlete_id = p_athlete_id;
  SELECT COUNT(*) INTO v_video_count FROM public.videos WHERE athlete_id = p_athlete_id;

  v_completeness := 0.0;
  IF v_athlete.bio IS NOT NULL AND char_length(v_athlete.bio) > 50 THEN
    v_completeness := v_completeness + 20.0;
  END IF;
  IF v_athlete.gpa IS NOT NULL THEN
    v_completeness := v_completeness + 15.0;
  END IF;
  IF v_athlete.height_inches IS NOT NULL AND v_athlete.weight_lbs IS NOT NULL THEN
    v_completeness := v_completeness + 10.0;
  END IF;
  IF v_athlete.profile_image_url IS NOT NULL THEN
    v_completeness := v_completeness + 5.0;
  END IF;
  IF v_stats_count >= 5 THEN
    v_completeness := v_completeness + 25.0;
  ELSIF v_stats_count > 0 THEN
    v_completeness := v_completeness + (v_stats_count * 5.0);
  END IF;
  IF v_video_count >= 2 THEN
    v_completeness := v_completeness + 25.0;
  ELSIF v_video_count = 1 THEN
    v_completeness := v_completeness + 12.0;
  END IF;

  v_completeness := GREATEST(0, LEAST(100, v_completeness));

  -- ── Weighted overall ──────────────────────────────────────────────────────
  v_overall := ROUND(
    v_athletic    * 0.40 +
    v_academic    * 0.25 +
    v_financial   * 0.20 +
    v_geographic  * 0.10 +
    v_completeness * 0.05,
    2
  );

  v_rec := CASE
    WHEN v_overall >= 80 THEN 'strong_match'::recommendation_type
    WHEN v_overall >= 65 THEN 'good_match'::recommendation_type
    WHEN v_overall >= 50 THEN 'possible_match'::recommendation_type
    WHEN v_overall >= 35 THEN 'reach'::recommendation_type
    ELSE                      'unlikely'::recommendation_type
  END;

  v_breakdown := jsonb_build_object(
    'athletic_fit',          v_athletic,
    'academic_fit',          v_academic,
    'financial_fit',         v_financial,
    'geographic_fit',        v_geographic,
    'profile_completeness',  v_completeness,
    'weights', jsonb_build_object(
      'athletic_fit',         0.40,
      'academic_fit',         0.25,
      'financial_fit',        0.20,
      'geographic_fit',       0.10,
      'profile_completeness', 0.05
    ),
    'inputs', jsonb_build_object(
      'athlete_gpa',               v_athlete.gpa,
      'athlete_sat',               v_athlete.sat_score,
      'athlete_act',               v_athlete.act_score,
      'athlete_sport',             v_athlete.sport,
      'athlete_position',          v_athlete.position,
      'school_avg_gpa',            v_school.avg_gpa,
      'school_avg_sat',            v_school.avg_sat,
      'school_division',           v_school.division,
      'scholarships_remaining',    v_ss.scholarships_remaining,
      'recruiting_active',         v_ss.recruiting_active,
      'stats_on_file',             v_stats_count,
      'videos_on_file',            v_video_count
    )
  );

  INSERT INTO public.opportunity_scores (
    athlete_id,
    school_sport_id,
    overall_score,
    athletic_fit_score,
    academic_fit_score,
    financial_fit_score,
    geographic_fit_score,
    profile_completeness_score,
    score_breakdown,
    recommendation,
    calculated_at
  ) VALUES (
    p_athlete_id,
    p_school_sport_id,
    v_overall,
    v_athletic,
    v_academic,
    v_financial,
    v_geographic,
    v_completeness,
    v_breakdown,
    v_rec,
    NOW()
  )
  ON CONFLICT (athlete_id, school_sport_id) DO UPDATE SET
    overall_score              = EXCLUDED.overall_score,
    athletic_fit_score         = EXCLUDED.athletic_fit_score,
    academic_fit_score         = EXCLUDED.academic_fit_score,
    financial_fit_score        = EXCLUDED.financial_fit_score,
    geographic_fit_score       = EXCLUDED.geographic_fit_score,
    profile_completeness_score = EXCLUDED.profile_completeness_score,
    score_breakdown            = EXCLUDED.score_breakdown,
    recommendation             = EXCLUDED.recommendation,
    calculated_at              = NOW();

  RETURN jsonb_build_object(
    'overall_score',              v_overall,
    'athletic_fit_score',         v_athletic,
    'academic_fit_score',         v_academic,
    'financial_fit_score',        v_financial,
    'geographic_fit_score',       v_geographic,
    'profile_completeness_score', v_completeness,
    'recommendation',             v_rec,
    'breakdown',                  v_breakdown
  );
END;
$$;

-- ─── Batch score: athlete vs all matching school sports ───────────────────────

CREATE OR REPLACE FUNCTION public.score_athlete_all_schools(p_athlete_id UUID)
RETURNS TABLE (
  school_sport_id   UUID,
  school_name       TEXT,
  sport             TEXT,
  division          division_type,
  overall_score     DECIMAL(5,2),
  recommendation    recommendation_type
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_athlete public.athlete_profiles%ROWTYPE;
  v_row     public.school_sports%ROWTYPE;
  v_result  JSONB;
BEGIN
  SELECT * INTO v_athlete FROM public.athlete_profiles WHERE id = p_athlete_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'athlete_not_found: %', p_athlete_id;
  END IF;

  FOR v_row IN
    SELECT ss.*
    FROM public.school_sports ss
    WHERE ss.sport = v_athlete.sport
      AND ss.recruiting_active = TRUE
  LOOP
    BEGIN
      v_result := public.calculate_and_store_opportunity_score(p_athlete_id, v_row.id);

      RETURN QUERY
        SELECT
          v_row.id                              AS school_sport_id,
          (SELECT s.name FROM public.schools s WHERE s.id = v_row.school_id) AS school_name,
          v_row.sport                           AS sport,
          (SELECT s.division FROM public.schools s WHERE s.id = v_row.school_id) AS division,
          (v_result->>'overall_score')::DECIMAL(5,2) AS overall_score,
          (v_result->>'recommendation')::recommendation_type AS recommendation;
    EXCEPTION WHEN OTHERS THEN
      -- Skip schools that error and continue
      NULL;
    END;
  END LOOP;
END;
$$;
