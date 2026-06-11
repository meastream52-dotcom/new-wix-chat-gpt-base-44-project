# EchoBlog — Launch Gate Checklist

No real-money payout runs until **every** box below is checked. The point of
this list is that the first month a dollar can move, every dollar is
traceable, reviewed by a human, and reversible.

## Functionality (Phases 1–6 VERIFY items)

- [ ] Post CRUD, 2/day free limit (DB-enforced), premium bypass
- [ ] Stripe Checkout → webhook → subscription table sync (test mode)
- [ ] Reading sessions: self-read creates nothing; rapid heartbeats don't inflate; 10-min/post/day cap holds; close is idempotent; cron closes abandoned sessions
- [ ] Likes: toggle, self-like blocked, double-click race safe
- [ ] Dashboard numbers match manual SQL spot-checks
- [ ] Estimates labeled as estimates; split change in PlatformConfig moves numbers without redeploy; zero-revenue month shows $0.00
- [ ] Month calculation: run twice → zero new entries; pool sums exact to the cent; flagged/deleted content earns nothing
- [ ] Admin: non-staff gets 404 on /admin; approve/hold write audit logs; finalize blocked while entries pending; flagged user's entries auto-hold
- [ ] Payouts (test mode): preview matches execution; re-run moves $0; mid-batch kill leaves failed users re-payable
- [ ] Fraud: bot-farm fixture flags, innocent-friends fixture stays quiet; confirm holds money; dismiss restores sessions
- [ ] Spam: link-heavy comment from new account rejected; 3-strikes author auto-flags to queue
- [ ] Notifications fire on approve/hold/payout/flag/report outcome
- [ ] /admin/health catches a deliberately-stuck webhook (processedAt null > 1h)

## Money & config

- [ ] Stripe **live** keys in production env; both webhook endpoints registered with live signing secrets (billing + connect)
- [ ] PlatformConfig seeded in prod: `revenue_split`, `minimum_payout_cents`, `premium_price_cents`
- [ ] `demo_monthly_revenue_cents` set to 0 in prod (estimator must read real Stripe invoices)
- [ ] Stripe balance guard verified against the live account

## Shadow month (mandatory)

- [ ] First real month runs as a SHADOW period: calculate + review in the system, but pay manually outside it to a handful of known-real users
- [ ] Fraud queue watched daily during the shadow month
- [ ] Shadow numbers reconciled against manual spot-checks before enabling the payout job for month two

## Operations

- [ ] Database backups verified restorable — actually restore one to a scratch instance
- [ ] Sentry (or equivalent) alerting on webhook failures and cron failures
- [ ] CRON_SECRET and ENGAGEMENT_HASH_SALT are strong, unique prod values
- [ ] Redis configured (rate-limit assist) — app verified to degrade safely without it

## Legal

- [ ] Terms of Service reviewed by counsel (current page is a marked placeholder)
- [ ] Privacy policy reviewed by counsel (placeholder)
- [ ] Earnings policy reviewed — it is shown to users as the contract for how money works
- [ ] GDPR export/delete path decided and documented
