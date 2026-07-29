/**
 * Server-side data access for Blyber — org-scoped.
 *
 * Every read filters by the current user's org_id, sourced from the
 * Clerk session via `requireOrgId()`. There is no parameter for org —
 * the request context decides. This means:
 *   - Pages that call these never need to worry about leaking another
 *     org's data; the chokepoint is here.
 *   - These functions throw `AuthError` if called outside a logged-in
 *     request — only call them from server components / server actions.
 *
 * Functions that take a sub-ID (e.g. `getTicket(id)`) still filter by
 * org_id internally so that a leaked URL with another org's ticket id
 * returns undefined instead of the foreign row.
 */

import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDbReady, schema as s } from "@/db/client";
import { requireOrgId } from "@/lib/auth";
import type {
  Component,
  ComponentInstance,
  Engineer,
  FirmwareEntry,
  KBArticle,
  Platform,
  Qualification,
  QualificationCampaign,
  Rack,
  RmaItem,
  ServerNode,
  TestPlan,
  Ticket,
  TimelineEntry,
  ChecklistItem,
  ValidationRun,
} from "@/lib/types";

const iso = (d: Date | null | undefined): string | undefined =>
  d ? new Date(d).toISOString() : undefined;
const isoReq = (d: Date): string => new Date(d).toISOString();

// ============================================================
// Engineers
// ============================================================
function rowToEngineer(r: typeof s.engineers.$inferSelect): Engineer {
  return {
    id: r.id,
    name: r.name,
    initials: r.initials,
    email: r.email,
    team: r.team as Engineer["team"],
    role: r.role,
    activeTickets: r.activeTickets,
    resolvedThisWeek: r.resolvedThisWeek,
    workload: r.workload,
    status: r.status as Engineer["status"],
    shift: r.shift ?? undefined,
    joinedISO: isoReq(r.joinedAt),
  };
}
export async function listEngineers(): Promise<Engineer[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.engineers)
    .where(eq(s.engineers.orgId, orgId))
    .orderBy(asc(s.engineers.id));
  return rows.map(rowToEngineer);
}
export async function getEngineer(id: string): Promise<Engineer | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.engineers)
    .where(and(eq(s.engineers.orgId, orgId), eq(s.engineers.id, id)))
    .limit(1);
  return rows[0] ? rowToEngineer(rows[0]) : undefined;
}

// ============================================================
// Racks
// ============================================================
function rowToRack(r: typeof s.racks.$inferSelect): Rack {
  return {
    id: r.id,
    name: r.name,
    site: r.site,
    zone: r.zone,
    height: r.height,
    utilizationPct: r.utilizationPct,
    powerUsedKW: r.powerUsedKw,
    powerTotalKW: r.powerTotalKw,
    intakeC: r.intakeC,
    exhaustC: r.exhaustC,
  };
}
export async function listRacks(): Promise<Rack[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.racks)
    .where(eq(s.racks.orgId, orgId))
    .orderBy(asc(s.racks.id));
  return rows.map(rowToRack);
}
export async function getRack(id: string): Promise<Rack | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.racks)
    .where(and(eq(s.racks.orgId, orgId), eq(s.racks.id, id)))
    .limit(1);
  return rows[0] ? rowToRack(rows[0]) : undefined;
}

// ============================================================
// Platforms
// ============================================================
function rowToPlatform(r: typeof s.platforms.$inferSelect): Platform {
  return {
    id: r.id,
    vendor: r.vendor as Platform["vendor"],
    family: r.family ?? undefined,
    name: r.name,
    generation: r.generation,
    ruHeight: r.ruHeight,
    cooling: r.cooling as Platform["cooling"],
    socketCount: r.socketCount,
    maxDimms: r.maxDimms,
    maxGpus: r.maxGpus,
    maxPsuW: r.maxPsuW ?? undefined,
    defaultBiosFamily: r.defaultBiosFamily ?? undefined,
    notes: r.notes ?? undefined,
  };
}
export async function listPlatforms(): Promise<Platform[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.platforms)
    .where(eq(s.platforms.orgId, orgId))
    .orderBy(asc(s.platforms.id));
  return rows.map(rowToPlatform);
}
export async function getPlatform(id: string): Promise<Platform | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.platforms)
    .where(and(eq(s.platforms.orgId, orgId), eq(s.platforms.id, id)))
    .limit(1);
  return rows[0] ? rowToPlatform(rows[0]) : undefined;
}

