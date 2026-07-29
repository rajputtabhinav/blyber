/**
 * Drizzle schema for Blyber's persistent store — multi-tenant.
 *
 * Tenant model
 * ------------
 * Every domain table has `org_id text not null references organizations(id)
 * on delete cascade`. The query layer (`lib/db-queries`) filters by the
 * caller's org_id on every read; the mutation layer (`lib/db-mutations`)
 * stamps it on every write. There is no cross-org access path through
 * the regular app surface; admin tools that need it live behind a
 * separate namespace.
 *
 * Identity model (Clerk mirror)
 * -----------------------------
 *   users          — one row per Clerk user_xxx (mirror, synced by webhook)
 *   organizations  — one row per Clerk org_xxx
 *   org_members    — (org_id, user_id) → role
 *   engineers      — per-org roster (the lab persona). Linked to a Clerk
 *                    user via `clerk_user_id` once that user accepts the
 *                    invite. Engineers can exist without a Clerk user
 *                    (e.g. an admin pre-creates a roster of teammates
 *                    or models a former employee).
 *
 * IDs
 * ---
 * Domain entity IDs (BLY-1247, SVR-00123, etc.) remain globally unique
 * text PKs. They are stamped with org_id but the PK is just `id` —
 * keeps FKs simple. New IDs minted at runtime should embed the org slug
 * to guarantee uniqueness across orgs (e.g. acme/BLY-1247).
 *
 * Indexes
 * -------
 * Every existing secondary index now prepends org_id so it stays
 * selective when there are many orgs.
 */

import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

// ===========================================================
// Auth / tenancy primitives (mirrors of Clerk objects)
// ===========================================================

export const users = pgTable("users", {
  id: text("id").primaryKey(),                       // user_xxx (Clerk)
  email: text("email").notNull(),
  name: text("name"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
});

export const organizations = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),                     // org_xxx (Clerk)
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    imageUrl: text("image_url"),
    plan: text("plan"),                              // future: "free" | "pro" | "enterprise"
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    /** Set to true after demo data has been seeded into this org. */
    demoSeeded: boolean("demo_seeded").notNull().default(false),
  },
  (t) => ({
    bySlug: index("orgs_by_slug").on(t.slug),
  }),
);

export const orgMembers = pgTable(
  "org_members",
  {
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),                    // "admin" | "member" | "viewer"
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.orgId, t.userId] }),
    byUser: index("orgm_by_user").on(t.userId),
  }),
);

// ===========================================================
// People (per-org roster) — optionally linked to an external auth
// identity (e.g. an SSO/Clerk/NextAuth user id) via externalUserId.
// ===========================================================
export const engineers = pgTable(
  "engineers",
  {
    id: text("id").primaryKey(),                      // eng-01 (per-org but globally unique)
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    externalUserId: text("external_user_id").unique(), // null = unlinked; matches users.id
    name: text("name").notNull(),
    initials: text("initials").notNull(),
    email: text("email").notNull(),
    team: text("team").notNull(),                     // Team enum
    role: text("role").notNull(),
    activeTickets: integer("active_tickets").notNull().default(0),
    resolvedThisWeek: integer("resolved_this_week").notNull().default(0),
    workload: integer("workload").notNull().default(0),
    status: text("status").notNull(),                 // online | away | offline
    shift: text("shift"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    byOrg: index("engineers_by_org").on(t.orgId),
    byExternalUser: index("engineers_by_external_user").on(t.externalUserId),
  }),
);

// ===========================================================
// Racks
// ===========================================================
export const racks = pgTable(
  "racks",
  {
    id: text("id").primaryKey(),                      // R-DC1-A07
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    site: text("site").notNull(),
    zone: text("zone").notNull(),
    height: integer("height").notNull(),
    utilizationPct: integer("utilization_pct").notNull(),
    powerUsedKw: doublePrecision("power_used_kw").notNull(),
    powerTotalKw: doublePrecision("power_total_kw").notNull(),
    intakeC: doublePrecision("intake_c").notNull(),
    exhaustC: doublePrecision("exhaust_c").notNull(),
  },
  (t) => ({
    byOrg: index("racks_by_org").on(t.orgId),
  }),
);

