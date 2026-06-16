# Athlete Opportunity Engine — Supabase

Production-ready PostgreSQL + pgvector schema for the Athlete Opportunity
Engine. Full design notes, ERD, RLS map, index strategy and deployment steps
are in [`../docs/DATABASE_ARCHITECTURE.md`](../docs/DATABASE_ARCHITECTURE.md).

## Layout

```
supabase/
  config.toml                 # Supabase CLI config (API, db, storage, auth, seed)
  migrations/                 # ordered, forward-only SQL migrations (00 → 14)
  seed.sql                    # idempotent reference data (sports/schools/programs)
  seed/
    seed_app_data.ts          # auth-dependent demo data via Auth Admin API
    README.md                 # seed strategy
```

## Quick start (local)

```bash
supabase start
supabase db reset             # applies migrations 00→14 and runs seed.sql

export SUPABASE_URL="http://localhost:54321"
export SUPABASE_SERVICE_ROLE_KEY="$(supabase status --output json | jq -r .SERVICE_ROLE_KEY)"
npx tsx supabase/seed/seed_app_data.ts
```

## Push to a hosted project

```bash
supabase link --project-ref <ref>
supabase db push
```

## Conventions

- **Forward-only migrations.** Never edit a shipped migration; add a new one.
- **`public.users.id == auth.users.id`.** Accounts are created through Supabase
  Auth; the `handle_new_user()` trigger provisions the app row and mirrors the
  role into the JWT `app_metadata`.
- **RLS everywhere.** User-facing requests use the anon key + the user's JWT;
  the opportunity engine / back-office use the service role key (bypasses RLS).
