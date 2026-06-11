# EchoBlog

A Medium-style blogging platform that shares subscription revenue with its
writers and readers: **50% platform · 40% writer pool · 10% community pool**.

Built on the unified MVP architecture: Next.js 15 (App Router) + TypeScript,
PostgreSQL + Prisma, Clerk auth, Stripe Billing + Connect, Redis-assisted rate
limiting. The prime directive throughout: engagement is tracked and *estimated*
earnings shown from day one, but **no real money moves** until ledger entries
are calculated, fraud-checked, and human-approved.

## The money path

```
engagement (fraud-tagged at write time)
  → nightly fraud scan flags anomalies          /api/cron/fraud-scan
  → monthly calculation → pending ledger        /api/admin/revenue/calculate
  → admin reviews, approves or holds            /admin/revenue
  → payout job pays approved + onboarded        /api/admin/payouts/run
  → every transfer idempotent, audited, reversible
```

## Quick start (no external services needed)

```bash
cp .env.example .env          # defaults work with docker-compose
docker compose up -d          # Postgres + Redis
npm install
npm run db:push               # create schema
npm run seed:demo             # demo users + fraud fixtures
npm run dev
```

Without Clerk keys the app runs in **dev-auth mode**: use the amber dropdown in
the navbar to switch between seeded users (`admin`, `alice`, `bob` (premium),
`botfarmer`, …). The seed includes a bot farm and an engagement ring for the
fraud scan to catch, plus an innocent-friends pair it should leave alone.

Try the full loop locally:

1. As `bob`, read one of alice's posts for a minute, comment, like.
2. `curl -H "Authorization: Bearer change-me" localhost:3000/api/cron/close-sessions`
3. As `alice`, check `/dashboard` — read minutes and estimated earnings appear.
4. `curl -H "Authorization: Bearer change-me" localhost:3000/api/cron/fraud-scan`
5. As `admin`, review `/admin/fraud` (the bot farm is flagged) and run the
   month-end calculation from `/admin/revenue`.

## Production services

| Concern | Service | Env vars |
|---|---|---|
| Database | Neon Postgres | `DATABASE_URL` |
| Auth | Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| Billing | Stripe Billing | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PREMIUM_PRICE_ID` |
| Payouts | Stripe Connect Express | `STRIPE_CONNECT_WEBHOOK_SECRET` |
| Rate limits | Upstash Redis | `REDIS_URL` |
| Crons | Vercel Cron (vercel.json) | `CRON_SECRET` |

Webhook endpoints to register in Stripe: `/api/webhooks/stripe` (billing
events) and `/api/webhooks/stripe-connect` (account.updated, transfer events),
each with its own signing secret.

## Tests

```bash
npm test        # pure money math, scoring weights, spam heuristics
npm run typecheck
```

The allocation tests assert the invariants that matter: pools sum exactly to
the cent, remainders go to the owner pool / largest entry, and amounts stay
BigInt past 2^53.

## Before launch

See [docs/launch-checklist.md](docs/launch-checklist.md). Non-negotiable:
the first real month runs in shadow mode — calculate and review in the
system, pay manually outside it — before the payout job is enabled.