// ===========================================================
// Platforms (server model abstraction)
// ===========================================================
export const platforms = pgTable(
  "platforms",
  {
    id: text("id").primaryKey(),                      // tyrone-tc-gb200-nvl4
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    vendor: text("vendor").notNull(),
    family: text("family"),
    name: text("name").notNull(),
    generation: text("generation").notNull(),
    ruHeight: integer("ru_height").notNull(),
    cooling: text("cooling").notNull(),
    socketCount: integer("socket_count").notNull(),
    maxDimms: integer("max_dimms").notNull(),
    maxGpus: integer("max_gpus").notNull(),
    maxPsuW: integer("max_psu_w"),
    defaultBiosFamily: text("default_bios_family"),
    notes: text("notes"),
  },
  (t) => ({
    byOrg: index("platforms_by_org").on(t.orgId),
  }),
);

// ===========================================================
// Component catalog
// ===========================================================
export const components = pgTable(
  "components",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    vendor: text("vendor").notNull(),
    name: text("name").notNull(),
    shortName: text("short_name"),
    partNumber: text("part_number"),
    version: text("version"),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    tdpW: integer("tdp_w"),
    notes: text("notes"),
  },
  (t) => ({
    byOrgKind: index("components_by_org_kind").on(t.orgId, t.kind),
    byOrgVendor: index("components_by_org_vendor").on(t.orgId, t.vendor),
  }),
);

// ===========================================================
// Physical component instances (serial-tracked)
// ===========================================================
export const componentInstances = pgTable(
  "component_instances",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    componentId: text("component_id").notNull().references(() => components.id),
    serial: text("serial").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
    state: text("state").notNull(),
    currentServerId: text("current_server_id"),
    slot: text("slot"),
    installedAt: timestamp("installed_at", { withTimezone: true }),
    installedByEngineerId: text("installed_by_engineer_id").references(() => engineers.id),
    notes: text("notes"),
  },
  (t) => ({
    byOrgComponent: index("ci_by_org_component").on(t.orgId, t.componentId),
    byOrgServer: index("ci_by_org_server").on(t.orgId, t.currentServerId),
    byOrgState: index("ci_by_org_state").on(t.orgId, t.state),
    byOrgSerial: index("ci_by_org_serial").on(t.orgId, t.serial),
  }),
);

// ===========================================================
// Servers (chassis instances)
// ===========================================================
export const servers = pgTable(
  "servers",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    hostname: text("hostname").notNull(),
    vendor: text("vendor").notNull(),
    model: text("model").notNull(),
    generation: text("generation").notNull(),
    cpu: text("cpu").notNull(),
    cpuSockets: integer("cpu_sockets").notNull(),
    ramGb: integer("ram_gb").notNull(),
    ramConfig: text("ram_config").notNull(),
    storage: text("storage").notNull(),
    nic: text("nic").notNull(),
    gpu: text("gpu"),
    serial: text("serial").notNull(),
    rackId: text("rack_id").notNull().references(() => racks.id),
    ruStart: integer("ru_start").notNull(),
    ruHeight: integer("ru_height").notNull(),
    ownerEngineerId: text("owner_engineer_id").notNull().references(() => engineers.id),
    status: text("status").notNull(),
    thermalC: doublePrecision("thermal_c").notNull(),
    powerW: integer("power_w").notNull(),
    biosVersion: text("bios_version").notNull(),
    bmcVersion: text("bmc_version").notNull(),
    lastBootAt: timestamp("last_boot_at", { withTimezone: true }).notNull(),
    uptimeDays: integer("uptime_days").notNull(),
    notes: text("notes"),
    platformId: text("platform_id").references(() => platforms.id),
  },
  (t) => ({
    byOrgRack: index("servers_by_org_rack").on(t.orgId, t.rackId),
    byOrgStatus: index("servers_by_org_status").on(t.orgId, t.status),
    byOrgOwner: index("servers_by_org_owner").on(t.orgId, t.ownerEngineerId),
    byOrgPlatform: index("servers_by_org_platform").on(t.orgId, t.platformId),
    byOrgHostname: index("servers_by_org_hostname").on(t.orgId, t.hostname),
    byOrgSerial: index("servers_by_org_serial").on(t.orgId, t.serial),
  }),
);

