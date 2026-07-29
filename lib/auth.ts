/**
 * Auth + tenant helpers — currently a no-auth shim.
 *
 * The multi-tenant schema (org_id on every row, plus an
 * `engineers.external_user_id` slot) is preserved so a real auth layer
 * can be plugged in later by swapping just this file. Every query and
 * mutation goes through requireSession / requireOrgId / requireOrgRole
 * / requireActorEngineer — so adding Clerk, NextAuth, Lucia, or
 * anything else means rewriting only the four helpers below and the
 * (currently empty) middleware.
 *
 * Today every helper returns a hardcoded session pointing at the
 * "Blyber Demo Lab" org created by `npm run db:seed`:
 *   userId      = "user_demo_owner"
 *   orgId       = "org_demo"
 *   orgSlug     = "demo"
 *   role        = "admin"
 *   engineerId  = whatever eng row is linked to user_demo_owner (eng-01
 *                 after seed runs; lazily bootstrapped otherwise)
 */

import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { getDbReady, schema as s } from "@/db/client";

export type AppRole = "admin" | "member" | "viewer";

export interface Session {
  userId: string;
  orgId: string;
  orgSlug: string | null;
  role: AppRole;
  engineerId?: string;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
    this.name = "AuthError";
  }
}

const DEMO_ORG_ID = "org_demo";
const DEMO_ORG_SLUG = "demo";
const DEMO_USER_ID = "user_demo_owner";
const BOOTSTRAP_ENGINEER_ID = "eng-bootstrap";

function demoSession(): Session {
  return {
    userId: DEMO_USER_ID,
    orgId: DEMO_ORG_ID,
    orgSlug: DEMO_ORG_SLUG,
    role: "admin",
  };
}

export async function requireSession(): Promise<Session> {
  return demoSession();
}

export async function requireOrgId(): Promise<string> {
  return DEMO_ORG_ID;
}

export async function requireOrgRole(roles: AppRole[]): Promise<Session> {
  // Demo user is always admin — every role check passes. The argument
  // is kept so server actions keep the same shape when real auth lands.
  if (roles.length === 0) throw new AuthError("requireOrgRole called with empty list", 500);
  return demoSession();
}

/**
 * Resolve (or lazily create) the engineer row for the current user.
 * Used by every mutation that needs an actor FK.
 *
 * Race safety: the INSERT uses ON CONFLICT DO NOTHING on the unique
 * external_user_id index, so two concurrent requests on a fresh DB
 * cannot both succeed. We re-SELECT after the insert and trust that.
 */
export async function requireActorEngineer(): Promise<Session & { engineerId: string }> {
  const session = demoSession();
  const db = await getDbReady();

  // Fast path: the seed linked eng-01 to the demo user, so this hits
  // on every request after the first run of `npm run db:seed`.
  const linked = await db
    .select()
    .from(s.engineers)
    .where(
      and(
        eq(s.engineers.orgId, session.orgId),
        eq(s.engineers.externalUserId, session.userId),
      ),
    )
    .limit(1);
  if (linked[0]) return { ...session, engineerId: linked[0].id };

  // Fallback: any engineer in the org works. Pre-seed users see this.
  const any = await db
    .select()
    .from(s.engineers)
    .where(eq(s.engineers.orgId, session.orgId))
    .orderBy(asc(s.engineers.id))
    .limit(1);
  if (any[0]) return { ...session, engineerId: any[0].id };

  // No engineers exist yet (seed never ran). Bootstrap a placeholder so
  // mutations can proceed. ON CONFLICT keeps this safe under concurrent
  // first requests; the org row must already exist (FK).
  await db
    .insert(s.engineers)
    .values({
      id: BOOTSTRAP_ENGINEER_ID,
      orgId: session.orgId,
      externalUserId: session.userId,
      name: "Demo User",
      initials: "DU",
      email: "demo@blyber.local",
      team: "Validation",
      role: "Admin",
      activeTickets: 0,
      resolvedThisWeek: 0,
      workload: 0,
      status: "online",
      shift: null,
      joinedAt: new Date(),
    })
    .onConflictDoNothing();

  // Re-resolve — either we just inserted it, or the racing request did.
  const re = await db
    .select()
    .from(s.engineers)
    .where(
      and(
        eq(s.engineers.orgId, session.orgId),
        eq(s.engineers.externalUserId, session.userId),
      ),
    )
    .limit(1);
  if (re[0]) return { ...session, engineerId: re[0].id };

  // Should be unreachable — surface a useful error rather than a generic FK violation.
  throw new AuthError(
    `Unable to resolve actor engineer for user ${session.userId} in org ${session.orgId}. ` +
      `Run \`npm run db:seed\` to populate the demo org.`,
    500,
  );
}

export async function getSessionOrNull(): Promise<Session | null> {
  return demoSession();
}