// ============================================================
// Components catalog
// ============================================================
function rowToComponent(r: typeof s.components.$inferSelect): Component {
  return {
    id: r.id,
    kind: r.kind as Component["kind"],
    vendor: r.vendor,
    name: r.name,
    shortName: r.shortName ?? undefined,
    partNumber: r.partNumber ?? undefined,
    version: r.version ?? undefined,
    releasedISO: iso(r.releasedAt),
    tdpW: r.tdpW ?? undefined,
    notes: r.notes ?? undefined,
  };
}
export async function listComponents(): Promise<Component[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.components)
    .where(eq(s.components.orgId, orgId))
    .orderBy(asc(s.components.id));
  return rows.map(rowToComponent);
}
export async function getComponent(id: string): Promise<Component | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.components)
    .where(and(eq(s.components.orgId, orgId), eq(s.components.id, id)))
    .limit(1);
  return rows[0] ? rowToComponent(rows[0]) : undefined;
}

// ============================================================
// Component instances
// ============================================================
function rowToInstance(r: typeof s.componentInstances.$inferSelect): ComponentInstance {
  return {
    id: r.id,
    componentId: r.componentId,
    serial: r.serial,
    receivedISO: isoReq(r.receivedAt),
    state: r.state as ComponentInstance["state"],
    currentServerId: r.currentServerId ?? undefined,
    slot: r.slot ?? undefined,
    installedAtISO: iso(r.installedAt),
    installedByEngineerId: r.installedByEngineerId ?? undefined,
    notes: r.notes ?? undefined,
  };
}
export async function listInstances(): Promise<ComponentInstance[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.componentInstances)
    .where(eq(s.componentInstances.orgId, orgId));
  return rows.map(rowToInstance);
}
export async function listInstancesByServer(serverId: string): Promise<ComponentInstance[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.componentInstances)
    .where(
      and(
        eq(s.componentInstances.orgId, orgId),
        eq(s.componentInstances.currentServerId, serverId),
      ),
    );
  return rows.map(rowToInstance);
}
export async function listInstancesByComponent(componentId: string): Promise<ComponentInstance[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.componentInstances)
    .where(
      and(
        eq(s.componentInstances.orgId, orgId),
        eq(s.componentInstances.componentId, componentId),
      ),
    );
  return rows.map(rowToInstance);
}

// ============================================================
// Servers
// ============================================================
function rowToServer(r: typeof s.servers.$inferSelect): ServerNode {
  return {
    id: r.id,
    hostname: r.hostname,
    vendor: r.vendor as ServerNode["vendor"],
    model: r.model,
    generation: r.generation,
    cpu: r.cpu,
    cpuSockets: r.cpuSockets,
    ramGB: r.ramGb,
    ramConfig: r.ramConfig,
    storage: r.storage,
    nic: r.nic,
    gpu: r.gpu ?? undefined,
    serial: r.serial,
    rack: r.rackId,
    ruStart: r.ruStart,
    ruHeight: r.ruHeight,
    owner: r.ownerEngineerId,
    status: r.status as ServerNode["status"],
    thermalC: r.thermalC,
    powerW: r.powerW,
    biosVersion: r.biosVersion,
    bmcVersion: r.bmcVersion,
    lastBootISO: isoReq(r.lastBootAt),
    uptimeDays: r.uptimeDays,
    notes: r.notes ?? undefined,
    platformId: r.platformId ?? undefined,
  };
}
export async function listServers(): Promise<ServerNode[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.servers)
    .where(eq(s.servers.orgId, orgId))
    .orderBy(asc(s.servers.id));
  return rows.map(rowToServer);
}
export async function getServer(id: string): Promise<ServerNode | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.servers)
    .where(and(eq(s.servers.orgId, orgId), eq(s.servers.id, id)))
    .limit(1);
  return rows[0] ? rowToServer(rows[0]) : undefined;
}

