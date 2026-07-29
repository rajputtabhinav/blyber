import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
import path from "node:path";

// Load .env first (CI / production), then .env.local (developer override).
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

/**
 * drizzle-kit config — used by:
 *   `drizzle-kit generate` — emit SQL migrations from the TS schema
 *   `drizzle-kit migrate`  — apply pending migrations to DATABASE_URL
 *
 * Reads DATABASE_URL from .env.local (or process env). Local dev points
 * at the docker compose Postgres (port 5433); prod points at Neon /
 * whichever managed Postgres you ship.
 */

const url = process.env.DATABASE_URL;
if (!url) {
  // We don't throw here so `drizzle-kit generate` can still run without
  // a live DB (it only needs the schema file). `migrate` will error
  // loudly on its own when it tries to connect.
  console.warn("[drizzle.config] DATABASE_URL is not set — migrate will fail.");
}

export default {
  schema: "./db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: url ?? "postgres://blyber:blyber@localhost:5433/blyber",
  },
  verbose: true,
  strict: true,
} satisfies Config;
