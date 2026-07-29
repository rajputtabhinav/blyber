# Blyber

Mission control for infrastructure engineers — a hardware-validation
workbench covering servers, racks, components, firmware, tickets, RMAs,
test plans, qualification campaigns, and validation runs.

Stack: **Next.js 14 App Router** · **Postgres** (via Drizzle ORM) ·
**TypeScript**.

---

## Prerequisites

- Node.js 20+
- Docker Desktop (or any Postgres 15+ instance)

---

## Quick start

```bash
# 1. Install JS dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# (the defaults already point at the local docker compose Postgres)

# 3. Start Postgres
npm run db:up
# → postgres:17-alpine on localhost:5433

# 4. Apply the schema
npm run db:migrate

# 5. Seed the demo organization (~150 rows of demo data)
npm run db:seed

# 6. Run the dev server
npm run dev
# → http://localhost:3000
```

After step 6 the dashboard loads immediately — there's no login screen.
The app currently runs as a single-tenant demo (the multi-tenant schema
is in place but `lib/auth.ts` returns a hardcoded session). To wire up
real auth, replace the helpers in `lib/auth.ts`; nothing else changes.

---

## NPM scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next dev server on `0.0.0.0:3000` (LAN-accessible) |
| `npm run dev:local` | Next dev server on `127.0.0.1:3000` only |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:up` | `docker compose up -d` — start Postgres |
| `npm run db:down` | `docker compose down` — stop Postgres (keeps data) |
| `npm run db:generate` | Diff schema vs. migrations, emit a new SQL file |
| `npm run db:migrate` | Apply pending migrations to `DATABASE_URL` |
| `npm run db:seed` | Populate the demo org with bundled lab data |
| `npm run db:reset` | Wipe the docker volume, restart, migrate, seed |

---

## Project layout

```
app/                Next.js App Router pages (server components + client views)
components/         Shell (Sidebar, Topbar, palette) and UI primitives
db/
  client.ts         Postgres connection + drizzle instance (HMR-cached)
  schema.ts         Drizzle pg-core schema for every table
  seed-fn.ts        Reusable seedAll(db, { orgId, actorUserId? })
  seed.ts           CLI wrapper that creates the demo org and seeds it
drizzle/migrations/ SQL migrations (drizzle-kit generate)
lib/
  auth.ts           Session helpers (currently a no-auth shim)
  db-queries/       Server-only read API (org-scoped)
  db-mutations/     Server actions (org-scoped, role-guarded, audited)
  data/             Static seed data — read by db/seed-fn only
  types.ts          Shared TS types for the domain model
docker-compose.yml  Local Postgres container
```

---

## Environment variables

See `.env.example` for the canonical list. Today only one is required:

| Var | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string. Defaults to the docker compose instance. |

---

## Resetting local state

If you want to start fresh:

```bash
npm run db:reset
```

That drops the docker volume, recreates Postgres, applies migrations
from scratch, and reseeds the demo org. Equivalent to a clean install
of the database.

---

## Production deployment

The app is a standard Next.js 14 build. Deploy it however you deploy
Next:

1. Set `DATABASE_URL` to a managed Postgres (Neon, Supabase, RDS, etc.)
2. Run `npx drizzle-kit migrate` in your build step
3. `npm run build && npm run start`

Before going live to multiple users you will want to wire up real auth —
the chokepoints are documented in `lib/auth.ts`.