// ============================================================
// Tickets
// ============================================================
function rowToTicket(r: typeof s.tickets.$inferSelect): Ticket {
  return {
    id: r.id,
    title: r.title,
    serverId: r.serverId,
    rack: r.rackId,
    severity: r.severity as Ticket["severity"],
    status: r.status as Ticket["status"],
    assigneeId: r.assigneeId,
    reporterId: r.reporterId,
    createdISO: isoReq(r.createdAt),
    updatedISO: isoReq(r.updatedAt),
    slaDueISO: isoReq(r.slaDueAt),
    slaState: r.slaState as Ticket["slaState"],
    tags: (r.tags as string[]) ?? [],
    description: r.description ?? undefined,
    watchers: (r.watchers as string[] | null) ?? undefined,
    relatedIds: (r.relatedIds as string[] | null) ?? undefined,
  };
}
export async function listTickets(): Promise<Ticket[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.tickets)
    .where(eq(s.tickets.orgId, orgId))
    .orderBy(desc(s.tickets.updatedAt));
  return rows.map(rowToTicket);
}
export async function getTicket(id: string): Promise<Ticket | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.tickets)
    .where(and(eq(s.tickets.orgId, orgId), eq(s.tickets.id, id)))
    .limit(1);
  return rows[0] ? rowToTicket(rows[0]) : undefined;
}
export async function listTicketsByServer(serverId: string): Promise<Ticket[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.tickets)
    .where(and(eq(s.tickets.orgId, orgId), eq(s.tickets.serverId, serverId)));
  return rows.map(rowToTicket);
}

// ============================================================
// Ticket timeline + checklist
// ============================================================
export async function listTimelineForTicket(ticketId: string): Promise<TimelineEntry[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.ticketTimelineEntries)
    .where(
      and(
        eq(s.ticketTimelineEntries.orgId, orgId),
        eq(s.ticketTimelineEntries.ticketId, ticketId),
      ),
    )
    .orderBy(asc(s.ticketTimelineEntries.at));
  return rows.map((r) => ({
    id: r.id,
    ticketId: r.ticketId,
    kind: r.kind as TimelineEntry["kind"],
    actorId: r.actorId,
    atISO: isoReq(r.at),
    text: r.text,
    detail: r.detail ?? undefined,
  }));
}
export async function listChecklistForTicket(ticketId: string): Promise<ChecklistItem[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.ticketChecklistItems)
    .where(
      and(
        eq(s.ticketChecklistItems.orgId, orgId),
        eq(s.ticketChecklistItems.ticketId, ticketId),
      ),
    )
    .orderBy(asc(s.ticketChecklistItems.id));
  return rows.map((r) => ({
    id: r.id,
    ticketId: r.ticketId,
    text: r.text,
    done: r.done,
    by: r.byEngineerId ?? undefined,
    atISO: iso(r.at),
  }));
}

// ============================================================
// Firmware
// ============================================================
function rowToFirmware(r: typeof s.firmwareEntries.$inferSelect): FirmwareEntry {
  return {
    id: r.id,
    name: r.name,
    vendor: r.vendor,
    category: r.category as FirmwareEntry["category"],
    currentVersion: r.currentVersion,
    latestVersion: r.latestVersion,
    releasedISO: isoReq(r.releasedAt),
    appliesTo: r.appliesTo,
    fileSizeMB: r.fileSizeMb,
    critical: r.critical,
    state: r.state as FirmwareEntry["state"],
  };
}
export async function listFirmware(): Promise<FirmwareEntry[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.firmwareEntries)
    .where(eq(s.firmwareEntries.orgId, orgId))
    .orderBy(asc(s.firmwareEntries.id));
  return rows.map(rowToFirmware);
}

// ============================================================
// KB
// ============================================================
function rowToKb(r: typeof s.kbArticles.$inferSelect): KBArticle {
  return {
    id: r.id,
    title: r.title,
    category: r.category as KBArticle["category"],
    authorId: r.authorId,
    updatedISO: isoReq(r.updatedAt),
    views: r.views,
    snippet: r.snippet,
    tags: (r.tags as string[]) ?? [],
  };
}
export async function listKbArticles(): Promise<KBArticle[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.kbArticles)
    .where(eq(s.kbArticles.orgId, orgId))
    .orderBy(desc(s.kbArticles.updatedAt));
  return rows.map(rowToKb);
}

