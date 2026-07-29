/**
 * Drizzle client for Blyber, backed by Postgres via the postgres-js
 * driver.
 *
 * Local dev:  docker compose up -d  (postgres:17 on port 5433)
 * Prod:       any managed Postgres — set DATABASE_URL.
 *
 * The drizzle instance is cached on globalThis so Next dev HMR (which
 * re-imports server modules on every edit) doesn't open a new
 * connection pool per save.
 *
 * Migrations + seed run out-of-band:
 *   npm run db:migrate   — apply pending migrations
 *   npm run db:seed      — populate the demo org with bundled data
 */

import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  // Don't throw at import time — next build evaluates server files
  // during static analysis. Defer until something actually queries.
  console.warn("[blyber/db] DATABASE_URL is not set. Set it in .env.local.");
}

const g = globalThis as unknown as {
  __blyberPg?: ReturnType<typeof postgres>;
  __blyberDb?: ReturnType<typeof drizzle<typeof schema>>;
};

function getPg() {
  if (!g.__blyberPg) {
    if (!DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is required. Copy .env.example to .env.local and " +
          "set it, then start Postgres with `npm run db:up`.",
      );
    }
    g.__blyberPg = postgres(DATABASE_URL, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
    });
  }
  return g.__blyberPg;
}

export function getDb() {
  if (!g.__blyberDb) {
    g.__blyberDb = drizzle(getPg(), { schema });
  }
  return g.__blyberDb;
}

/**
 * Awaitable variant — kept for API compatibility with callers that
 * historically awaited DB readiness. With postgres-js the handshake
 * is lazy and per-connection, so `await getDbReady()` is essentially
 * `getDb()` plus a microtask.
 */
export async function getDbReady() {
  return getDb();
}

export { schema };
export type DB = ReturnType<typeof getDb>;
