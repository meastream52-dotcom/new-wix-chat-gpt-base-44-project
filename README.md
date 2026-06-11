# PrintForge

AI-agent-powered 3D printing business platform. One operator runs a print
farm; Claude agents handle intake screening, parametric design, material
selection, pricing, and listing copy — every customer-facing output sits
behind a one-click human approval gate.

**This repo is Phase 1 (MVP):** custom request intake → agent pipeline →
single-brand storefront → Stripe checkout → manual order management.
Phase 2 (order ops, marketing, n8n shipping) and Phase 3 (multi-tenant
white-label dropshipping, Stripe Connect) are deliberately not scaffolded.

## Stack

- Next.js 14 (App Router) + Tailwind, deploys to Vercel
- Supabase: Postgres + Auth + Storage (STLs in private `models` bucket,
  renders in public `renders` bucket), RLS on every table
- Anthropic API (`claude-opus-4-8` by default) for all agents
- Stripe Checkout (one-time payments) + webhook → orders table
- Optional local binaries: OpenSCAD (design STL rendering), PrusaSlicer /
  OrcaSlicer CLI (real slicing estimates; falls back to geometric estimate)

## The pipeline

```
customer form ──▶ Intake Agent (safety/IP firewall, web search, build-volume check)
                       │  status: intake_review        ── operator gate 1
                       ▼
                  Design Agent (OpenSCAD gen + self-critique → .scad/.stl in Storage)
                       │  status: design               ── operator gate 2
                       ▼
                  Material & Pricing Agent (3 tiers; slicer estimate + price formula)
                       │  status: pricing              ── operator gate 3
                       ▼
                  Listing Agent (title/description/spec sheet → DRAFT product)
                       │  status: listing              ── operator gate 4 (Publish)
                       ▼
                  Storefront + Stripe checkout → orders queue (manual fulfillment)
```

Every agent call is logged to `agent_runs` with token counts and dollar cost
(visible on the admin Overview page).

### Hard constraints (enforced by the Intake Agent)

- No structural / load-bearing / safety-critical parts: vehicle frames,
  chassis, suspension, brakes, helmets, child-seat parts, firearm parts,
  medical implants.
- Licensed IP is flagged: custom one-off personal-use gets a warning;
  the Listing Agent **refuses** to create catalog listings for IP-flagged
  requests.
- Parts larger than the bed (default 300×300×350 mm, configurable) get a
  multi-piece split plan or rejection.
- Food-contact / outdoor / heat use cases restrict the material tiers.

## Setup

1. **Supabase**: create a project, then run the migration and seed:

   ```sh
   supabase link --project-ref <ref>
   supabase db push            # applies supabase/migrations/0001_init.sql
   psql $DATABASE_URL -f supabase/seed.sql   # or paste into the SQL editor
   ```

2. **Create the operator account**: sign up a user (Supabase Auth → email),
   then promote it:

   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```

3. **Env**: `cp .env.example .env.local` and fill in Supabase, Anthropic, and
   Stripe keys. `SLICER_CLI` / `OPENSCAD_PATH` are optional.

4. **Stripe webhook** (local dev):

   ```sh
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

5. Run:

   ```sh
   npm install
   npm run dev
   ```

6. **Update your real costs** at `/admin/config`: machine hourly rate and
   filament $/kg (the seed values are placeholders). Margin/labor/finishing
   constants live in `src/lib/pricing.ts`.

## Smoke test (first end-to-end run)

1. Go to `/request`, submit: *"Dashboard bezel for a 1970 Chevelle, the one
   with the round gauges"* (indoor, cosmetic).
2. Watch `/admin/requests`: the intake verdict appears (printable, reference
   specs from web search, no safety flags).
3. Click **Approve → run Design**, review the generated `.scad`/`.stl` in
   Supabase Storage (`models/requests/<id>/`).
4. Click **Approve design → run Pricing** — three tiers appear on the draft
   product.
5. Click **Approve pricing → run Listing**, then **Publish** on
   `/admin/products`.
6. The bezel is live on `/`; buy it with Stripe test card `4242 4242 4242 4242`
   and watch the order land in `/admin/orders`.

## Key directories

| Path | What |
|---|---|
| `supabase/migrations/0001_init.sql` | Schema + RLS + storage buckets |
| `src/agents/` | The four pipeline agents |
| `src/lib/anthropic.ts` | Agent runner: web-search loop, `agent_runs` cost logging |
| `src/lib/pricing.ts` | Price formula + margin config (dropship 1.20× constant for Phase 3) |
| `src/lib/slicer.ts` | Slicer CLI wrapper + binary-STL geometric estimator |
| `src/app/api/admin/requests/[id]/*` | The approval-gate endpoints |
| `src/app/admin/` | Operator dashboard |
