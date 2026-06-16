-- =====================================================================
-- Athlete Opportunity Engine — 11 Supabase Auth integration
-- ---------------------------------------------------------------------
-- Bridges auth.users <-> public.users:
--   * On sign-up, create the public.users row from sign-up metadata.
--   * Mirror the role into auth JWT app_metadata so RLS can authorize
--     statelessly (no recursive lookups on public.users).
--   * Keep app_metadata.role in sync when an admin changes a user's role.
-- =====================================================================

-- ---------------------------------------------------------------------
-- handle_new_user(): AFTER INSERT on auth.users.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role      public.user_role;
  v_full_name text;
begin
  -- Resolve requested role from sign-up metadata; default to athlete.
  begin
    v_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'athlete')
                ::public.user_role;
  exception when others then
    v_role := 'athlete';
  end;

  v_full_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', '')
  );

  insert into public.users (id, email, role, full_name, avatar_url)
  values (
    new.id,
    new.email,
    v_role,
    v_full_name,
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  -- Mirror role into app_metadata so it is embedded in subsequent JWTs.
  update auth.users
     set raw_app_meta_data =
           coalesce(raw_app_meta_data, '{}'::jsonb)
           || jsonb_build_object('role', v_role)
   where id = new.id;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates public.users from auth sign-up metadata and seeds app_metadata.role.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- sync_user_role_to_auth(): keep JWT app_metadata.role current.
-- ---------------------------------------------------------------------
create or replace function public.sync_user_role_to_auth()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role then
    update auth.users
       set raw_app_meta_data =
             coalesce(raw_app_meta_data, '{}'::jsonb)
             || jsonb_build_object('role', new.role)
     where id = new.id;
  end if;
  return new;
end;
$$;

comment on function public.sync_user_role_to_auth() is
  'Propagates public.users.role changes into auth.users app_metadata.';

drop trigger if exists trg_users_sync_role on public.users;
create trigger trg_users_sync_role
  after update of role on public.users
  for each row execute function public.sync_user_role_to_auth();
