# EchoBlog — guidance for AI assistants

Monetized blogging platform (Medium-style with 50/40/10 revenue sharing).
Next.js 15 App Router + TypeScript, Prisma/Postgres, Clerk (dev-auth fallback),
Stripe Billing + Connect, optional Redis.

## Commands

- `npm run dev` / `npm run build` / `npm run typecheck` / `npm test`
- `npm run db:push` (schema), `npm run seed:demo` (demo data + fraud fixtures)
- Local services: `docker compose up -d` (Postgres + Redis)

## Hard rules — do not weaken these

1. **Money is integer cents (BigInt) everywhere.** No floats touch amounts.
   Score → cents conversion goes through `lib/revenue/allocate.ts` only.
2. **All earnings flow through the ledger.** Nothing pays out unless a
   LedgerEntry is status `approved`, and only `lib/payouts/run.ts` moves money.
3. **No self-engagement earns points** (own posts/comments/likes/reads), and
   every point source has a daily cap. Exclusions live in
   `lib/revenue/scores.ts` — the estimator and the month-end close both call
   it, so never fork that logic.
4. **DB is the enforcement layer; Redis only assists.** The 2 posts/day limit
   is checked in `lib/limits.ts` against Postgres.
5. **Webhooks are idempotent** via the `stripe_events` table; the payout job is
   idempotent via atomic entry claiming + Stripe idempotency keys
   (`${batchId}:${userId}` — format is asserted by tests, never change it).
6. Admin mutations require ADMIN role and must call `logAudit()`. Non-staff
   gets 404 (not 403) on /admin.
7. Revenue split and tunables come from the `platform_config` table
   (`lib/config.ts`), never hardcoded.

## Layout

- `src/lib/engagement/` — heartbeat constants, event tracking (caps), session close
- `src/lib/revenue/` — scores (shared), allocate (pure BigInt math), estimate, calculatePeriod, getMonthlyRevenueCents
- `src/lib/payouts/run.ts` — preview + execution (the only real-money code path)
- `src/lib/fraud/` — rules (one module each) + scan orchestrator with reversible consequences
- `src/app/api/cron/*` — guarded by `Authorization: Bearer ${CRON_SECRET}`
- `src/app/admin/*` — layout-level role guard
- `tests/` — vitest over the pure logic (allocation invariants, weights, spam)

## Auth modes

With Clerk keys set, Clerk runs (middleware + provider). Without them, dev-auth
mode: a `dev_user` cookie picks a seeded user via the navbar dropdown;
`/api/dev/login` is hard-disabled when Clerk is enabled.

## When touching money code

Run `npm test` (allocation invariants) and re-check idempotency: calculating a
period twice must create zero new entries; running payouts twice must move $0.
