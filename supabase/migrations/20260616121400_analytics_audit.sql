-- =====================================================================
-- Athlete Opportunity Engine — 14 Analytics & audit
-- ---------------------------------------------------------------------
-- Supports PRD §10 (Analytics: search logs, usage metrics) and §16
-- (Audit logging). These are high-write, append-mostly tables, so they
-- use bigint identity PKs. RLS keeps audit data admin-only and search
-- logs private to their owner.
-- =====================================================================

-- ---------------------------------------------------------------------
-- audit_logs — immutable record of privileged/mutating actions.
-- ---------------------------------------------------------------------
create table public.audit_logs (
  id            bigint generated always as identity primary key,
  actor_user_id uuid references public.users (id) on delete set null,
  actor_role    text,
  action        text not null,                 -- e.g. 'user.suspend','school.update'
  entity_type   text,                          -- 'users','schools','opportunity_scores'...
  entity_id     text,                          -- target row id (text: supports uuid & bigint)
  changes       jsonb not null default '{}'::jsonb,  -- {before:{}, after:{}}
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz not null default now()
);

comment on table public.audit_logs is
  'Append-only audit trail of privileged/mutating actions (PRD §16).';

create index idx_audit_logs_entity on public.audit_logs (entity_type, entity_id);
create index idx_audit_logs_actor on public.audit_logs (actor_user_id);
create index idx_audit_logs_created on public.audit_logs (created_at desc);
create index idx_audit_logs_action on public.audit_logs (action);

-- ---------------------------------------------------------------------
-- search_logs — usage analytics for athlete/school/position/geo search.
-- ---------------------------------------------------------------------
create table public.search_logs (
  id            bigint generated always as identity primary key,
  user_id       uuid references public.users (id) on delete set null,
  search_type   text not null,                 -- 'athlete','school','position','geo'
  query         text,
  filters       jsonb not null default '{}'::jsonb,
  result_count  integer,
  duration_ms   integer,
  created_at    timestamptz not null default now(),

  constraint search_logs_result_count_nonneg
    check (result_count is null or result_count >= 0)
);

comment on table public.search_logs is
  'Search usage analytics (PRD §10). Private to the searching user; admins see all.';

create index idx_search_logs_user on public.search_logs (user_id, created_at desc);
create index idx_search_logs_type on public.search_logs (search_type, created_at desc);

-- ---------------------------------------------------------------------
-- log_audit(): SECURITY DEFINER convenience writer for app/back-office.
-- ---------------------------------------------------------------------
create or replace function public.log_audit(
  p_action      text,
  p_entity_type text default null,
  p_entity_id   text default null,
  p_changes     jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id bigint;
begin
  insert into public.audit_logs (actor_user_id, actor_role, action, entity_type, entity_id, changes)
  values (auth.uid(), public.jwt_role(), p_action, p_entity_type, p_entity_id, coalesce(p_changes, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

-- ===========================  RLS  ===================================
alter table public.audit_logs  enable row level security;
alter table public.search_logs enable row level security;

-- Audit logs: admin read-only via API; writes go through service_role or
-- the SECURITY DEFINER log_audit() helper.
create policy audit_logs_select on public.audit_logs
  for select to authenticated
  using (public.is_admin());

-- Search logs: a user sees their own; admins see all.
create policy search_logs_select on public.search_logs
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy search_logs_insert on public.search_logs
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

-- ===========================  Grants  ================================
grant select on public.audit_logs to authenticated;          -- RLS: admin only
grant all on public.audit_logs to service_role;

grant select, insert on public.search_logs to authenticated; -- RLS-restricted
grant all on public.search_logs to service_role;
