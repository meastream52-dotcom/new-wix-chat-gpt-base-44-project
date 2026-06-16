# Seed strategy

The seed is split in two layers because some data depends on Supabase Auth.

| Layer | File | What it loads | How it runs |
|---|---|---|---|
| **Reference data** | [`../seed.sql`](../seed.sql) | `sports`, `schools`, `school_sports` | Auto-loaded by `supabase db reset` (wired in `config.toml`). Pure SQL, idempotent (`ON CONFLICT` upserts). No auth dependency. |
| **App/auth data** | [`seed_app_data.ts`](./seed_app_data.ts) | Demo `auth.users` + `users`, `athlete_profiles`, `parent_profiles`, `coach_profiles`, `athlete_sports`, `athlete_stats`, `videos`, `opportunity_scores`, guardian links | Run manually with the **service role** key. |

## Why two layers?

`users` rows are created by the `handle_new_user()` trigger when a row is
inserted into `auth.users`. You cannot reliably insert `auth.users` from a
plain SQL seed (passwords are hashed by GoTrue, identities/metadata are
managed by the Auth service). So accounts must be created through the Auth
Admin API, which is exactly what `seed_app_data.ts` does. The trigger then
creates the matching `public.users` row and mirrors the role into the JWT
`app_metadata`.

## Running the app/auth seed

```bash
# Local stack
export SUPABASE_URL="http://localhost:54321"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key from `supabase status`>"

# or a hosted project
# export SUPABASE_URL="https://<ref>.supabase.co"
# export SUPABASE_SERVICE_ROLE_KEY="<service-role-key from dashboard>"

npx tsx supabase/seed/seed_app_data.ts
```

Demo accounts created (password `Password123!`):

| Email | Role |
|---|---|
| `jacob@aoe.dev` | athlete (PRD persona) |
| `jennifer@aoe.dev` | parent (linked guardian) |
| `davis@aoe.dev` | coach (GVSU, football) |
| `admin@aoe.dev` | admin |

The script is idempotent: existing accounts are reused and profile rows are
upserted, so it is safe to re-run.

> **Security:** the service role key bypasses RLS. Keep it server-side only —
> never expose it in a browser bundle or commit it to git.
