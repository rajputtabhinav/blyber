"use server";

/**
 * Server Actions — every mutation in Blyber goes through here.
 *
 * Auth: every action calls `requireActorEngineer()` (admin-only ones
 * call `requireOrgRole(["admin"])` first). The session yields:
 *   - userId       — Clerk user_xxx, for the audit trail
 *   - orgId        — for tenant scoping
 *   - engineerId   — the local engineer row (resolved/created lazily)
 *   - role         — "admin" | "member" | "viewer"
 *
 * Every UPDATE/DELETE WHERE clause includes `org_id = currentOrg` so
 * a leaked entity ID from another org can't be touched.
 *
 * Every audit_log insert records:
 *   - actorEngineerId  (local FK)
 *   - actorUserId      (Clerk user, survives engineer-row deletion)
 *   - ipAddress + userAgent  (from request headers, best-effort)
 *   - orgId
 */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getDbReady, schema as s } from "@/db/client";
import { requireActorEngineer, requireOrgRole } from "@/lib/auth";

// Capture the request IP + UA at the start of every action so the
// audit trail records who actually clicked the button.
function requestMeta() {
  const h = headers();
  const xff = h.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0].trim() || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent") ?? null;
  return { ip, userAgent };
}

// ============================================================
// Tickets
// ============================================================