// ============================================================
// RMA
// ============================================================
function rowToRma(r: typeof s.rmaItems.$inferSelect): RmaItem {
  return {
    id: r.id,
    serverId: r.serverId,
    componentName: r.componentName,
    vendor: r.vendor,
    reason: r.reason,
    daysOpen: r.daysOpen,
    costUSD: r.costUsd,
    status: r.status as RmaItem["status"],
    openedISO: isoReq(r.openedAt),
    rmaNumber: r.rmaNumber ?? undefined,
  };
}
export async function listRma(): Promise<RmaItem[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.rmaItems)
    .where(eq(s.rmaItems.orgId, orgId))
    .orderBy(desc(s.rmaItems.openedAt));
  return rows.map(rowToRma);
}
export async function listRmaByServer(serverId: string): Promise<RmaItem[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.rmaItems)
    .where(and(eq(s.rmaItems.orgId, orgId), eq(s.rmaItems.serverId, serverId)));
  return rows.map(rowToRma);
}

// ============================================================
// Test plans
// ============================================================
function rowToPlan(r: typeof s.testPlans.$inferSelect): TestPlan {
  return {
    id: r.id,
    name: r.name,
    version: r.version,
    scope: r.scope as TestPlan["scope"],
    appliesToKinds: (r.appliesToKinds as TestPlan["appliesToKinds"]) ?? undefined,
    appliesToPlatforms: (r.appliesToPlatforms as string[] | null) ?? undefined,
    description: r.description ?? undefined,
    steps: (r.steps as TestPlan["steps"]) ?? [],
    acceptance: (r.acceptance as TestPlan["acceptance"]) ?? [],
    expectedDurationMin: r.expectedDurationMin,
    requiredEquipment: (r.requiredEquipment as string[] | null) ?? undefined,
    requiredSkill: r.requiredSkill ?? undefined,
    ownerEngineerId: r.ownerEngineerId ?? undefined,
    createdISO: isoReq(r.createdAt),
    updatedISO: isoReq(r.updatedAt),
    status: r.status as TestPlan["status"],
  };
}
export async function listTestPlans(): Promise<TestPlan[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.testPlans)
    .where(eq(s.testPlans.orgId, orgId))
    .orderBy(asc(s.testPlans.id));
  return rows.map(rowToPlan);
}
export async function getTestPlan(id: string): Promise<TestPlan | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.testPlans)
    .where(and(eq(s.testPlans.orgId, orgId), eq(s.testPlans.id, id)))
    .limit(1);
  return rows[0] ? rowToPlan(rows[0]) : undefined;
}

// ============================================================
// Qualifications + campaigns
// ============================================================
function rowToQual(r: typeof s.qualifications.$inferSelect): Qualification {
  return {
    id: r.id,
    componentId: r.componentId,
    platformId: r.platformId,
    state: r.state as Qualification["state"],
    signedOffByEngineerId: r.signedOffByEngineerId ?? undefined,
    signedOffISO: iso(r.signedOffAt),
    expiresISO: iso(r.expiresAt),
    supportingRunIds: (r.supportingRunIds as string[]) ?? [],
    campaignId: r.campaignId ?? undefined,
    limitations: r.limitations ?? undefined,
    notes: r.notes ?? undefined,
  };
}
export async function listQualifications(): Promise<Qualification[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.qualifications)
    .where(eq(s.qualifications.orgId, orgId));
  return rows.map(rowToQual);
}
export async function listQualificationsByComponent(componentId: string): Promise<Qualification[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.qualifications)
    .where(and(eq(s.qualifications.orgId, orgId), eq(s.qualifications.componentId, componentId)));
  return rows.map(rowToQual);
}
export async function listQualificationsByPlatform(platformId: string): Promise<Qualification[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.qualifications)
    .where(and(eq(s.qualifications.orgId, orgId), eq(s.qualifications.platformId, platformId)));
  return rows.map(rowToQual);
}