// ===========================================================
// Tickets
// ===========================================================
export const tickets = pgTable(
  "tickets",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    serverId: text("server_id").notNull().references(() => servers.id),
    rackId: text("rack_id").notNull().references(() => racks.id),
    severity: text("severity").notNull(),
    status: text("status").notNull(),
    assigneeId: text("assignee_id").notNull().references(() => engineers.id),
    reporterId: text("reporter_id").notNull().references(() => engineers.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    slaDueAt: timestamp("sla_due_at", { withTimezone: true }).notNull(),
    slaState: text("sla_state").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    description: text("description"),
    watchers: jsonb("watchers").$type<string[]>().default([]),
    relatedIds: jsonb("related_ids").$type<string[]>().default([]),
  },
  (t) => ({
    byOrgServer: index("tickets_by_org_server").on(t.orgId, t.serverId),
    byOrgAssignee: index("tickets_by_org_assignee").on(t.orgId, t.assigneeId),
    byOrgSeverity: index("tickets_by_org_severity").on(t.orgId, t.severity),
    byOrgStatus: index("tickets_by_org_status").on(t.orgId, t.status),
  }),
);

export const ticketTimelineEntries = pgTable(
  "ticket_timeline_entries",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    ticketId: text("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    actorId: text("actor_id").notNull().references(() => engineers.id),
    at: timestamp("at", { withTimezone: true }).notNull(),
    text: text("text").notNull(),
    detail: text("detail"),
  },
  (t) => ({
    byOrgTicket: index("tl_by_org_ticket").on(t.orgId, t.ticketId),
  }),
);

export const ticketChecklistItems = pgTable(
  "ticket_checklist_items",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    ticketId: text("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    done: boolean("done").notNull().default(false),
    byEngineerId: text("by_engineer_id").references(() => engineers.id),
    at: timestamp("at", { withTimezone: true }),
  },
  (t) => ({
    byOrgTicket: index("cli_by_org_ticket").on(t.orgId, t.ticketId),
  }),
);

// ===========================================================
// Firmware repository
// ===========================================================
export const firmwareEntries = pgTable(
  "firmware_entries",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    vendor: text("vendor").notNull(),
    category: text("category").notNull(),
    currentVersion: text("current_version").notNull(),
    latestVersion: text("latest_version").notNull(),
    releasedAt: timestamp("released_at", { withTimezone: true }).notNull(),
    appliesTo: integer("applies_to").notNull(),
    fileSizeMb: integer("file_size_mb").notNull(),
    critical: boolean("critical").notNull(),
    state: text("state").notNull(),
  },
  (t) => ({
    byOrg: index("firmware_by_org").on(t.orgId),
  }),
);

// ===========================================================
// Knowledge base
// ===========================================================
export const kbArticles = pgTable(
  "kb_articles",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    authorId: text("author_id").notNull().references(() => engineers.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    views: integer("views").notNull().default(0),
    snippet: text("snippet").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
  },
  (t) => ({
    byOrgCategory: index("kb_by_org_category").on(t.orgId, t.category),
    byOrgAuthor: index("kb_by_org_author").on(t.orgId, t.authorId),
  }),
);

// ===========================================================
// RMA
// ===========================================================
export const rmaItems = pgTable(
  "rma_items",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    serverId: text("server_id").notNull().references(() => servers.id),
    componentName: text("component_name").notNull(),
    vendor: text("vendor").notNull(),
    reason: text("reason").notNull(),
    daysOpen: integer("days_open").notNull(),
    costUsd: integer("cost_usd").notNull(),
    status: text("status").notNull(),
    openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
    rmaNumber: text("rma_number"),
  },
  (t) => ({
    byOrgServer: index("rma_by_org_server").on(t.orgId, t.serverId),
    byOrgStatus: index("rma_by_org_status").on(t.orgId, t.status),
  }),
);

// ===========================================================
// Test plans
// ===========================================================
export const testPlans = pgTable(
  "test_plans",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    version: text("version").notNull(),
    scope: text("scope").notNull(),
    appliesToKinds: jsonb("applies_to_kinds").$type<string[]>().default([]),
    appliesToPlatforms: jsonb("applies_to_platforms").$type<string[]>().default([]),
    description: text("description"),
    steps: jsonb("steps").notNull().default([]),
    acceptance: jsonb("acceptance").notNull().default([]),
    expectedDurationMin: integer("expected_duration_min").notNull(),
    requiredEquipment: jsonb("required_equipment").$type<string[]>().default([]),
    requiredSkill: text("required_skill"),
    ownerEngineerId: text("owner_engineer_id").references(() => engineers.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    status: text("status").notNull(),
  },
  (t) => ({
    byOrgScope: index("plans_by_org_scope").on(t.orgId, t.scope),
    byOrgStatus: index("plans_by_org_status").on(t.orgId, t.status),
  }),
);

