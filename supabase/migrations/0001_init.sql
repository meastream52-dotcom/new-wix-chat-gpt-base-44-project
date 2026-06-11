-- PrintForge Phase 1 schema
-- Core tables: profiles, printer_profiles, materials, products, product_tiers,
-- custom_requests, orders, agent_runs. Phase 3 tables (dropship_accounts) are
-- intentionally NOT created yet.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('admin', 'customer');
create type product_status as enum ('draft', 'published', 'archived');
create type tier_name as enum ('premium', 'standard', 'budget');
create type request_status as enum (
  'submitted',        -- form received, intake agent running/ran
  'rejected',         -- intake rejected (safety / IP / size)
  'intake_review',    -- intake verdict awaiting operator approval
  'design',           -- approved; design agent ran, STL awaiting review
  'pricing',          -- design approved; pricing agent ran
  'listing',          -- pricing approved; listing agent drafted product
  'published',        -- product published to storefront
  'closed'
);
create type order_channel as enum ('direct', 'custom');
create type order_status as enum ('pending', 'paid', 'printing', 'shipped', 'cancelled');

-- ---------------------------------------------------------------------------
-- Profiles (mirrors auth.users; role gate for the admin dashboard)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Printer profiles
-- ---------------------------------------------------------------------------
create table printer_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  build_x_mm int not null,
  build_y_mm int not null,
  build_z_mm int not null,
  nozzle_mm numeric(4, 2) not null default 0.4,
  hourly_rate_cents int not null,
  materials_supported text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Materials
-- ---------------------------------------------------------------------------
create table materials (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  cost_per_kg_cents int not null,
  density_g_cm3 numeric(5, 3) not null default 1.24,
  -- e.g. {"heat_resistance_c": 60, "uv_resistant": false, "flexible": false,
  --       "food_safe": false, "strength": "medium", "finish": "good"}
  properties jsonb not null default '{}',
  -- e.g. {"no_outdoor": true, "no_food_contact": true}
  restrictions jsonb not null default '{}',
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Custom requests (intake pipeline)
-- ---------------------------------------------------------------------------
create table custom_requests (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  raw_prompt text not null,
  -- {"environment": "indoor"|"outdoor", "heat_exposure": bool, "flex_needed": bool,
  --  "food_contact": bool, "cosmetic_only": bool}
  intended_use jsonb not null default '{}',
  status request_status not null default 'submitted',
  -- IntakeVerdict JSON from the intake agent (verdict, reasons, flags, ref specs)
  intake_verdict jsonb,
  -- DesignResult JSON from the design agent (storage paths, notes)
  design_result jsonb,
  product_id uuid,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Products + tiers
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references custom_requests (id) on delete set null,
  status product_status not null default 'draft',
  title text not null,
  slug text not null unique,
  description text not null default '',
  -- {"dimensions_mm": [x,y,z], "volume_cm3": n, "notes": "..."}
  spec_sheet jsonb not null default '{}',
  stl_paths text[] not null default '{}',
  render_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table custom_requests
  add constraint custom_requests_product_fk
  foreign key (product_id) references products (id) on delete set null;

create table product_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  tier tier_name not null,
  material_id uuid references materials (id),
  price_cents int not null,
  print_time_min int not null,
  filament_g numeric(8, 1) not null,
  finishing text not null default '',
  available boolean not null default true,
  unique (product_id, tier)
);

-- ---------------------------------------------------------------------------
-- Orders (channel 'dropship' arrives in Phase 3)
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  channel order_channel not null,
  product_id uuid references products (id),
  tier tier_name,
  request_id uuid references custom_requests (id),
  customer_email text not null,
  amount_cents int not null,
  stripe_session_id text unique,
  status order_status not null default 'pending',
  shipping_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Agent audit log
-- ---------------------------------------------------------------------------
create table agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent text not null,
  input jsonb not null,
  output jsonb,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cost_usd numeric(10, 6) not null default 0,
  duration_ms int not null default 0,
  error text,
  created_at timestamptz not null default now()
);

create index agent_runs_agent_idx on agent_runs (agent, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- API routes use the service-role key (bypasses RLS). Policies below cover
-- direct client access: public storefront reads + admin dashboard reads.
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table printer_profiles enable row level security;
alter table materials enable row level security;
alter table custom_requests enable row level security;
alter table products enable row level security;
alter table product_tiers enable row level security;
alter table orders enable row level security;
alter table agent_runs enable row level security;

create policy "own profile read" on profiles
  for select using (auth.uid() = id or is_admin());

create policy "admin manages printers" on printer_profiles
  for all using (is_admin()) with check (is_admin());

create policy "public reads materials" on materials
  for select using (true);
create policy "admin manages materials" on materials
  for all using (is_admin()) with check (is_admin());

create policy "admin reads requests" on custom_requests
  for select using (is_admin());
create policy "admin updates requests" on custom_requests
  for update using (is_admin()) with check (is_admin());

create policy "public reads published products" on products
  for select using (status = 'published' or is_admin());
create policy "admin manages products" on products
  for all using (is_admin()) with check (is_admin());

create policy "public reads tiers of published products" on product_tiers
  for select using (
    exists (
      select 1 from products p
      where p.id = product_id and (p.status = 'published' or is_admin())
    )
  );
create policy "admin manages tiers" on product_tiers
  for all using (is_admin()) with check (is_admin());

create policy "admin reads orders" on orders
  for select using (is_admin());
create policy "admin updates orders" on orders
  for update using (is_admin()) with check (is_admin());

create policy "admin reads agent runs" on agent_runs
  for select using (is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets: STLs are private, renders are public
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('models', 'models', false),
  ('renders', 'renders', true)
on conflict (id) do nothing;

create policy "admin reads models" on storage.objects
  for select using (bucket_id = 'models' and is_admin());
create policy "public reads renders" on storage.objects
  for select using (bucket_id = 'renders');
