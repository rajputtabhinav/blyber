/**
 * Reusable seed routine that inserts demo data into a single org.
 *
 * The only caller today is the CLI (`npm run db:seed` → db/seed.ts).
 * The function is kept org-parametric so it can be reused later when
 * an admin UI adds a "load demo data" button or when real auth lands
 * and new orgs want a starter dataset.
 *
 * IDs from lib/data/* (eng-01, BLY-1247, SVR-00123, etc.) are inserted
 * verbatim — globally unique by construction. The org_id column on
 * every row carries the tenant boundary; IDs are not prefixed.
 *
 * Idempotency: callers must ensure the org doesn't already have data.
 * `db/seed.ts` short-circuits on `organizations.demo_seeded`.
 */

import type { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as s from "./schema";

import { engineers as seedEngineers } from "../lib/data/engineers";
import { racks as seedRacks } from "../lib/data/racks";
import { platforms as seedPlatforms, derivePlatformId } from "../lib/data/platforms";
import { catalog as seedCatalog } from "../lib/data/catalog";
import { componentInstances as seedInstances } from "../lib/data/componentInstances";
import { servers as seedServers } from "../lib/data/servers";
import {
  tickets as seedTickets,
  timelineFor1247,
  checklistFor1247,
} from "../lib/data/tickets";
import { firmware as seedFirmware } from "../lib/data/firmware";
import { kbArticles as seedKbArticles } from "../lib/data/kb";
import { rmaItems as seedRma } from "../lib/data/rma";
import { testPlans as seedPlans } from "../lib/data/plans";
import { qualifications as seedQuals, campaigns as seedCamps } from "../lib/data/qualifications";
import { validationRuns as seedRuns } from "../lib/data/reports";

type Db = ReturnType<typeof drizzle<typeof s>>;

function toDate(iso: string | undefined | null): Date | null {
  if (!iso) return null;
  return new Date(iso);
}

export interface SeedOptions {
  /** Target organization to seed into. Stamped on every row. */
  orgId: string;
  /**
   * Optional external user id to link to the first engineer (eng-01).
   * Used by db/seed.ts so the demo user resolves to a real engineer
   * via `requireActorEngineer()` without lazy-create.
   */
  actorUserId?: string;
}

/**
 * Seed the demo dataset into a single org. Inserts ~150 rows across
 * 14 tables. Will throw on FK violation if the demo org doesn't
 * already exist — db/seed.ts creates it before calling this.
 */
export async function seedAll(db: Db, { orgId, actorUserId }: SeedOptions) {
  await db.insert(s.engineers).values(
    seedEngineers.map((e, idx) => ({
      id: e.id,
      orgId,
      // Link the first engineer (eng-01) to the seed's actorUserId so
      // requireActorEngineer() resolves immediately without lazy-create.
      externalUserId: idx === 0 && actorUserId ? actorUserId : null,
      name: e.name,
      initials: e.initials,
      email: e.email,
      team: e.team,
      role: e.role,
      activeTickets: e.activeTickets,
      resolvedThisWeek: e.resolvedThisWeek,
      workload: e.workload,
      status: e.status,
      shift: e.shift ?? null,
      joinedAt: new Date(e.joinedISO),
    })),
  );

  await db.insert(s.racks).values(
    seedRacks.map((r) => ({
      id: r.id,
      orgId,
      name: r.name,
      site: r.site,
      zone: r.zone,
      height: r.height,
      utilizationPct: r.utilizationPct,
      powerUsedKw: r.powerUsedKW,
      powerTotalKw: r.powerTotalKW,
      intakeC: r.intakeC,
      exhaustC: r.exhaustC,
    })),
  );

  await db.insert(s.platforms).values(
    seedPlatforms.map((p) => ({
      id: p.id,
      orgId,
      vendor: p.vendor,
      family: p.family ?? null,
      name: p.name,
      generation: p.generation,
      ruHeight: p.ruHeight,
      cooling: p.cooling,
      socketCount: p.socketCount,
      maxDimms: p.maxDimms,
      maxGpus: p.maxGpus,
      maxPsuW: p.maxPsuW ?? null,
      defaultBiosFamily: p.defaultBiosFamily ?? null,
      notes: p.notes ?? null,
    })),
  );

  await db.insert(s.components).values(
    seedCatalog.map((c) => ({
      id: c.id,
      orgId,
      kind: c.kind,
      vendor: c.vendor,
      name: c.name,
      shortName: c.shortName ?? null,
      partNumber: c.partNumber ?? null,
      version: c.version ?? null,
      releasedAt: toDate(c.releasedISO),
      tdpW: c.tdpW ?? null,
      notes: c.notes ?? null,
    })),
  );

  await db.insert(s.servers).values(
    seedServers.map((sv) => ({
      id: sv.id,
      orgId,
      hostname: sv.hostname,
      vendor: sv.vendor,
      model: sv.model,
      generation: sv.generation,
      cpu: sv.cpu,
      cpuSockets: sv.cpuSockets,
      ramGb: sv.ramGB,
      ramConfig: sv.ramConfig,
      storage: sv.storage,
      nic: sv.nic,
      gpu: sv.gpu ?? null,
      serial: sv.serial,
      rackId: sv.rack,
      ruStart: sv.ruStart,
      ruHeight: sv.ruHeight,
      ownerEngineerId: sv.owner,
      status: sv.status,
      thermalC: sv.thermalC,
      powerW: sv.powerW,
      biosVersion: sv.biosVersion,
      bmcVersion: sv.bmcVersion,
      lastBootAt: new Date(sv.lastBootISO),
      uptimeDays: sv.uptimeDays,
      notes: sv.notes ?? null,
      platformId: sv.platformId ?? derivePlatformId(sv) ?? null,
    })),
  );

  await db.insert(s.componentInstances).values(
    seedInstances.map((i) => ({
      id: i.id,
      orgId,
      componentId: i.componentId,
      serial: i.serial,
      receivedAt: new Date(i.receivedISO),
      state: i.state,
      currentServerId: i.currentServerId ?? null,
      slot: i.slot ?? null,
      installedAt: toDate(i.installedAtISO),
      installedByEngineerId: i.installedByEngineerId ?? null,
      notes: i.notes ?? null,
    })),
  );

  await db.insert(s.tickets).values(
    seedTickets.map((t) => ({
      id: t.id,
      orgId,
      title: t.title,
      serverId: t.serverId,
      rackId: t.rack,
      severity: t.severity,
      status: t.status,
      assigneeId: t.assigneeId,
      reporterId: t.reporterId,
      createdAt: new Date(t.createdISO),
      updatedAt: new Date(t.updatedISO),
      slaDueAt: new Date(t.slaDueISO),
      slaState: t.slaState,
      tags: t.tags,
      description: t.description ?? null,
      watchers: t.watchers ?? [],
      relatedIds: t.relatedIds ?? [],
    })),
  );

  await db.insert(s.ticketTimelineEntries).values(
    timelineFor1247.map((e) => ({
      id: e.id,
      orgId,
      ticketId: e.ticketId,
      kind: e.kind,
      actorId: e.actorId,
      at: new Date(e.atISO),
      text: e.text,
      detail: e.detail ?? null,
    })),
  );

  await db.insert(s.ticketChecklistItems).values(
    checklistFor1247.map((c) => ({
      id: c.id,
      orgId,
      ticketId: c.ticketId,
      text: c.text,
      done: c.done,
      byEngineerId: c.by ?? null,
      at: toDate(c.atISO),
    })),
  );

  await db.insert(s.firmwareEntries).values(
    seedFirmware.map((f) => ({
      id: f.id,
      orgId,
      name: f.name,
      vendor: f.vendor,
      category: f.category,
      currentVersion: f.currentVersion,
      latestVersion: f.latestVersion,
      releasedAt: new Date(f.releasedISO),
      appliesTo: f.appliesTo,
      fileSizeMb: f.fileSizeMB,
      critical: f.critical,
      state: f.state,
    })),
  );

  await db.insert(s.kbArticles).values(
    seedKbArticles.map((a) => ({
      id: a.id,
      orgId,
      title: a.title,
      category: a.category,
      authorId: a.authorId,
      updatedAt: new Date(a.updatedISO),
      views: a.views,
      snippet: a.snippet,
      tags: a.tags,
    })),
  );

  await db.insert(s.rmaItems).values(
    seedRma.map((r) => ({
      id: r.id,
      orgId,
      serverId: r.serverId,
      componentName: r.componentName,
      vendor: r.vendor,
      reason: r.reason,
      daysOpen: r.daysOpen,
      costUsd: r.costUSD,
      status: r.status,
      openedAt: new Date(r.openedISO),
      rmaNumber: r.rmaNumber ?? null,
    })),
  );

  await db.insert(s.testPlans).values(
    seedPlans.map((p) => ({
      id: p.id,
      orgId,
      name: p.name,
      version: p.version,
      scope: p.scope,
      appliesToKinds: (p.appliesToKinds as string[] | undefined) ?? [],
      appliesToPlatforms: p.appliesToPlatforms ?? [],
      description: p.description ?? null,
      steps: p.steps,
      acceptance: p.acceptance,
      expectedDurationMin: p.expectedDurationMin,
      requiredEquipment: p.requiredEquipment ?? [],
      requiredSkill: p.requiredSkill ?? null,
      ownerEngineerId: p.ownerEngineerId ?? null,
      createdAt: new Date(p.createdISO),
      updatedAt: new Date(p.updatedISO),
      status: p.status,
    })),
  );

  await db.insert(s.qualifications).values(
    seedQuals.map((q) => ({
      id: q.id,
      orgId,
      componentId: q.componentId,
      platformId: q.platformId,
      state: q.state,
      signedOffByEngineerId: q.signedOffByEngineerId ?? null,
      signedOffAt: toDate(q.signedOffISO),
      expiresAt: toDate(q.expiresISO),
      supportingRunIds: q.supportingRunIds,
      campaignId: q.campaignId ?? null,
      limitations: q.limitations ?? null,
      notes: q.notes ?? null,
    })),
  );

  await db.insert(s.qualificationCampaigns).values(
    seedCamps.map((c) => ({
      id: c.id,
      orgId,
      name: c.name,
      componentId: c.componentId,
      platformId: c.platformId,
      ownerEngineerId: c.ownerEngineerId,
      status: c.status,
      createdAt: new Date(c.createdISO),
      targetCompletionAt: toDate(c.targetCompletionISO),
      completedAt: toDate(c.completedISO),
      testPlans: c.testPlans,
      testPlanIds: c.testPlanIds ?? [],
      runIds: c.runIds,
      resultSummary: c.resultSummary ?? null,
      notes: c.notes ?? null,
    })),
  );

  await db.insert(s.validationRuns).values(
    seedRuns.map((r) => ({
      id: r.id,
      orgId,
      type: r.type,
      serverId: r.serverId,
      platformId: r.platformId ?? null,
      campaignId: r.campaignId ?? null,
      testPlanId: r.testPlanId ?? null,
      componentManifest: r.componentManifest ?? [],
      measurements: r.measurements ?? [],
      artifacts: r.artifacts ?? [],
      startedAt: new Date(r.startedISO),
      durationMin: r.durationMin,
      result: r.result,
      engineerId: r.engineerId,
      passCount: r.passCount,
      failCount: r.failCount,
      notes: r.notes ?? null,
    })),
  );

  await db.insert(s.auditLog).values({
    orgId,
    actorUserId: actorUserId ?? null,
    actorEngineerId: null,
    action: "seed.completed",
    entityType: "system",
    entityId: "seed",
    before: null,
    after: { seededAt: new Date().toISOString(), orgId },
    notes: "Demo data seeded.",
  });

  await db
    .update(s.organizations)
    .set({ demoSeeded: true })
    .where(eq(s.organizations.id, orgId));
}
