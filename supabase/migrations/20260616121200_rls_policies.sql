-- =====================================================================
-- Athlete Opportunity Engine — 12 Row Level Security
-- ---------------------------------------------------------------------
-- RLS is enabled on every table in public. Authorization model:
--   * service_role bypasses RLS (the engine/back-office writes freely).
--   * Admins (JWT app_metadata.role = 'admin') have full access.
--   * Athletes own their profile graph; guardians (can_manage) share it.
--   * Coaches can read athletes per the athlete's visibility setting.
--   * Reference data (sports/schools/programs) is world-readable.
-- Helper functions are SECURITY DEFINER (owned by the migration role, so
-- they read past RLS) which keeps policies simple and non-recursive.
-- =====================================================================

-- =====================  Authorization helpers  =======================

-- Role embedded in the JWT (app_metadata.role), falling back to 'anon'.
create or replace function public.jwt_role()
returns text
language sql
stable
set search_path = public, pg_temp
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role', ''),
    nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', ''),
    'anon'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select public.jwt_role() = 'admin';
$$;

-- The athlete_profile id owned by the current user (NULL if not athlete).
create or replace function public.current_athlete_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select ap.id from public.athlete_profiles ap where ap.user_id = auth.uid();
$$;

-- Is the current user a guardian (any) of the given athlete?
create or replace function public.is_guardian_of(p_athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.athlete_guardians ag
    join public.parent_profiles pp on pp.id = ag.parent_profile_id
    where ag.athlete_profile_id = p_athlete
      and pp.user_id = auth.uid()
  );
$$;

-- May the current user manage (write) the given athlete's data?
create or replace function public.can_manage_athlete(p_athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.athlete_profiles ap
      where ap.id = p_athlete and ap.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.athlete_guardians ag
      join public.parent_profiles pp on pp.id = ag.parent_profile_id
      where ag.athlete_profile_id = p_athlete
        and pp.user_id = auth.uid()
        and ag.can_manage
    );
$$;

-- May the current user view the given athlete (respecting visibility)?
create or replace function public.can_view_athlete(p_athlete uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    public.can_manage_athlete(p_athlete)
    or public.is_guardian_of(p_athlete)
    or exists (
      select 1 from public.athlete_profiles ap
      where ap.id = p_athlete
        and (
          ap.visibility = 'public'
          or (ap.visibility = 'recruiters_only' and public.jwt_role() = 'coach')
        )
    );
$$;

-- =====================  Enable RLS everywhere  =======================
alter table public.users              enable row level security;
alter table public.sports             enable row level security;
alter table public.schools            enable row level security;
alter table public.school_sports      enable row level security;
alter table public.athlete_profiles   enable row level security;
alter table public.parent_profiles    enable row level security;
alter table public.coach_profiles     enable row level security;
alter table public.athlete_sports     enable row level security;
alter table public.athlete_guardians  enable row level security;
alter table public.athlete_stats      enable row level security;
alter table public.videos             enable row level security;
alter table public.opportunity_scores enable row level security;

-- ===========================  users  =================================
create policy users_select on public.users
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy users_update on public.users
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy users_insert on public.users
  for insert to authenticated
  with check (public.is_admin());

create policy users_delete on public.users
  for delete to authenticated
  using (public.is_admin());

-- ===========================  sports  ================================
create policy sports_read on public.sports
  for select to anon, authenticated
  using (true);

create policy sports_write on public.sports
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ===========================  schools  ===============================
create policy schools_read on public.schools
  for select to anon, authenticated
  using (true);

create policy schools_write on public.schools
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =========================  school_sports  ===========================
create policy school_sports_read on public.school_sports
  for select to anon, authenticated
  using (true);

-- Admins, or the program's head coach, may modify the program.
create policy school_sports_write on public.school_sports
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.coach_profiles cp
      where cp.id = school_sports.head_coach_id
        and cp.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.coach_profiles cp
      where cp.id = school_sports.head_coach_id
        and cp.user_id = auth.uid()
    )
  );