// ===========================================================
// Qualifications + campaigns
// ===========================================================
export const qualifications = pgTable(
  "qualifications",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    componentId: text("component_id").notNull().references(() => components.id),
    platformId: text("platform_id").notNull().references(() => platforms.id),
    state: text("state").notNull(),
    signedOffByEngineerId: text("signed_off_by_engineer_id").references(() => engineers.id),
    signedOffAt: timestamp("signed_off_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    supportingRunIds: jsonb("supporting_run_ids").$type<string[]>().notNull().default([]),
    campaignId: text("campaign_id"),
    limitations: text("limitations"),
    notes: text("notes"),
  },
  (t) => ({
    byOrgComponent: index("qual_by_org_component").on(t.orgId, t.componentId),
    byOrgPlatform: index("qual_by_org_platform").on(t.orgId, t.platformId),
    byOrgState: index("qual_by_org_state").on(t.orgId, t.state),
  }),
);

export const qualificationCampaigns = pgTable(
  "qualification_campaigns",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    componentId: text("component_id").notNull().references(() => components.id),
    platformId: text("platform_id").notNull().references(() => platforms.id),
    ownerEngineerId: text("owner_engineer_id").notNull().references(() => engineers.id),
    status: text("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    targetCompletionAt: timestamp("target_completion_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    testPlans: jsonb("test_plans").$type<string[]>().notNull().default([]),
    testPlanIds: jsonb("test_plan_ids").$type<string[]>().default([]),
    runIds: jsonb("run_ids").$type<string[]>().notNull().default([]),
    resultSummary: text("result_summary"),
    notes: text("notes"),
  },
  (t) => ({
    byOrgStatus: index("camp_by_org_status").on(t.orgId, t.status),
    byOrgOwner: index("camp_by_org_owner").on(t.orgId, t.ownerEngineerId),
  }),
);

// ===========================================================
// Validation runs
// ===========================================================
export const validationRuns = pgTable(
  "validation_runs",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    serverId: text("server_id").notNull().references(() => servers.id),
    platformId: text("platform_id").references(() => platforms.id),
    campaignId: text("campaign_id"),
    testPlanId: text("test_plan_id").references(() => testPlans.id),
    componentManifest: jsonb("component_manifest").default([]),
    measurements: jsonb("measurements").default([]),
    artifacts: jsonb("artifacts").default([]),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    durationMin: integer("duration_min").notNull(),
    result: text("result").notNull(),
    engineerId: text("engineer_id").notNull().references(() => engineers.id),
    passCount: integer("pass_count").notNull(),
    failCount: integer("fail_count").notNull(),
    notes: text("notes"),
  },
  (t) => ({
    byOrgServer: index("runs_by_org_server").on(t.orgId, t.serverId),
    byOrgCampaign: index("runs_by_org_campaign").on(t.orgId, t.campaignId),
    byOrgPlan: index("runs_by_org_plan").on(t.orgId, t.testPlanId),
    byOrgResult: index("runs_by_org_result").on(t.orgId, t.result),
    byOrgStartedAt: index("runs_by_org_started").on(t.orgId, t.startedAt),
  }),
);

// ===========================================================
// Audit log
// ===========================================================
// actorEngineerId — local engineer row (for FK joins / display)
// actorUserId     — Clerk user_xxx ID (survives engineer-row deletes)
export const auditLog = pgTable(
  "audit_log",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    actorEngineerId: text("actor_engineer_id"),
    actorUserId: text("actor_user_id"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    notes: text("notes"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (t) => ({
    byOrgEntity: index("audit_by_org_entity").on(t.orgId, t.entityType, t.entityId),
    byOrgActor: index("audit_by_org_actor").on(t.orgId, t.actorEngineerId),
    byOrgAt: index("audit_by_org_at").on(t.orgId, t.at),
  }),
);
