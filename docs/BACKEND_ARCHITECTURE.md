# Athlete Opportunity Engine — Backend Architecture

> Production backend for AOE on **Next.js 16 (App Router) + TypeScript +
> Supabase (PostgreSQL, Auth, Storage)**, built on the validated Step 2
> database schema (`supabase/migrations`, `docs/DATABASE_ARCHITECTURE.md`).

Validated locally: `npx tsc --noEmit` passes and `next build` completes its
**Compile + TypeScript** phases cleanly (the only build error is a pre-existing
Evidence-AI route, `/api/extract`, unrelated to this work).

---

## 1. Architecture overview

A layered, type-safe request pipeline:

```
HTTP → src/proxy.ts (session refresh + edge authz)
     → Route handler (src/app/api/**)            [defineRoute: rate limit + error mapping]
     → Zod validation (src/validators/**)         [parseJson / parseQuery]
     → Auth/RBAC (src/lib/auth.ts)                [requireAuth / requireRole]
     → Service layer (src/server/services/**)     [business logic, scoring, audit]
     → Repository layer (src/server/repositories) [data access only]
     → Supabase clients (src/lib/supabase/**)     [RLS anon client | service-role admin]
     → PostgreSQL (RLS) / Storage
```

**Principles**

- **Separation of concerns.** Routes are thin; services own business rules;
  repositories own data access. No SQL or Supabase calls leak into routes.
