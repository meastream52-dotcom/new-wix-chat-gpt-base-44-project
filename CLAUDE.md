# Play-Money Casino Prototype — Project Rules

## Non-Negotiable Rules

1. **PLAY-MONEY ONLY.** Coins have no real value and are never redeemable for anything. Never add deposit, withdrawal, purchase, or redemption features. This is legally a game, not gambling.

2. **Server is always authoritative.** Game outcomes and balance changes are computed server-side only (Next.js API routes). The client never calculates a win or a balance — it only animates results the server returns.

3. **Ledger is append-only.** Never UPDATE or DELETE a balance row. Every coin movement is a new immutable `ledger_entries` row. Balance is always derived by summing the ledger.

4. **All randomness uses the provably-fair engine.** HMAC-SHA256(serverSeed, `${clientSeed}:${nonce}`). Never use `Math.random()` for game outcomes.

5. **Stack:** Next.js 16 (App Router) + Tailwind CSS + Supabase (Postgres + Auth). Deploy target is Vercel.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API routes (server-authoritative game logic)
- **Database:** Supabase (PostgreSQL + Auth)
- **Hosting:** Vercel (free tier)

## Data Model

| Table | Purpose |
|---|---|
| `profiles` | user_id, username, created_at |
| `wallets` | user_id, cached_balance (updated atomically with ledger) |
| `ledger_entries` | id, user_id, amount, type (`bonus`/`bet`/`payout`), game_round_id, balance_after, created_at |
| `server_seeds` | id, user_id, hashed_seed (shown to player), seed (revealed on rotation), active, created_at |
| `game_rounds` | id, user_id, game, bet_amount, client_seed, server_seed_id, nonce, outcome, payout, created_at |

New accounts automatically receive a one-time 10,000 coin bonus.

## Provably-Fair Engine

1. Server generates secret **server seed** → shows player its **SHA-256 hash** (commitment)
2. Player has editable **client seed**
3. Every bet increments a **nonce** (0, 1, 2, …)
4. Outcome = `HMAC-SHA256(serverSeed, "${clientSeed}:${nonce}")` → hex → number → game result
5. On seed rotation, old server seed is **revealed** so players can verify all past results

## Game Build Order

1. **Dice** — roll 0–99, bet over/under a target ← start here
2. **Limbo** — pick a target multiplier, win if random multiplier exceeds it
3. **Plinko** — ball drops through pegs into multiplier buckets
4. **Mines** — reveal tiles, multiplier grows, one mine ends it
5. **Crash** — multiplier rises in real time, cash out before it crashes

## Theme System

Three presets via Tailwind CSS variables, switchable live:
- **Neon** — dark background, neon accents (Stake/Roobet style)
- **Minimal** — clean, light, fintech style
- **Vegas** — warm gold-and-red classic casino

## Directory Structure

```
src/
  app/
    (auth)/
      login/page.tsx
      signup/page.tsx
    (game)/
      lobby/page.tsx
      dice/page.tsx
      limbo/page.tsx
      plinko/page.tsx
      mines/page.tsx
      crash/page.tsx
      history/page.tsx
    api/
      wallet/balance/route.ts
      games/
        dice/route.ts
        limbo/route.ts
        plinko/route.ts
        mines/route.ts
        crash/route.ts
    layout.tsx
    page.tsx
    globals.css
  components/
    layout/
      Header.tsx
      Sidebar.tsx
    ui/
      Button.tsx
      Input.tsx
      Card.tsx
      BalanceDisplay.tsx
      ThemeProvider.tsx
    game/
      BetPanel.tsx
      GameResult.tsx
      RoundHistory.tsx
  lib/
    supabase/
      client.ts      # browser client
      server.ts      # server client (for API routes)
    casino/
      provably-fair.ts
      games/
        dice.ts
        limbo.ts
        plinko.ts
        mines.ts
        crash.ts
    types.ts
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only, never expose to client) |

## Common Commands

```bash
npm run dev           # dev server at http://localhost:3000
npx tsc --noEmit      # type check
npm run build         # production build
```
