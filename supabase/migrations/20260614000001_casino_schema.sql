-- =============================================================================
-- Play-Money Casino — Initial Schema
-- =============================================================================
-- Run this once against your Supabase project:
--   Supabase Dashboard → SQL Editor → paste + Run
--   OR: supabase db push (if using Supabase CLI)
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------
-- One row per user. Linked 1-to-1 with auth.users via user_id.
-- username is set at signup; updated_at triggers on every change.
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  username    text not null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. wallets
-- ---------------------------------------------------------------------------
-- One row per user. cached_balance is kept in sync with the ledger by the
-- handle_new_ledger_entry trigger (below) so reads are O(1). It is NEVER
-- updated directly by the application — only via the trigger.
create table if not exists wallets (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references auth.users(id) on delete cascade,
  cached_balance   bigint not null default 0,   -- stored as integer coins (×100 if you later want decimals)
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. ledger_entries  (APPEND-ONLY)
-- ---------------------------------------------------------------------------
-- Every coin movement is a new row. NEVER update or delete rows here.
-- Balance = SUM(amount) for a user — or use cached_balance from wallets.
-- game_round_id is null for the initial bonus entry.
create type ledger_type as enum ('bonus', 'bet', 'payout');

create table if not exists ledger_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  amount          bigint not null,           -- positive = credit, negative = debit
  type            ledger_type not null,
  game_round_id   uuid,                      -- null for bonus entries
  balance_after   bigint not null,           -- denormalised snapshot for history display
  created_at      timestamptz not null default now()
);

-- Prevent updates and deletes to enforce append-only behaviour at DB level
create or replace function deny_ledger_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'ledger_entries is append-only: UPDATE and DELETE are not allowed';
end;
$$;

create trigger ledger_no_update
  before update on ledger_entries
  for each row execute function deny_ledger_mutation();

create trigger ledger_no_delete
  before delete on ledger_entries
  for each row execute function deny_ledger_mutation();

-- ---------------------------------------------------------------------------
-- 4. server_seeds
-- ---------------------------------------------------------------------------
-- For provably-fair gameplay.
-- hashed_seed is shown to the player upfront.
-- seed (the raw value) is NULL until rotated — revealed only after the round
-- so players can verify past results but can't predict future ones.
-- Only one seed per user can be active at a time (enforced by partial index).
create table if not exists server_seeds (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  hashed_seed  text not null,               -- SHA-256 hex of seed, shown to player
  seed         text,                        -- null until revealed on rotation
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Only one active seed per user
create unique index if not exists server_seeds_one_active
  on server_seeds (user_id)
  where active = true;

-- ---------------------------------------------------------------------------
-- 5. game_rounds
-- ---------------------------------------------------------------------------
-- Immutable record of every bet. Outcome and payout are written by the
-- server API route — the client never computes these.
create type game_type as enum ('dice', 'limbo', 'plinko', 'mines', 'crash');

create table if not exists game_rounds (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  game             game_type not null,
  bet_amount       bigint not null,
  client_seed      text not null,
  server_seed_id   uuid not null references server_seeds(id),
  nonce            bigint not null,
  outcome          numeric(10, 6) not null,  -- raw [0,1) float from RNG
  payout           bigint not null,           -- 0 if lost
  created_at       timestamptz not null default now()
);

-- Index for per-user history queries (most recent first)
create index if not exists game_rounds_user_created
  on game_rounds (user_id, created_at desc);


-- =============================================================================
-- TRIGGER: sync wallet.cached_balance whenever a ledger row is inserted
-- =============================================================================
create or replace function sync_wallet_balance()
returns trigger language plpgsql security definer as $$
begin
  update wallets
  set cached_balance = new.balance_after,
      updated_at     = now()
  where user_id = new.user_id;
  return new;
end;
$$;

create trigger after_ledger_insert
  after insert on ledger_entries
  for each row execute function sync_wallet_balance();


-- =============================================================================
-- TRIGGER: bootstrap a new user
-- Fires when a row is inserted into auth.users (i.e. on signup).
-- Creates: profile + wallet + 10,000-coin bonus ledger entry + first server seed.
-- =============================================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_seed        text;
  v_hashed_seed text;
  v_seed_id     uuid;
begin
  -- 1. Profile
  insert into profiles (user_id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));

  -- 2. Wallet (starts at 0; the ledger entry below will update it via trigger)
  insert into wallets (user_id, cached_balance)
  values (new.id, 0);

  -- 3. First server seed
  --    We generate a random 32-byte seed in hex and store its SHA-256 hash.
  --    The raw seed is kept here (not exposed to client) until the player rotates.
  v_seed        := encode(gen_random_bytes(32), 'hex');
  v_hashed_seed := encode(digest(v_seed, 'sha256'), 'hex');

  insert into server_seeds (user_id, hashed_seed, seed, active)
  values (new.id, v_hashed_seed, v_seed, true)
  returning id into v_seed_id;

  -- 4. Welcome bonus — 10,000 coins (balance_after = 10000 for a new account)
  insert into ledger_entries (user_id, amount, type, game_round_id, balance_after)
  values (new.id, 10000, 'bonus', null, 10000);

  return new;
end;
$$;

-- pgcrypto is needed for gen_random_bytes and digest
create extension if not exists pgcrypto;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
-- Enable RLS on every table. Users can only see and write their own rows.
-- The service_role key (used in API routes) bypasses RLS by design.

alter table profiles       enable row level security;
alter table wallets        enable row level security;
alter table ledger_entries enable row level security;
alter table server_seeds   enable row level security;
alter table game_rounds    enable row level security;


-- profiles: read + insert own row; no update/delete from client
create policy "profiles: own row read"
  on profiles for select
  using (auth.uid() = user_id);

create policy "profiles: own row insert"
  on profiles for insert
  with check (auth.uid() = user_id);


-- wallets: read only; writes go through service_role in API routes
create policy "wallets: own row read"
  on wallets for select
  using (auth.uid() = user_id);


-- ledger_entries: read only from client; inserts go through service_role
create policy "ledger_entries: own rows read"
  on ledger_entries for select
  using (auth.uid() = user_id);


-- server_seeds: read own active hash; client never sees the raw seed
create policy "server_seeds: own rows read"
  on server_seeds for select
  using (auth.uid() = user_id);


-- game_rounds: read own history
create policy "game_rounds: own rows read"
  on game_rounds for select
  using (auth.uid() = user_id);