- **Security by default.** Every user request runs through an RLS-scoped client
  (anon key + the user's JWT). The service-role client is used only where the
  database intentionally restricts writes (persisting opportunity scores) or for
  Storage signing — never for user reads.
- **Defense in depth.** `proxy.ts` enforces auth/admin at the edge; route
  handlers re-check with `requireAuth`/`requireRole`; the database enforces RLS
  and column guards. A bug in one layer is contained by the others.
- **Type-safety end to end.** A hand-authored `Database` type (drop-in
  replaceable by `supabase gen types`) flows through generic repositories so
  table rows, inserts and updates are fully typed.
- **Consistent contracts.** Success → `{ data }`; failure → `{ error: { code,
  message, details? } }` with the right HTTP status.

---

## 2. Folder structure

```
src/
  proxy.ts                         # Next 16 proxy (session refresh + edge authz)
  lib/
    env.ts                         # Zod-validated env (public + lazy server)
    errors.ts                      # AppError hierarchy + Postgrest mapping + serializer
    api.ts                         # defineRoute wrapper, jsonOk, parseJson/parseQuery
    rate-limit.ts                  # Upstash (prod) / in-memory (dev) tiers
    auth.ts                        # getAuthContext, requireAuth, requireRole, getClientIp
    csv.ts                         # RFC-4180 CSV parser
    supabase/
      types.ts                     # Database types + enum unions + Tables/InsertDto/UpdateDto
      server.ts                    # RLS server client (cookies)
      admin.ts                     # service-role client
      client.ts                    # browser client
      middleware.ts                # updateSession (used by proxy)
  validators/                      # Zod schemas
    common.ts auth.ts athlete.ts stats.ts video.ts match.ts school.ts
  server/
    repositories/                  # data access (one class per aggregate)
      helpers.ts athlete.repository.ts stats.repository.ts video.repository.ts
      school.repository.ts schoolSport.repository.ts match.repository.ts
    services/                      # business logic
      access.ts audit.ts scoring.ts
      auth.service.ts athlete.service.ts stats.service.ts video.service.ts
      match.service.ts school.service.ts
  app/api/                         # route handlers (see §4)
    auth/{signup,login,logout,password-reset,password-update}/route.ts
    athletes/route.ts
    athletes/[id]/route.ts
    athletes/[id]/stats/route.ts
    athletes/[id]/videos/route.ts
    athletes/[id]/videos/upload-url/route.ts
    athletes/stats/[statId]/route.ts
    matches/route.ts
    matches/[id]/route.ts
    admin/schools/route.ts
    admin/schools/[id]/route.ts
    admin/schools/import/route.ts
    admin/school-sports/route.ts
    admin/school-sports/[id]/route.ts
```

---

## 3. Source code

All source lives in the tree above. Highlights:

- **Opportunity engine** (`server/services/scoring.ts`): pure, deterministic
  implementation of PRD §12 — `athletic 30% · academic 20% · roster 25% ·
  major 10% · location 10% · program-level 5%` → `overall_score` (0–100), a
  recruiting `match_tier`, a `confidence` estimate from data completeness, and
  an explainable `factors` payload. The DB derives the PRD score band.
- **Match flow** (`server/services/match.service.ts`): resolves the athlete's
  sport/position/stats, pulls candidate schools + programs via the RLS client,
  scores and ranks them, and persists results with the **service-role** client
  (RLS restricts `opportunity_scores` writes to admin/engine).
- **CSV import** (`server/services/school.service.ts` + `lib/csv.ts`):
  per-row Zod validation, deterministic slugging, idempotent upsert by slug,
  and a structured `{ imported, failed, errors[] }` report.

---

## 4. API route list

Envelope: success `{ "data": ... }`, error `{ "error": { code, message, details? } }`.
RL = rate-limit tier (auth 10/min, read 120/min, write 40/min, heavy 6/min per IP).

| Method | Path | Auth | RL | Body / Query |
|---|---|---|---|---|
| POST | `/api/auth/signup` | public | auth | `{ email, password, role?, full_name? }` |
| POST | `/api/auth/login` | public | auth | `{ email, password }` |
| POST | `/api/auth/logout` | public | auth | — |
| POST | `/api/auth/password-reset` | public | auth | `{ email, redirect_to? }` |
| POST | `/api/auth/password-update` | recovery session | auth | `{ password }` |
| POST | `/api/athletes` | athlete/admin | write | create-profile (+ optional `sports[]`) |
| GET | `/api/athletes` | authed | read | — (own profile) |
| GET | `/api/athletes/{id}` | authed (RLS visibility) | read | — |
| PATCH | `/api/athletes/{id}` | owner/guardian/admin | write | update-profile |
| POST | `/api/athletes/{id}/stats` | owner/guardian/admin | write | stat, `[stats]`, or `{ stats }` |
| GET | `/api/athletes/{id}/stats` | authed (RLS) | read | `?sport_id&metric_key` |
| PATCH | `/api/athletes/stats/{statId}` | owner/guardian/admin | write | update-stat |
| POST | `/api/athletes/{id}/videos/upload-url` | owner/guardian/admin | write | `{ filename, content_type, size_bytes? }` |
| POST | `/api/athletes/{id}/videos` | owner/guardian/admin | write | create-video |
| GET | `/api/athletes/{id}/videos` | authed (RLS) | read | `?status&limit&offset` |
| POST | `/api/matches` | athlete/admin | heavy | `{ sport_id?, limit?, associations?, divisions?, states?, persist? }` |
| GET | `/api/matches` | authed | read | `?sport_id&min_score&tier&limit&offset` |
| GET | `/api/matches/{id}` | owner/guardian/admin (RLS) | read | — |
| GET | `/api/admin/schools` | admin | read | `?q&association&state&limit&offset` (→ `X-Total-Count`) |
| POST | `/api/admin/schools` | admin | write | create-school |
| PATCH | `/api/admin/schools/{id}` | admin | write | update-school |
| DELETE | `/api/admin/schools/{id}` | admin | write | — |
| POST | `/api/admin/schools/import` | admin | heavy | CSV (multipart `file`, `{ csv }`, or raw text) |
| POST | `/api/admin/school-sports` | admin | write | create-school-sport |
| PATCH | `/api/admin/school-sports/{id}` | admin | write | update-school-sport |
| DELETE | `/api/admin/school-sports/{id}` | admin | write | — |

---

## 5. Validation schemas (`src/validators`)

- **common.ts** — `uuidSchema`, `paginationSchema`, enum mirrors (gender,
  association, division, school type, recruiting status, visibility, stat
  source, video type, match tier), recursive `jsonObjectSchema`.
- **auth.ts** — `signupSchema` (role ∈ athlete/parent/coach), `loginSchema`,
  `passwordResetRequestSchema`, `passwordUpdateSchema`.
- **athlete.ts** — `createAthleteProfileSchema` (+ `sports[]`),
  `updateAthleteProfileSchema`, `athleteSportInputSchema`. Bounds mirror DB
  checks (gpa 0–5, SAT 400–1600, ACT 1–36, grad-year, height/weight).
- **stats.ts** — `createStatSchema` (requires value or text), `addStatsSchema`
  (single / array / `{stats}`), `updateStatSchema`, `listStatsQuerySchema`.
- **video.ts** — `uploadUrlSchema` (mime allowlist, ≤5 GiB), `createVideoSchema`
  (requires storage_path or external_url), `listVideosQuerySchema`.
- **match.ts** — `generateMatchesSchema`, `listMatchesQuerySchema`.
- **school.ts** — `createSchoolSchema`, `updateSchoolSchema`,
  `listSchoolsQuerySchema`, `createSchoolSportSchema`, `updateSchoolSportSchema`.

---

## 6. Auth middleware & RBAC

- **`src/proxy.ts`** (Next 16 proxy convention) calls `updateSession` to refresh
  Supabase cookies, returns **401** for unauthenticated access to
  `/api/athletes|matches|admin`, and **403** for non-admins on `/api/admin`
  (role read from JWT `app_metadata.role`, mirrored from `public.users` by the
  Step 2 trigger). Scoped via `config.matcher` to AOE routes only.
- **`src/lib/auth.ts`** — `getAuthContext()` returns `{ userId, email, role,
  profile, supabase }` (RLS client); `requireAuth()` → 401; `requireRole(...)`
  → 403; `getClientIp()` for rate-limit identity.
- **`src/server/services/access.ts`** — `canManageAthlete` / `assertManageAthlete`
  mirror the DB `can_manage_athlete` policy for precise 403/404s and to gate
  service-role Storage signing.

---

## 7. Supabase client setup (`src/lib/supabase`)

| Client | Key | RLS | Use |
|---|---|---|---|
| `server.ts` → `createSupabaseServerClient()` | anon + user JWT (cookies) | enforced | all user requests |
| `admin.ts` → `createSupabaseAdminClient()` | service role | bypassed | score persistence, Storage signing |
| `client.ts` → `createSupabaseBrowserClient()` | anon | enforced | client components |
| `middleware.ts` → `updateSession()` | anon + cookies | enforced | proxy session refresh |

Types come from `types.ts` (`Database`, enum unions, `Tables<>`, `InsertDto<>`,
`UpdateDto<>`). Regenerate with
`supabase gen types typescript --linked --schema public > src/lib/supabase/types.ts`.

---

## 8. Error handling (`src/lib/errors.ts`)

- `AppError` base + `ValidationError(400)`, `UnauthorizedError(401)`,
  `ForbiddenError(403)`, `NotFoundError(404)`, `ConflictError(409)`,
  `UnprocessableError(422)`, `RateLimitError(429 + Retry-After)`.
- `fromPostgrest()` maps Postgres codes (`23505→409`, `23503→422`,
  `23514→400`, `42501→403`, `PGRST116→404`).
- `toErrorResponse()` serializes `AppError` / `ZodError` / unknown into the
  standard envelope and **never leaks internals** (unknown → generic 500).
  `defineRoute` applies it to every handler automatically.

---

## 9. Deployment instructions

### Environment variables (see `.env.example`)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only),
`SUPABASE_VIDEO_BUCKET`, and optionally `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` for distributed rate limiting.

### Supabase
1. Apply Step 2 migrations: `supabase db push` (or `supabase db reset` locally).
2. Storage buckets (`athlete-videos` private, `avatars`/`school-logos` public)
   are declared in `supabase/config.toml`; create them on hosted projects via
   the dashboard or CLI.
3. Configure Auth providers (Email/Password, Magic Link, OAuth — PRD §15) and
   set the password-reset redirect to `${NEXT_PUBLIC_APP_URL}/auth/reset-password`.

### Vercel
1. Set the env vars above in Project → Settings (keep `SUPABASE_SERVICE_ROLE_KEY`
   and Upstash tokens server-side; do not prefix with `NEXT_PUBLIC_`).
2. Deploy. `vercel.json` raises `maxDuration` for `/api/matches` and
   `/api/admin/schools/import`, and pins region `iad1`.
3. Provision an Upstash Redis (REST) database and add its URL/token for
   production-grade rate limiting across serverless instances.

### Verify
```bash
npm install
npx tsc --noEmit
npm run build
```