-- ========================  athlete_profiles  =========================
create policy athlete_profiles_select on public.athlete_profiles
  for select to authenticated
  using (public.can_view_athlete(id));

create policy athlete_profiles_insert on public.athlete_profiles
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy athlete_profiles_update on public.athlete_profiles
  for update to authenticated
  using (public.can_manage_athlete(id))
  with check (public.can_manage_athlete(id));

create policy athlete_profiles_delete on public.athlete_profiles
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- =========================  parent_profiles  =========================
create policy parent_profiles_select on public.parent_profiles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy parent_profiles_insert on public.parent_profiles
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy parent_profiles_update on public.parent_profiles
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy parent_profiles_delete on public.parent_profiles
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- =========================  coach_profiles  ==========================
-- Coach directory is readable by authenticated users (recruiting UX).
create policy coach_profiles_select on public.coach_profiles
  for select to authenticated
  using (true);

create policy coach_profiles_insert on public.coach_profiles
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy coach_profiles_update on public.coach_profiles
  for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy coach_profiles_delete on public.coach_profiles
  for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- =========================  athlete_sports  ==========================
create policy athlete_sports_select on public.athlete_sports
  for select to authenticated
  using (public.can_view_athlete(athlete_profile_id));

create policy athlete_sports_modify on public.athlete_sports
  for all to authenticated
  using (public.can_manage_athlete(athlete_profile_id))
  with check (public.can_manage_athlete(athlete_profile_id));

-- ========================  athlete_guardians  ========================
create policy athlete_guardians_select on public.athlete_guardians
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.athlete_profiles ap
      where ap.id = athlete_guardians.athlete_profile_id
        and ap.user_id = auth.uid()
    )
    or exists (
      select 1 from public.parent_profiles pp
      where pp.id = athlete_guardians.parent_profile_id
        and pp.user_id = auth.uid()
    )
  );

create policy athlete_guardians_insert on public.athlete_guardians
  for insert to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.athlete_profiles ap
      where ap.id = athlete_guardians.athlete_profile_id
        and ap.user_id = auth.uid()
    )
    or exists (
      select 1 from public.parent_profiles pp
      where pp.id = athlete_guardians.parent_profile_id
        and pp.user_id = auth.uid()
    )
  );

create policy athlete_guardians_delete on public.athlete_guardians
  for delete to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.athlete_profiles ap
      where ap.id = athlete_guardians.athlete_profile_id
        and ap.user_id = auth.uid()
    )
    or exists (
      select 1 from public.parent_profiles pp
      where pp.id = athlete_guardians.parent_profile_id
        and pp.user_id = auth.uid()
    )
  );

create policy athlete_guardians_update on public.athlete_guardians
  for update to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.athlete_profiles ap
      where ap.id = athlete_guardians.athlete_profile_id
        and ap.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.athlete_profiles ap
      where ap.id = athlete_guardians.athlete_profile_id
        and ap.user_id = auth.uid()
    )
  );

-- ==========================  athlete_stats  ==========================
create policy athlete_stats_select on public.athlete_stats
  for select to authenticated
  using (public.can_view_athlete(athlete_profile_id));

create policy athlete_stats_modify on public.athlete_stats
  for all to authenticated
  using (public.can_manage_athlete(athlete_profile_id))
  with check (public.can_manage_athlete(athlete_profile_id));

-- =============================  videos  ==============================
create policy videos_select on public.videos
  for select to anon, authenticated
  using (
    (is_public and status = 'ready')
    or public.can_view_athlete(athlete_profile_id)
  );

create policy videos_modify on public.videos
  for all to authenticated
  using (public.can_manage_athlete(athlete_profile_id))
  with check (public.can_manage_athlete(athlete_profile_id));

-- ======================  opportunity_scores  =========================
-- Scores are private to the athlete and their guardians (+ admins).
create policy opportunity_scores_select on public.opportunity_scores
  for select to authenticated
  using (public.can_manage_athlete(athlete_profile_id));

-- Writes come from the engine (service_role, bypasses RLS) or admins.
create policy opportunity_scores_write on public.opportunity_scores
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