export async function resolveTicketsAction(ticketIds: string[]) {
  if (ticketIds.length === 0) return { ok: true as const, count: 0 };
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  const before = await db
    .select()
    .from(s.tickets)
    .where(and(eq(s.tickets.orgId, session.orgId), inArray(s.tickets.id, ticketIds)));

  await db.transaction(async (tx) => {
    await tx
      .update(s.tickets)
      .set({ status: "resolved", updatedAt: new Date() })
      .where(and(eq(s.tickets.orgId, session.orgId), inArray(s.tickets.id, ticketIds)));
    for (const row of before) {
      await tx.insert(s.auditLog).values({
        orgId: session.orgId,
        actorEngineerId: session.engineerId,
        actorUserId: session.userId,
        action: "ticket.resolve",
        entityType: "ticket",
        entityId: row.id,
        before: { status: row.status },
        after: { status: "resolved" },
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
    }
  });

  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  for (const row of before) revalidatePath(`/tickets/${row.id}`);
  return { ok: true as const, count: before.length };
}

export async function assignTicketAction(ticketId: string, engineerId: string) {
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  // Make sure the target engineer is in this org — prevents assigning
  // to an engineer from another tenant via a forged ID.
  const target = await db
    .select()
    .from(s.engineers)
    .where(and(eq(s.engineers.orgId, session.orgId), eq(s.engineers.id, engineerId)))
    .limit(1);
  if (!target[0]) {
    return { ok: false as const, error: "engineer not found in this org" };
  }

  const [before] = await db
    .select()
    .from(s.tickets)
    .where(and(eq(s.tickets.orgId, session.orgId), eq(s.tickets.id, ticketId)))
    .limit(1);
  if (!before) return { ok: false as const, error: "ticket not found" };

  await db.transaction(async (tx) => {
    await tx
      .update(s.tickets)
      .set({ assigneeId: engineerId, updatedAt: new Date() })
      .where(and(eq(s.tickets.orgId, session.orgId), eq(s.tickets.id, ticketId)));
    await tx.insert(s.auditLog).values({
      orgId: session.orgId,
      actorEngineerId: session.engineerId,
      actorUserId: session.userId,
      action: "ticket.assign",
      entityType: "ticket",
      entityId: ticketId,
      before: { assigneeId: before.assigneeId },
      after: { assigneeId: engineerId },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
  return { ok: true as const };
}

export async function assignTicketsToMeAction(ticketIds: string[]) {
  if (ticketIds.length === 0) return { ok: true as const, count: 0 };
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  const before = await db
    .select()
    .from(s.tickets)
    .where(and(eq(s.tickets.orgId, session.orgId), inArray(s.tickets.id, ticketIds)));

  await db.transaction(async (tx) => {
    await tx
      .update(s.tickets)
      .set({ assigneeId: session.engineerId, updatedAt: new Date() })
      .where(and(eq(s.tickets.orgId, session.orgId), inArray(s.tickets.id, ticketIds)));
    for (const row of before) {
      await tx.insert(s.auditLog).values({
        orgId: session.orgId,
        actorEngineerId: session.engineerId,
        actorUserId: session.userId,
        action: "ticket.assign",
        entityType: "ticket",
        entityId: row.id,
        before: { assigneeId: row.assigneeId },
        after: { assigneeId: session.engineerId },
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
    }
  });

  revalidatePath("/tickets");
  return { ok: true as const, count: before.length };
}

/** Closing is more permanent than resolving — admins only. */
export async function closeTicketsAction(ticketIds: string[]) {
  if (ticketIds.length === 0) return { ok: true as const, count: 0 };
  await requireOrgRole(["admin"]);
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  const before = await db
    .select()
    .from(s.tickets)
    .where(and(eq(s.tickets.orgId, session.orgId), inArray(s.tickets.id, ticketIds)));

  await db.transaction(async (tx) => {
    await tx
      .update(s.tickets)
      .set({ status: "closed", updatedAt: new Date() })
      .where(and(eq(s.tickets.orgId, session.orgId), inArray(s.tickets.id, ticketIds)));
    for (const row of before) {
      await tx.insert(s.auditLog).values({
        orgId: session.orgId,
        actorEngineerId: session.engineerId,
        actorUserId: session.userId,
        action: "ticket.close",
        entityType: "ticket",
        entityId: row.id,
        before: { status: row.status },
        after: { status: "closed" },
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      });
    }
  });

  revalidatePath("/tickets");
  return { ok: true as const, count: before.length };
}

// ============================================================
// Ticket checklist
// ============================================================

export async function toggleChecklistItemAction(itemId: string, done: boolean) {
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  const [item] = await db
    .select()
    .from(s.ticketChecklistItems)
    .where(
      and(eq(s.ticketChecklistItems.orgId, session.orgId), eq(s.ticketChecklistItems.id, itemId)),
    )
    .limit(1);
  if (!item) return { ok: false as const, error: "item not found" };

  await db.transaction(async (tx) => {
    await tx
      .update(s.ticketChecklistItems)
      .set({
        done,
        byEngineerId: done ? session.engineerId : null,
        at: done ? new Date() : null,
      })
      .where(
        and(eq(s.ticketChecklistItems.orgId, session.orgId), eq(s.ticketChecklistItems.id, itemId)),
      );
    await tx.insert(s.auditLog).values({
      orgId: session.orgId,
      actorEngineerId: session.engineerId,
      actorUserId: session.userId,
      action: done ? "ticket.checklist.complete" : "ticket.checklist.reopen",
      entityType: "checklist_item",
      entityId: itemId,
      before: { done: item.done },
      after: { done },
      notes: item.text,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
  });

  revalidatePath(`/tickets/${item.ticketId}`);
  return { ok: true as const };
}

// ============================================================
// Qualifications
// ============================================================

export async function signOffQualificationAction(qualId: string) {
  await requireOrgRole(["admin", "member"]);
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  const [before] = await db
    .select()
    .from(s.qualifications)
    .where(and(eq(s.qualifications.orgId, session.orgId), eq(s.qualifications.id, qualId)))
    .limit(1);
  if (!before) return { ok: false as const, error: "qualification not found" };

  await db.transaction(async (tx) => {
    await tx
      .update(s.qualifications)
      .set({
        state: "qualified",
        signedOffByEngineerId: session.engineerId,
        signedOffAt: new Date(),
      })
      .where(and(eq(s.qualifications.orgId, session.orgId), eq(s.qualifications.id, qualId)));
    await tx.insert(s.auditLog).values({
      orgId: session.orgId,
      actorEngineerId: session.engineerId,
      actorUserId: session.userId,
      action: "qualification.sign_off",
      entityType: "qualification",
      entityId: qualId,
      before: { state: before.state, signedOffByEngineerId: before.signedOffByEngineerId },
      after: { state: "qualified", signedOffByEngineerId: session.engineerId },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
  });

  revalidatePath("/qualifications");
  revalidatePath("/compatibility");
  revalidatePath(`/components/${before.componentId}`);
  revalidatePath(`/platforms/${before.platformId}`);
  return { ok: true as const };
}

// ============================================================
// Campaigns
// ============================================================

export async function setCampaignStatusAction(
  campaignId: string,
  status: "planning" | "active" | "blocked" | "passed" | "failed" | "deferred",
) {
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  const [before] = await db
    .select()
    .from(s.qualificationCampaigns)
    .where(
      and(
        eq(s.qualificationCampaigns.orgId, session.orgId),
        eq(s.qualificationCampaigns.id, campaignId),
      ),
    )
    .limit(1);
  if (!before) return { ok: false as const, error: "campaign not found" };

  await db.transaction(async (tx) => {
    await tx
      .update(s.qualificationCampaigns)
      .set({
        status,
        completedAt:
          status === "passed" || status === "failed" ? new Date() : before.completedAt,
      })
      .where(
        and(
          eq(s.qualificationCampaigns.orgId, session.orgId),
          eq(s.qualificationCampaigns.id, campaignId),
        ),
      );
    await tx.insert(s.auditLog).values({
      orgId: session.orgId,
      actorEngineerId: session.engineerId,
      actorUserId: session.userId,
      action: `campaign.status.${status}`,
      entityType: "campaign",
      entityId: campaignId,
      before: { status: before.status },
      after: { status },
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
  });

  revalidatePath("/qualifications");
  revalidatePath(`/qualifications/${campaignId}`);
  return { ok: true as const };
}

// ============================================================
// Firmware (admin-only)
// ============================================================

export async function scheduleFirmwareDeployAction(firmwareId: string) {
  await requireOrgRole(["admin"]);
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  const [fw] = await db
    .select()
    .from(s.firmwareEntries)
    .where(and(eq(s.firmwareEntries.orgId, session.orgId), eq(s.firmwareEntries.id, firmwareId)))
    .limit(1);
  if (!fw) return { ok: false as const, error: "firmware not found" };

  await db.insert(s.auditLog).values({
    orgId: session.orgId,
    actorEngineerId: session.engineerId,
    actorUserId: session.userId,
    action: "firmware.schedule_deploy",
    entityType: "firmware",
    entityId: firmwareId,
    before: null,
    after: {
      version: fw.latestVersion,
      appliesTo: fw.appliesTo,
      scheduledFor: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    },
    notes: `Scheduled deploy of ${fw.name} → ${fw.latestVersion}`,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  revalidatePath("/firmware");
  return { ok: true as const, scheduled: fw.name };
}

// ============================================================
// Server actions: power cycle (admin-only)
// ============================================================

export async function powerCycleServerAction(serverId: string) {
  await requireOrgRole(["admin"]);
  const session = await requireActorEngineer();
  const meta = requestMeta();
  const db = await getDbReady();

  const [srv] = await db
    .select()
    .from(s.servers)
    .where(and(eq(s.servers.orgId, session.orgId), eq(s.servers.id, serverId)))
    .limit(1);
  if (!srv) return { ok: false as const, error: "server not found" };

  await db.transaction(async (tx) => {
    await tx
      .update(s.servers)
      .set({ lastBootAt: new Date() })
      .where(and(eq(s.servers.orgId, session.orgId), eq(s.servers.id, serverId)));
    await tx.insert(s.auditLog).values({
      orgId: session.orgId,
      actorEngineerId: session.engineerId,
      actorUserId: session.userId,
      action: "server.power_cycle",
      entityType: "server",
      entityId: serverId,
      before: { lastBootAt: srv.lastBootAt.toISOString() },
      after: { lastBootAt: new Date().toISOString() },
      notes: "Power cycled via Blyber UI",
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });
  });

  revalidatePath(`/inventory/${serverId}`);
  revalidatePath("/inventory");
  return { ok: true as const };
}

// ============================================================
// KB
// ============================================================

export async function incrementKbViewsAction(articleId: string) {
  const session = await requireActorEngineer();
  const db = await getDbReady();
  await db
    .update(s.kbArticles)
    .set({ views: sql`${s.kbArticles.views} + 1` })
    .where(and(eq(s.kbArticles.orgId, session.orgId), eq(s.kbArticles.id, articleId)));
  return { ok: true as const };
}
