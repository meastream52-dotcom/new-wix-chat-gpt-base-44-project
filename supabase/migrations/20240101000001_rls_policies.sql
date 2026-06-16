-- Athlete Opportunity Engine — Row Level Security Policies
-- Migration: 20240101000001_rls_policies

-- Enable RLS on every table
ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_sports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_stats        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_scores   ENABLE ROW LEVEL SECURITY;

-- ─── Helper functions ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_athlete_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT id FROM public.athlete_profiles WHERE user_id = auth.uid();
$$;

-- ─── users ────────────────────────────────────────────────────────────────────

CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.users WHERE id = auth.uid()));

CREATE POLICY "users_admin_all"
  ON public.users FOR ALL
  USING (public.is_admin());

-- ─── athlete_profiles ─────────────────────────────────────────────────────────

CREATE POLICY "athletes_manage_own_profile"
  ON public.athlete_profiles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athletes_insert_own_profile"
  ON public.athlete_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "coaches_view_athlete_profiles"
  ON public.athlete_profiles FOR SELECT
  USING (
    public.get_my_role() IN ('coach', 'school_admin', 'admin')
  );

CREATE POLICY "parents_view_linked_athlete"
  ON public.athlete_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_profiles
      WHERE user_id = auth.uid()
        AND athlete_id = athlete_profiles.id
    )
  );

-- ─── parent_profiles ──────────────────────────────────────────────────────────

CREATE POLICY "parents_manage_own"
  ON public.parent_profiles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athletes_view_own_parent"
  ON public.parent_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE user_id = auth.uid()
        AND id = parent_profiles.athlete_id
    )
  );

CREATE POLICY "admin_all_parent_profiles"
  ON public.parent_profiles FOR ALL
  USING (public.is_admin());

-- ─── coach_profiles ───────────────────────────────────────────────────────────

CREATE POLICY "coaches_manage_own"
  ON public.coach_profiles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athletes_parents_view_coaches"
  ON public.coach_profiles FOR SELECT
  USING (
    public.get_my_role() IN ('athlete', 'parent', 'school_admin', 'admin')
  );

CREATE POLICY "admin_all_coach_profiles"
  ON public.coach_profiles FOR ALL
  USING (public.is_admin());

-- ─── schools (public read, admin write) ───────────────────────────────────────

CREATE POLICY "anyone_view_schools"
  ON public.schools FOR SELECT
  USING (TRUE);

CREATE POLICY "admin_manage_schools"
  ON public.schools FOR ALL
  USING (public.is_admin());

-- ─── school_sports (public read, school admin / admin write) ──────────────────

CREATE POLICY "anyone_view_school_sports"
  ON public.school_sports FOR SELECT
  USING (TRUE);

CREATE POLICY "school_coaches_manage_sports"
  ON public.school_sports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_profiles
      WHERE user_id = auth.uid()
        AND school_id = school_sports.school_id
    ) OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coach_profiles
      WHERE user_id = auth.uid()
        AND school_id = school_sports.school_id
    ) OR public.is_admin()
  );

-- ─── athlete_stats ────────────────────────────────────────────────────────────

CREATE POLICY "athletes_manage_own_stats"
  ON public.athlete_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = athlete_stats.athlete_id
        AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = athlete_stats.athlete_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "coaches_view_stats"
  ON public.athlete_stats FOR SELECT
  USING (
    public.get_my_role() IN ('coach', 'school_admin', 'admin')
  );

CREATE POLICY "parents_view_linked_stats"
  ON public.athlete_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_profiles pp
      WHERE pp.user_id = auth.uid()
        AND pp.athlete_id = athlete_stats.athlete_id
    )
  );

-- ─── videos ───────────────────────────────────────────────────────────────────

CREATE POLICY "athletes_manage_own_videos"
  ON public.videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = videos.athlete_id
        AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = videos.athlete_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "coaches_view_videos"
  ON public.videos FOR SELECT
  USING (
    public.get_my_role() IN ('coach', 'school_admin', 'admin')
  );

CREATE POLICY "parents_view_linked_videos"
  ON public.videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_profiles pp
      WHERE pp.user_id = auth.uid()
        AND pp.athlete_id = videos.athlete_id
    )
  );

-- ─── opportunity_scores ───────────────────────────────────────────────────────

CREATE POLICY "athletes_view_own_scores"
  ON public.opportunity_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = opportunity_scores.athlete_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "parents_view_linked_scores"
  ON public.opportunity_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_profiles pp
      WHERE pp.user_id = auth.uid()
        AND pp.athlete_id = opportunity_scores.athlete_id
    )
  );

CREATE POLICY "athletes_upsert_own_scores"
  ON public.opportunity_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = opportunity_scores.athlete_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "athletes_update_own_scores"
  ON public.opportunity_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.athlete_profiles
      WHERE id = opportunity_scores.athlete_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "admin_all_scores"
  ON public.opportunity_scores FOR ALL
  USING (public.is_admin());