function rowToCampaign(r: typeof s.qualificationCampaigns.$inferSelect): QualificationCampaign {
  return {
    id: r.id,
    name: r.name,
    componentId: r.componentId,
    platformId: r.platformId,
    ownerEngineerId: r.ownerEngineerId,
    status: r.status as QualificationCampaign["status"],
    createdISO: isoReq(r.createdAt),
    targetCompletionISO: iso(r.targetCompletionAt),
    completedISO: iso(r.completedAt),
    testPlans: (r.testPlans as string[]) ?? [],
    testPlanIds: (r.testPlanIds as string[] | null) ?? undefined,
    runIds: (r.runIds as string[]) ?? [],
    resultSummary: r.resultSummary ?? undefined,
    notes: r.notes ?? undefined,
  };
}
export async function listCampaigns(): Promise<QualificationCampaign[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.qualificationCampaigns)
    .where(eq(s.qualificationCampaigns.orgId, orgId));
  return rows.map(rowToCampaign);
}
export async function getCampaign(id: string): Promise<QualificationCampaign | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.qualificationCampaigns)
    .where(
      and(eq(s.qualificationCampaigns.orgId, orgId), eq(s.qualificationCampaigns.id, id)),
    )
    .limit(1);
  return rows[0] ? rowToCampaign(rows[0]) : undefined;
}

// ============================================================
// Validation runs
// ============================================================
function rowToRun(r: typeof s.validationRuns.$inferSelect): ValidationRun {
  return {
    id: r.id,
    type: r.type as ValidationRun["type"],
    serverId: r.serverId,
    platformId: r.platformId ?? undefined,
    campaignId: r.campaignId ?? undefined,
    testPlanId: r.testPlanId ?? undefined,
    componentManifest: (r.componentManifest as ValidationRun["componentManifest"]) ?? undefined,
    measurements: (r.measurements as ValidationRun["measurements"]) ?? undefined,
    artifacts: (r.artifacts as ValidationRun["artifacts"]) ?? undefined,
    startedISO: isoReq(r.startedAt),
    durationMin: r.durationMin,
    result: r.result as ValidationRun["result"],
    engineerId: r.engineerId,
    passCount: r.passCount,
    failCount: r.failCount,
    notes: r.notes ?? undefined,
  };
}
export async function listRuns(): Promise<ValidationRun[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.validationRuns)
    .where(eq(s.validationRuns.orgId, orgId))
    .orderBy(desc(s.validationRuns.startedAt));
  return rows.map(rowToRun);
}
export async function getRun(id: string): Promise<ValidationRun | undefined> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.validationRuns)
    .where(and(eq(s.validationRuns.orgId, orgId), eq(s.validationRuns.id, id)))
    .limit(1);
  return rows[0] ? rowToRun(rows[0]) : undefined;
}
export async function getRuns(ids: string[]): Promise<ValidationRun[]> {
  if (ids.length === 0) return [];
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.validationRuns)
    .where(and(eq(s.validationRuns.orgId, orgId), inArray(s.validationRuns.id, ids)));
  return rows.map(rowToRun);
}
export async function listRunsByServer(serverId: string): Promise<ValidationRun[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.validationRuns)
    .where(and(eq(s.validationRuns.orgId, orgId), eq(s.validationRuns.serverId, serverId)))
    .orderBy(desc(s.validationRuns.startedAt));
  return rows.map(rowToRun);
}
export async function listRunsByPlan(testPlanId: string): Promise<ValidationRun[]> {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.validationRuns)
    .where(and(eq(s.validationRuns.orgId, orgId), eq(s.validationRuns.testPlanId, testPlanId)))
    .orderBy(asc(s.validationRuns.startedAt));
  return rows.map(rowToRun);
}

// ============================================================
// Audit log
// ============================================================
export async function listAuditLog(limit = 200) {
  const orgId = await requireOrgId();
  const db = await getDbReady();
  const rows = await db
    .select()
    .from(s.auditLog)
    .where(eq(s.auditLog.orgId, orgId))
    .orderBy(desc(s.auditLog.at))
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    atISO: isoReq(r.at),
    actorId: r.actorEngineerId,         // legacy name kept so /admin/audit table doesn't change
    actorUserId: r.actorUserId,
    action: r.action,
    entityType: r.entityType,
    entityId: r.entityId,
    before: r.before,
    after: r.after,
    notes: r.notes ?? undefined,
  }));
}

// ============================================================
// Bulk dashboard loader
// ============================================================
export async function loadAllForDashboard() {
  const [servers, racks, tickets, engineers, firmware, runs] = await Promise.all([
    listServers(),
    listRacks(),
    listTickets(),
    listEngineers(),
    listFirmware(),
    listRuns(),
  ]);
  return { servers, racks, tickets, engineers, firmware, runs };
}
