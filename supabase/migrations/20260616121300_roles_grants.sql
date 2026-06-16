-- =====================================================================
-- Athlete Opportunity Engine — 13 Roles, grants & privilege guards
-- ---------------------------------------------------------------------
-- Maps the Supabase database roles (anon / authenticated / service_role)
-- to table privileges, then layers trigger guards that block privilege
-- escalation on sensitive columns (role, verification flags) which RLS
-- alone cannot express at column granularity.
-- =====================================================================

-- ---------------------------------------------------------------------
-- is_privileged(): true for admins and trusted backend roles.
-- ---------------------------------------------------------------------
create or replace function public.is_privileged()
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select public.is_admin()
    or current_user in ('service_role', 'supabase_admin', 'supabase_auth_admin', 'postgres');
$$;

-- ---------------------------------------------------------------------
-- Guard: protect users.role / users.email / users.is_active.
-- ---------------------------------------------------------------------
create or replace function public.guard_users_privileged_columns()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if not public.is_privileged() then
    if new.role is distinct from old.role then
      raise exception 'changing role requires admin privileges';
    end if;
    if new.email is distinct from old.email then
      raise exception 'email is managed by authentication and cannot be changed here';
    end if;
    if new.is_active is distinct from old.is_active then
      raise exception 'changing is_active requires admin privileges';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_users_guard_privileged
  before update on public.users
  for each row execute function public.guard_users_privileged_columns();

-- ---------------------------------------------------------------------
-- Guard: coach verification is admin-only.
-- ---------------------------------------------------------------------
create or replace function public.guard_coach_verification()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if public.is_privileged() then
    return new;
  end if;
  if tg_op = 'INSERT' and (new.is_verified or new.verified_at is not null) then
    raise exception 'coach verification can only be set by an administrator';
  elsif tg_op = 'UPDATE'
    and (new.is_verified is distinct from old.is_verified
         or new.verified_at is distinct from old.verified_at) then
    raise exception 'coach verification can only be set by an administrator';
  end if;
  return new;
end;
$$;

create trigger trg_coach_guard_verification
  before insert or update on public.coach_profiles
  for each row execute function public.guard_coach_verification();

-- ---------------------------------------------------------------------
-- Guard: athlete verification is admin-only.
-- ---------------------------------------------------------------------
create or replace function public.guard_athlete_verification()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if public.is_privileged() then
    return new;
  end if;
  if tg_op = 'INSERT' and new.is_verified then
    raise exception 'athlete verification can only be set by an administrator';
  elsif tg_op = 'UPDATE' and new.is_verified is distinct from old.is_verified then
    raise exception 'athlete verification can only be set by an administrator';
  end if;
  return new;
end;
$$;

create trigger trg_athlete_guard_verification
  before insert or update on public.athlete_profiles
  for each row execute function public.guard_athlete_verification();

-- =========================  ROLE PRIVILEGES  =========================

-- Baseline schema access (Supabase grants this by default; explicit here).
grant usage on schema public to anon, authenticated, service_role;

-- No object creation by API roles.
revoke create on schema public from anon, authenticated;

-- ---- service_role: full access (also bypasses RLS) ----
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines  in schema public to service_role;

-- ---- anon: read-only reference + public videos (rows gated by RLS) ----
grant select on public.sports        to anon;
grant select on public.schools       to anon;
grant select on public.school_sports to anon;
grant select on public.videos        to anon;

-- ---- authenticated: row-restricted CRUD (RLS + guards enforce rows/cols) ----
grant select on public.sports        to authenticated;
grant select on public.schools       to authenticated;
grant select on public.school_sports to authenticated;

-- Reference + program writes (RLS restricts to admins / head coaches).
grant insert, update, delete on public.sports        to authenticated;
grant insert, update, delete on public.schools       to authenticated;
grant insert, update, delete on public.school_sports to authenticated;

-- User & profile graph.
grant select, insert, update, delete on public.users              to authenticated;
grant select, insert, update, delete on public.athlete_profiles   to authenticated;
grant select, insert, update, delete on public.parent_profiles    to authenticated;
grant select, insert, update, delete on public.coach_profiles     to authenticated;
grant select, insert, update, delete on public.athlete_sports     to authenticated;
grant select, insert, update, delete on public.athlete_guardians  to authenticated;
grant select, insert, update, delete on public.athlete_stats      to authenticated;
grant select, insert, update, delete on public.videos             to authenticated;

-- Scores: read for owners/guardians (RLS); writes admin-only (RLS).
grant select, insert, update, delete on public.opportunity_scores to authenticated;

-- Helper/utility functions are safe to execute for API roles.
grant execute on all routines in schema public to anon, authenticated, service_role;

-- ---- Default privileges for future objects created by the migration role ----
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant execute on routines to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
