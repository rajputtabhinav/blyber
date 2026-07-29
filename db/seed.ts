/**
 * CLI entry point: seed a demo organization with the bundled lab data.
 *
 *   npm run db:seed   — assumes migrations are already applied
 *                       (run `npm run db:migrate` first)
 *   npm run db:reset  — fresh docker volume + migrate + seed
 *
 * The seed creates one "Blyber Demo Lab" organization (org_demo), a
 * single user (user_demo_owner) linked to engineer eng-01, and ~150
 * rows of lab data across servers, racks, tickets, qualifications,
 * and validation runs. Re-running on an already-seeded org is a no-op
 * (we check `organizations.demo_seeded`).
 */

import "dotenv/config";
// Also load .env.local explicitly (dotenv/config only reads .env)
import dotenv from "dotenv";
import path from "node:path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { eq } from "drizzle-orm";
import { getDb, schema as s } from "./client";
import { seedAll } from "./seed-fn";

const DEMO_ORG_ID = "org_demo";
const DEMO_ORG_SLUG = "demo";
const DEMO_USER_ID = "user_demo_owner";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and set " +
        "DATABASE_URL, then start the local DB with `npm run db:up`.",
    );
    process.exit(1);
  }
  const db = getDb();
  console.log(`Connected: ${process.env.DATABASE_URL.replace(/:[^@/]+@/, ":****@")}`);

  // Create the demo user + org if they don't exist. In multi-tenant mode,
  // everything lives under an org — even the seed.
  const existingUser = await db
    .select()
    .from(s.users)
    .where(eq(s.users.id, DEMO_USER_ID))
    .limit(1);
  if (existingUser.length === 0) {
    await db.insert(s.users).values({
      id: DEMO_USER_ID,
      email: "demo-owner@blyber.local",
      name: "Demo Owner",
    });
  }

  const existingOrg = await db
    .select()
    .from(s.organizations)
    .where(eq(s.organizations.id, DEMO_ORG_ID))
    .limit(1);

  if (existingOrg.length > 0 && existingOrg[0].demoSeeded) {
    console.log(`Org ${DEMO_ORG_ID} already seeded. Skipping.`);
    console.log("To re-seed, run: npm run db:reset");
    return;
  }

  if (existingOrg.length === 0) {
    await db.insert(s.organizations).values({
      id: DEMO_ORG_ID,
      name: "Blyber Demo Lab",
      slug: DEMO_ORG_SLUG,
    });
    await db.insert(s.orgMembers).values({
      orgId: DEMO_ORG_ID,
      userId: DEMO_USER_ID,
      role: "admin",
    });
    console.log(`Created org ${DEMO_ORG_ID} with owner ${DEMO_USER_ID}.`);
  }

  console.log(`Seeding org ${DEMO_ORG_ID}…`);
  await seedAll(db, { orgId: DEMO_ORG_ID, actorUserId: DEMO_USER_ID });
  console.log("Seed complete.");

  console.log("\nRow counts (across all orgs):");
  for (const [name, t] of Object.entries({
    users: s.users,
    organizations: s.organizations,
    orgMembers: s.orgMembers,
    engineers: s.engineers,
    racks: s.racks,
    platforms: s.platforms,
    components: s.components,
    componentInstances: s.componentInstances,
    servers: s.servers,
    tickets: s.tickets,
    ticketTimelineEntries: s.ticketTimelineEntries,
    ticketChecklistItems: s.ticketChecklistItems,
    firmwareEntries: s.firmwareEntries,
    kbArticles: s.kbArticles,
    rmaItems: s.rmaItems,
    testPlans: s.testPlans,
    qualifications: s.qualifications,
    qualificationCampaigns: s.qualificationCampaigns,
    validationRuns: s.validationRuns,
    auditLog: s.auditLog,
  })) {
    const rows = (await db.select().from(t as never)) as unknown as unknown[];
    console.log(`  ${name.padEnd(28)} ${String(rows.length).padStart(4)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
