# Platform — AI Software Builder

An AI-powered software-building platform built with Next.js, TypeScript, and Tailwind CSS.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Graph DB | Neo4j (knowledge graph) |
| Queue | Redis (background jobs) |
| Storage | AWS S3 (file uploads) |
| LLM | OpenAI GPT-4o |

## Project structure

```
src/
  agents/     # AI pipeline agents (extractor, judge, graphBuilder, …)
  app/        # Next.js App Router pages and API routes
    (app)/    # Dashboard pages with sidebar layout
    page.tsx  # Landing page
  components/ # Reusable React components
  db/         # Database client exports (Prisma)
  lib/        # Thin client wrappers (openai, neo4j, redis, s3, types)
  prompts/    # System prompt strings used by agents
scripts/
  seed-demo.ts  # Seed the DB with demo data (no API keys needed)
prisma/
  schema.prisma # Database schema
```

### Why this structure?

- **`agents/`** — each agent is a pure async function with typed inputs/outputs, making them easy to test and swap.
- **`app/(app)/`** — a Next.js route group. Pages inside share a sidebar layout without changing their URL path. The root `/` page gets its own minimal layout — clean separation between marketing and product.
- **`db/`** — a stable import alias (`@/db`) that re-exports the Prisma client. If you ever replace Prisma, only this file changes.
- **`prompts/`** — keeping LLM system prompts as typed TypeScript constants (not inline strings) makes them easy to version, diff, and unit-test.
- **`lib/`** — one file per external service. Each file creates a singleton client and exports it. Nothing else in the codebase touches credentials directly.

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env and fill in your credentials

# 3. Create database tables
npx prisma db push

# 4. Seed with demo data (no API keys required)
npm run seed:demo

# 5. Start the dev server
npm run dev
# → http://localhost:3000
```

## Useful commands

```bash
npm run dev           # Start dev server with hot reload
npm run build         # Production build
npx tsc --noEmit      # Type-check without emitting files
npm run seed:demo     # Reset and reload demo data
npx prisma studio     # Browse the database in a GUI
npm run db:migrate    # Run pending Prisma migrations
```

## Environment variables

See `.env.example` for the full list with descriptions. Required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `OPENAI_API_KEY` — OpenAI API key for GPT-4o agents
- `NEO4J_URI` / `NEO4J_USER` / `NEO4J_PASSWORD` — knowledge graph
- `REDIS_URL` — background job queue
- `NEXTAUTH_SECRET` — session signing key (`openssl rand -base64 32`)

AWS S3 variables are optional; the app runs in text-only mode without them.

## Pipeline overview

```
Document upload
     ↓
/api/extract  →  Extractor agent  →  raw claims
     ↓
/api/judge    →  Judge agent      →  ACCEPTED / WEAK / REJECTED
     ↓
/api/graph    →  GraphBuilder     →  Neo4j nodes + edges
     ↓
/api/theory   →  TheoryScorer     →  score 0–1 + verdict
```

Contradictions are detected automatically during graph building and rendered as red dashed edges in the D3 force graph.
