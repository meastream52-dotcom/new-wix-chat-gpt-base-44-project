# Evidence AI — Codebase Guide

## What this is
Structured reasoning platform: ingest historical documents → extract atomic claims → validate → build knowledge graph → detect contradictions → score user-built theories.

## Tech stack
- **Framework**: Next.js 16 (App Router), TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Graph DB**: Neo4j (knowledge graph)
- **Queue**: Redis (job queue)
- **Storage**: AWS S3 (document files)
- **LLM**: OpenAI GPT-4o (agents)
- **Visualization**: D3.js force graph

## Local setup

```bash
cp .env.example .env      # fill in your credentials
npm install
npx prisma db push        # create tables
npm run seed:demo         # load demo data (no API keys needed)
npm run dev               # http://localhost:3000
```

## Key directories

```
src/
  agents/       # AI pipeline agents (extractor, judge, graphBuilder, contradictionDetector, theoryScorer)
  app/api/      # API routes: /upload /extract /judge /graph /theory
  app/          # Pages: / /vault /claims /graph /theory
  components/   # UI: EvidenceRow, ClaimCard, ConfidenceBar, Sidebar, InspectorPanel, GraphCanvas
  lib/          # Clients: db (Prisma), openai, neo4j, redis, s3, types
scripts/
  seed-demo.ts  # Populates DB with Marilyn Monroe + JFK demo data
```

## Pipeline flow

```
Document → /api/extract → /api/judge → /api/graph → /api/theory
             (claims)     (filter)    (Neo4j+contradictions) (score)
```

## Agent contracts

| Agent | Input | Output |
|---|---|---|
| Extractor | raw document text | `RawClaim[]` (text, confidence, timeRef, entities) |
| Judge | `RawClaim[]` | status: ACCEPTED / WEAK / REJECTED |
| GraphBuilder | judged claims | Neo4j nodes + edges |
| ContradictionDetector | documentId | `Contradiction[]` + CONTRADICTS edges in Neo4j |
| TheoryScorer | theoryId + `TheoryNode[]` | score 0–1, verdict, breakdown |

## Demo flow (Kickstarter)

1. `/vault` — documents are pre-loaded by `npm run seed:demo`
2. Click **Extract** on any document → claims appear in `/claims`
3. Click **Judge** → claims get ACCEPTED/WEAK/REJECTED status
4. Click **Graph** → redirects to `/graph` with D3 force visualization
5. Red dashed edges = contradictions detected automatically
6. `/theory` → select claims, score your theory

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `OPENAI_API_KEY` | GPT-4o API key |
| `OPENAI_MODEL` | Model override (default: gpt-4o) |
| `NEO4J_URI` | bolt://... |
| `NEO4J_USER` / `NEO4J_PASSWORD` | Neo4j credentials |
| `REDIS_URL` | Redis connection string |
| `AWS_*` / `S3_BUCKET` | S3 credentials (optional for text-only mode) |

## Common commands

```bash
npm run dev           # dev server
npx tsc --noEmit      # type check
npm run seed:demo     # reset + load demo data
npx prisma studio     # browse DB in browser
npm run db:migrate    # run migrations
```
