#!/usr/bin/env bash
# BuilderAI — one-command setup script
# Usage: bash scripts/setup.sh [command]
# Commands: setup (default) | run | deploy | debug | status

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${CYAN}ℹ${NC}  $1"; }
ok()      { echo -e "${GREEN}✔${NC}  $1"; }
warn()    { echo -e "${YELLOW}⚠${NC}  $1"; }
err()     { echo -e "${RED}✖${NC}  $1"; }
section() { echo -e "\n${BOLD}${CYAN}── $1 ──${NC}"; }

CMD="${1:-setup}"
echo -e "\n${BOLD}${CYAN}⚡ BuilderAI SetupAgent${NC} — command: ${CMD}\n"

case "$CMD" in

  setup)
    section "Environment"
    if [ ! -f .env ]; then
      cp .env.example .env
      # Generate a random NEXTAUTH_SECRET
      SECRET=$(openssl rand -base64 32 2>/dev/null || date | md5sum | cut -c1-32)
      sed -i "s/your-secret-here/${SECRET}/" .env
      warn ".env created from template — fill in DATABASE_URL and ANTHROPIC_API_KEY"
    else
      ok ".env exists"
    fi

    section "Dependencies"
    npm install
    ok "Dependencies installed"

    section "Prisma"
    npx prisma generate
    ok "Prisma client generated"

    info "Pushing schema (npx prisma db push)..."
    npx prisma db push --accept-data-loss 2>/dev/null && ok "Database schema synced" \
      || warn "DB push failed — set DATABASE_URL in .env and re-run"

    section "Fine-tune"
    [ -f public/robots.txt ] && ok "robots.txt ready" || warn "robots.txt missing"
    [ -f public/sitemap.xml ] && ok "sitemap.xml ready" || warn "sitemap.xml missing"

    echo ""
    ok "${BOLD}Setup complete!${NC}"
    info "Next steps:"
    info "  1. Edit .env — set DATABASE_URL and ANTHROPIC_API_KEY"
    info "  2. bash scripts/setup.sh run     — start dev server"
    info "  3. bash scripts/setup.sh deploy  — deploy to Vercel"
    ;;

  run)
    section "Dev Server"
    npx prisma generate
    npx prisma db push --accept-data-loss 2>/dev/null || warn "DB push skipped"
    info "Starting http://localhost:3000 ..."
    npm run dev
    ;;

  build)
    section "Production Build"
    npx prisma generate
    npm run build
    ok "Build complete"
    ;;

  deploy)
    section "Vercel Deploy"
    # Install vercel CLI if needed
    command -v vercel &>/dev/null || npm install -g vercel
    npx prisma generate && npm run build
    if [ "$2" = "--prod" ]; then
      vercel --prod --yes
    else
      vercel --yes
    fi
    ok "Deployed! Your Vercel URL is shown above."
    info "To add a custom domain: vercel domains add yourdomain.com"
    ;;

  debug)
    section "Diagnostics"
    npx tsc --noEmit && ok "TypeScript: OK" || err "TypeScript: FAILED"
    npx prisma generate && ok "Prisma generate: OK" || err "Prisma generate: FAILED"
    npm run build && ok "Next.js build: OK" || err "Next.js build: FAILED"
    ;;

  status)
    section "Status"
    [ -f .env ]                                 && ok ".env"          || warn ".env missing"
    [ -f prisma/schema.prisma ]                 && ok "Prisma schema" || warn "schema missing"
    [ -d node_modules ]                         && ok "node_modules"  || warn "run npm install"
    [ -d node_modules/@prisma/client ]          && ok "Prisma client" || warn "run npx prisma generate"
    [ -d .next ]                                && ok ".next build"   || warn "not built yet"
    [ -f public/robots.txt ]                    && ok "robots.txt"    || warn "run setup"
    grep -q "ANTHROPIC_API_KEY=sk-" .env 2>/dev/null && ok "ANTHROPIC_API_KEY set" \
      || warn "ANTHROPIC_API_KEY not set in .env"
    grep -q "DATABASE_URL=postgresql" .env 2>/dev/null && ok "DATABASE_URL set" \
      || warn "DATABASE_URL not set in .env"
    ;;

  *)
    echo "Usage: bash scripts/setup.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup    First-time setup (env, deps, DB, fine-tune)"
    echo "  run      Start dev server on http://localhost:3000"
    echo "  build    Production build"
    echo "  deploy   Deploy to Vercel (add --prod for production)"
    echo "  debug    TypeScript + build diagnostics"
    echo "  status   Health check all required files and env vars"
    ;;
esac
