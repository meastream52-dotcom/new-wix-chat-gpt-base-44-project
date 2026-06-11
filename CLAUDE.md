# CLAUDE.md — PrintForge

AI-agent-powered 3D printing business platform (Phase 1 MVP). Next.js 14 App
Router + Tailwind, Supabase (Postgres/Auth/Storage/RLS), Stripe Checkout,
Anthropic API for all agents.

## Commands

- `npm run dev` — dev server
- `npm run typecheck` — `tsc --noEmit` (no test suite yet)
- `npm run build` — production build

## Architecture rules

- **Pipeline, not free-for-all**: agents run in order
  Intake → Design → Material/Pricing → Listing, each advanced by an operator
  approval gate (API routes under `src/app/api/admin/requests/[id]/`).
  `custom_requests.status` is the state machine:
  `submitted → intake_review → design → pricing → listing → published`
  (or `rejected` at any point).
- **Agents** live in `src/agents/`, one file each, called only from API
  routes. All Claude calls go through `runAgent()` in `src/lib/anthropic.ts`,
  which logs tokens + cost to `agent_runs`. Never call the Anthropic SDK
  directly from an agent.
- **Prices are deterministic.** Models pick materials; `src/lib/pricing.ts`
  computes prices. Never let a model output a price.
- **Safety constraints live in the Intake Agent's system prompt**
  (`src/agents/intake.ts`) and the Listing Agent's IP block. Do not weaken
  them: no structural/load-bearing/safety-critical parts; IP-flagged requests
  are personal-use one-offs and must never become catalog listings.
- **Supabase clients**: `lib/supabase/server.ts` (cookie/anon, RLS applies)
  for reads in pages; `lib/supabase/admin.ts` (service role, bypasses RLS)
  only in API routes and agents. Never import the admin client in a client
  component.
- Admin access = `profiles.role = 'admin'`; checked via `getAdminUser()` in
  every `/api/admin/*` route and the `/admin` layout.
- **Phase discipline**: do not scaffold Phase 2/3 features (order ops agent,
  marketing agent, n8n, multi-tenant dropship, Stripe Connect) unless
  explicitly asked. The only Phase 3 trace allowed is the
  `DROPSHIP_MULTIPLIER` constant.

## Conventions

- Money is integer cents in Postgres (`*_cents`), formatted only at render.
- Agent JSON contracts are documented in `src/lib/types.ts`; agents reply
  with a single fenced ```json object parsed by `extractJson()`.
- Default model `claude-opus-4-8` (override with `ANTHROPIC_MODEL`); pricing
  table for cost logging is in `src/lib/anthropic.ts`.
