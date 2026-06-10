-- PrintForge Phase 1 Schema
-- Run this in your Supabase SQL editor or via supabase db push

create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table public.profiles (
  id        uuid references auth.users on delete cascade primary key,
  email     text not null,
  role      text not null default 'customer'
              check (role in ('admin', 'customer')),
  created_at timestamptz default now()
);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── PRINTER PROFILES ────────────────────────────────────────────────────────
create table public.printer_profiles (
  id                  uuid default uuid_generate_v4() primary key,
  name                text not null,
  build_volume_x_mm   integer not null,
  build_volume_y_mm   integer not null,
  build_volume_z_mm   integer not null,
  nozzle_diameter_mm  numeric(3,2) not null default 0.4,
  supported_materials text[] not null default '{}',
  hourly_rate_usd     numeric(6,2) not null,
  is_active           boolean not null default true,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─── MATERIALS ───────────────────────────────────────────────────────────────
create table public.materials (
  id              uuid default uuid_generate_v4() primary key,
  name            text not null unique,
  display_name    text not null,
  cost_per_kg_usd numeric(8,2) not null,
  -- { tensile_strength_mpa, heat_deflection_c, is_flexible, uv_resistant, food_safe }
  properties      jsonb not null default '{}',
  -- { no_food_contact, no_outdoor, requires_enclosure }
  restrictions    jsonb not null default '{}',
  color_hex       text,
  is_active       boolean not null default true,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── CUSTOM REQUESTS ─────────────────────────────────────────────────────────
create table public.custom_requests (
  id                    uuid default uuid_generate_v4() primary key,
  customer_email        text not null,
  raw_prompt            text not null,
  intended_use          text,
  reference_dimensions  jsonb,

  -- Intake
  intake_status         text default 'pending'
                          check (intake_status in ('pending','processing','feasible','needs_splitting','rejected')),
  intake_verdict        jsonb,
  intake_agent_run_id   uuid,

  -- Design
  design_status         text default 'pending'
                          check (design_status in ('pending','processing','complete','failed')),
  stl_path              text,
  render_paths          text[] default '{}',
  openscad_script       text,
  design_agent_run_id   uuid,

  -- Material / Pricing
  pricing_status        text default 'pending'
                          check (pricing_status in ('pending','processing','complete','failed')),
  pricing_data          jsonb,
  pricing_agent_run_id  uuid,

  -- Listing
  listing_status        text default 'pending'
                          check (listing_status in ('pending','processing','complete','failed')),
  listing_agent_run_id  uuid,
  product_id            uuid,

  pipeline_status       text not null default 'submitted'
                          check (pipeline_status in (
                            'submitted','intake','design','pricing','listing',
                            'approved','rejected','fulfilled')),

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────
create table public.products (
  id                uuid default uuid_generate_v4() primary key,
  slug              text not null unique,
  title             text not null,
  description       text not null,
  seo_description   text,
  spec_sheet        jsonb,
  status            text not null default 'draft'
                      check (status in ('draft','published','archived')),
  source            text not null default 'custom'
                      check (source in ('custom','catalog')),
  custom_request_id uuid references public.custom_requests(id),
  stl_path          text,
  render_paths      text[] default '{}',
  marketing_notes   text,
  approved_at       timestamptz,
  approved_by       uuid references auth.users,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Back-fill custom_requests.product_id FK
alter table public.custom_requests
  add constraint fk_product
  foreign key (product_id) references public.products(id);

-- ─── PRODUCT TIERS ───────────────────────────────────────────────────────────
create table public.product_tiers (
  id                 uuid default uuid_generate_v4() primary key,
  product_id         uuid not null references public.products(id) on delete cascade,
  tier               text not null check (tier in ('premium','standard','budget')),
  material_id        uuid not null references public.materials(id),
  printer_profile_id uuid not null references public.printer_profiles(id),
  price_usd          numeric(8,2) not null,
  print_time_hours   numeric(6,2) not null,
  filament_grams     numeric(8,2) not null,
  layer_height_mm    numeric(4,3),
  infill_percent     integer,
  supports_needed    boolean default false,
  finishing_notes    text,
  is_available       boolean not null default true,
  created_at         timestamptz default now(),
  unique (product_id, tier)
);

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
create table public.orders (
  id                       uuid default uuid_generate_v4() primary key,
  order_number             text not null unique,
  channel                  text not null default 'direct'
                             check (channel in ('direct','custom')),
  customer_email           text not null,
  customer_name            text,
  shipping_address         jsonb,
  product_id               uuid references public.products(id),
  product_tier_id          uuid references public.product_tiers(id),
  quantity                 integer not null default 1,
  custom_request_id        uuid references public.custom_requests(id),
  subtotal_usd             numeric(8,2) not null,
  shipping_usd             numeric(8,2) not null default 0,
  total_usd                numeric(8,2) not null,
  stripe_session_id        text,
  stripe_payment_intent_id text,
  payment_status           text default 'pending'
                             check (payment_status in ('pending','paid','refunded','failed')),
  paid_at                  timestamptz,
  fulfillment_status       text default 'pending'
                             check (fulfillment_status in (
                               'pending','printing','printed','packed','shipped','delivered')),
  tracking_number          text,
  shipped_at               timestamptz,
  notes                    text,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- ─── AGENT RUNS ──────────────────────────────────────────────────────────────
create table public.agent_runs (
  id                uuid default uuid_generate_v4() primary key,
  agent             text not null,
  custom_request_id uuid references public.custom_requests(id),
  product_id        uuid references public.products(id),
  input             jsonb not null,
  output            jsonb,
  error             text,
  model             text not null,
  input_tokens      integer,
  output_tokens     integer,
  cost_usd          numeric(10,6),
  status            text not null default 'pending'
                      check (status in ('pending','running','complete','failed')),
  started_at        timestamptz default now(),
  completed_at      timestamptz,
  created_at        timestamptz default now()
);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.printer_profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.materials
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.custom_requests
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.printer_profiles enable row level security;
alter table public.materials enable row level security;
alter table public.custom_requests enable row level security;
alter table public.products enable row level security;
alter table public.product_tiers enable row level security;
alter table public.orders enable row level security;
alter table public.agent_runs enable row level security;

-- profiles
create policy "users read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "admins read all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "service role full access profiles"
  on public.profiles using (auth.role() = 'service_role');

-- printer_profiles: public read active, admin write
create policy "public read active printers"
  on public.printer_profiles for select using (is_active = true);
create policy "admin manage printers"
  on public.printer_profiles for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "service role full access printers"
  on public.printer_profiles using (auth.role() = 'service_role');

-- materials: public read active, admin write
create policy "public read active materials"
  on public.materials for select using (is_active = true);
create policy "admin manage materials"
  on public.materials for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "service role full access materials"
  on public.materials using (auth.role() = 'service_role');

-- custom_requests: customers create/read own, admins all
create policy "customers create requests"
  on public.custom_requests for insert with check (true);
create policy "customers read own requests"
  on public.custom_requests for select
  using (customer_email = (select email from public.profiles where id = auth.uid()));
create policy "admin manage requests"
  on public.custom_requests for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "service role full access requests"
  on public.custom_requests using (auth.role() = 'service_role');

-- products: public read published, admin all
create policy "public read published products"
  on public.products for select using (status = 'published');
create policy "admin manage products"
  on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "service role full access products"
  on public.products using (auth.role() = 'service_role');

-- product_tiers: public read for published products
create policy "public read tiers of published products"
  on public.product_tiers for select
  using (exists (select 1 from public.products prod where prod.id = product_id and prod.status = 'published'));
create policy "admin manage tiers"
  on public.product_tiers for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "service role full access tiers"
  on public.product_tiers using (auth.role() = 'service_role');

-- orders: customers read own, admin all
create policy "customers read own orders"
  on public.orders for select
  using (customer_email = (select email from public.profiles where id = auth.uid()));
create policy "admin manage orders"
  on public.orders for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "service role full access orders"
  on public.orders using (auth.role() = 'service_role');

-- agent_runs: admin only
create policy "admin read agent runs"
  on public.agent_runs for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "service role full access agent_runs"
  on public.agent_runs using (auth.role() = 'service_role');
