// ============================================================
// Engineers
// ============================================================
export type Team =
  | "Validation"
  | "Firmware"
  | "Thermal"
  | "Network"
  | "Storage"
  | "Compute"
  | "Power";

export interface Engineer {
  id: string;
  name: string;
  initials: string;
  email: string;
  team: Team;
  role: string;
  activeTickets: number;
  resolvedThisWeek: number;
  workload: number; // 0-100
  status: "online" | "away" | "offline";
  shift?: string;
  joinedISO: string;
}

// ============================================================
// Servers
// ============================================================
export type ServerStatus = "online" | "validating" | "fault" | "offline" | "maintenance";

export interface ServerNode {
  id: string;
  hostname: string;
  vendor: "Dell" | "HPE" | "Supermicro" | "Lenovo" | "Cisco" | "Netweb";
  model: string;
  generation: string;
  cpu: string;
  cpuSockets: number;
  ramGB: number;
  ramConfig: string;
  storage: string;
  nic: string;
  gpu?: string;
  serial: string;
  rack: string;
  ruStart: number;
  ruHeight: number; // 1U, 2U, etc.
  owner: string; // engineer id
  status: ServerStatus;
  thermalC: number;
  powerW: number;
  biosVersion: string;
  bmcVersion: string;
  lastBootISO: string;
  uptimeDays: number;
  notes?: string;
  /** New: link to the Platform abstraction. Optional during transition. */
  platformId?: string;
}

// ============================================================
// Tickets
// ============================================================
export type Severity = "critical" | "high" | "medium" | "low";
export type TicketStatus = "open" | "in_progress" | "blocked" | "resolved" | "closed";

export interface Ticket {
  id: string; // BLY-1234
  title: string;
  serverId: string;
  rack: string;
  severity: Severity;
  status: TicketStatus;
  assigneeId: string;
  reporterId: string;
  createdISO: string;
  updatedISO: string;
  slaDueISO: string;
  slaState: "ok" | "warn" | "err";
  tags: string[];
  description?: string;
  watchers?: string[]; // engineer ids
  relatedIds?: string[];
}

export type TimelineKind =
  | "create"
  | "assign"
  | "comment"
  | "log"
  | "validation"
  | "flash"
  | "status"
  | "resolve";

export interface TimelineEntry {
  id: string;
  ticketId: string;
  kind: TimelineKind;
  actorId: string;
  atISO: string;
  text: string;
  detail?: string; // log block content
}

export interface ChecklistItem {
  id: string;
  ticketId: string;
  text: string;
  done: boolean;
  by?: string; // engineer id
  atISO?: string;
}

// ============================================================
// Racks
// ============================================================
export interface Rack {
  id: string; // R-DC1-A07
  name: string;
  site: string;
  zone: string;
  height: number; // 42
  utilizationPct: number;
  powerUsedKW: number;
  powerTotalKW: number;
  intakeC: number;
  exhaustC: number;
}

// ============================================================
// Components (Compatibility Matrix)
// ============================================================
export type Category = "NIC" | "GPU" | "SSD" | "HBA" | "DIMM" | "PSU";

export interface ComponentDef {
  id: string;
  name: string;
  vendor: string;
  category: Category;
  partNumber: string;
}

export type CompatStatus = "ok" | "warn" | "crit" | "untested" | "pending";

export interface CompatCell {
  componentId: string;
  serverModel: string;
  status: CompatStatus;
  firmware?: string;
  note?: string;
}

// ============================================================
// Firmware
// ============================================================
export type FwCategory = "BIOS" | "BMC" | "NIC" | "RAID" | "PSU" | "GPU" | "SSD";

export interface FirmwareEntry {
  id: string;
  name: string;
  vendor: string;
  category: FwCategory;
  currentVersion: string;
  latestVersion: string;
  releasedISO: string;
  appliesTo: number;
  fileSizeMB: number;
  critical: boolean;
  state: "matching" | "behind" | "critical";
}

// ============================================================
// Knowledge Base
// ============================================================
export type KBCategory =
  | "Thermal"
  | "Firmware"
  | "Network"
  | "Storage"
  | "Compute"
  | "Validation"
  | "RMA Process";

export interface KBArticle {
  id: string;
  title: string;
  category: KBCategory;
  authorId: string;
  updatedISO: string;
  views: number;
  snippet: string;
  tags: string[];
}

// ============================================================
// RMA
// ============================================================
export type RmaStatus = "queued" | "shipped" | "received" | "replaced" | "closed";

export interface RmaItem {
  id: string; // RMA-2025-0098
  serverId: string;
  componentName: string;
  vendor: string;
  reason: string;
  daysOpen: number;
  costUSD: number;
  status: RmaStatus;
  openedISO: string;
  rmaNumber?: string;
}

// ============================================================
// COMPONENT CATALOG (full qualification model)
// ============================================================
// A `Component` is any "qualifiable thing" — hardware SKU, firmware
// version, or software version. Hardware components have physical
// `ComponentInstance`s (serial-tracked). Firmware/software components
// are pure version records with no physical specimen.
//
// This sits alongside the older matrix-only `ComponentDef` (above)
// during the transition. Future cleanup will fold ComponentDef into
// this model.
// ============================================================

export type ComponentKind =
  // Hardware
  | "CPU"
  | "GPU"
  | "DIMM"
  | "SSD"
  | "HDD"
  | "NIC"
  | "HBA"
  | "PSU"
  | "FAN"
  // Firmware
  | "BIOS"
  | "BMC"
  | "FW_NIC"
  | "FW_GPU"
  | "FW_SSD"
  | "FW_HBA"
  // Software
  | "OS"
  | "KERNEL"
  | "DRIVER_GPU"
  | "DRIVER_NIC"
  | "OFED"
  | "CUDA"
  | "DOCA";

export const HARDWARE_KINDS: ComponentKind[] = [
  "CPU", "GPU", "DIMM", "SSD", "HDD", "NIC", "HBA", "PSU", "FAN",
];
export const FIRMWARE_KINDS: ComponentKind[] = [
  "BIOS", "BMC", "FW_NIC", "FW_GPU", "FW_SSD", "FW_HBA",
];
export const SOFTWARE_KINDS: ComponentKind[] = [
  "OS", "KERNEL", "DRIVER_GPU", "DRIVER_NIC", "OFED", "CUDA", "DOCA",
];

export interface Component {
  id: string; // cmp-cpu-001
  kind: ComponentKind;
  vendor: string;
  name: string; // "Intel Xeon Platinum 8480+"
  shortName?: string; // "Xeon 8480+"
  partNumber?: string;
  /** for firmware / software / driver kinds */
  version?: string;
  releasedISO?: string;
  tdpW?: number;
  notes?: string;
}

export type ComponentInstanceState =
  | "in_stock"
  | "installed"
  | "rma"
  | "retired";

/** A physical specimen of a hardware component, serial-tracked. */
export interface ComponentInstance {
  id: string;
  componentId: string;
  serial: string;
  receivedISO: string;
  state: ComponentInstanceState;
  currentServerId?: string;
  /** e.g., "DIMM_A2", "PCIe_3", "OAM_3" */
  slot?: string;
  installedAtISO?: string;
  installedByEngineerId?: string;
  notes?: string;
}

// ============================================================
// PLATFORM (server model abstraction)
// ============================================================
// A `Platform` is an abstract chassis class: "Tyrone TC-GB200" or
// "Dell R760". An individual `ServerNode` is an *instance* of a
// platform. Compatibility / qualification work happens at the
// platform level — chassis instances inherit qualifications.
// ============================================================

export type PlatformVendor =
  | "Netweb"
  | "Dell"
  | "HPE"
  | "Supermicro"
  | "Lenovo"
  | "Cisco";

export type PlatformCooling = "air" | "liquid" | "hybrid";

export interface Platform {
  id: string; // tyrone-tc-gb200
  vendor: PlatformVendor;
  family?: string; // "Tyrone Camarero"
  name: string; // "Tyrone TC-GB200"
  generation: string;
  ruHeight: number;
  cooling: PlatformCooling;
  socketCount: number;
  maxDimms: number;
  maxGpus: number;
  maxPsuW?: number;
  defaultBiosFamily?: string;
  notes?: string;
}

// ============================================================
// BOM (current installed manifest per chassis)
// ============================================================
// A slot on a chassis: references a Component (the SKU / version)
// and optionally a ComponentInstance (the physical serial, for
// hardware). For repeated parts (e.g., 12× same DIMM), use `count`.
// ============================================================

export interface BomSlot {
  componentId: string;
  /** required for hardware; absent for firmware/software entries */
  instanceId?: string;
  /** "DIMM_A2", "OAM_3", "PCIe_3" — required for hardware */
  slot?: string;
  /** for repeated identical parts like DIMM kits */
  count?: number;
}

/** The currently-installed BOM for a chassis at a point in time. */
export interface ServerBOM {
  serverId: string;
  asOfISO: string;
  hardware: BomSlot[];
  firmware: BomSlot[];
  software: BomSlot[];
}

// ============================================================
// QUALIFICATION
// ============================================================

export type QualificationState =
  | "qualified"
  | "limited"
  | "unsupported"
  | "untested"
  | "pending";

/** A signed-off statement that <component> is qualified on <platform>. */
export interface Qualification {
  id: string; // QUAL-2026-0014
  componentId: string;
  platformId: string;
  state: QualificationState;
  signedOffByEngineerId?: string;
  signedOffISO?: string;
  expiresISO?: string;
  supportingRunIds: string[];
  campaignId?: string;
  limitations?: string;
  notes?: string;
}

export type CampaignStatus =
  | "planning"
  | "active"
  | "blocked"
  | "passed"
  | "failed"
  | "deferred";

/** Multi-run effort to qualify one component on one platform. */
export interface QualificationCampaign {
  id: string; // QCAMP-2026-0042
  name: string;
  componentId: string;
  platformId: string;
  ownerEngineerId: string;
  status: CampaignStatus;
  createdISO: string;
  targetCompletionISO?: string;
  completedISO?: string;
  /** Free-text plan labels (legacy). Prefer `testPlanIds` for typed linkage. */
  testPlans: string[];
  /** Typed references into the test plan library. */
  testPlanIds?: string[];
  runIds: string[];
  resultSummary?: string;
  notes?: string;
}

// ============================================================
// TEST PLANS (reusable validation programs)
// ============================================================
// A `TestPlan` is the *definition* of what "qualified" means for a
// given scope: an ordered list of steps and a set of acceptance
// criteria expressed as `MetricSpec`s. Plans are versioned and reused
// across campaigns. Each `ValidationRun` executes a plan, captures
// `TestMeasurement`s, and is judged automatically by the plan's
// acceptance criteria.
// ============================================================

export type TestPlanScope =
  | "GPU"
  | "CPU"
  | "Memory"
  | "Storage"
  | "Network"
  | "Power"
  | "Thermal"
  | "Burn-in"
  | "Platform"
  | "Firmware"
  | "Custom";

export type TestPlanStatus = "draft" | "active" | "deprecated";

/** Acceptance criterion: a measurement must satisfy this comparison. */
export interface MetricSpec {
  metric: string; // matches a TestMeasurement.metric key
  unit?: string;
  comparator: "lt" | "lte" | "gt" | "gte" | "eq";
  limit: number;
  severity: "must" | "should"; // must = run fails; should = warn only
  description?: string;
}

export interface TestStep {
  id: string;
  name: string;
  description?: string;
  /** Command line / script to run; informational in mock mode */
  command?: string;
  expectedDurationMin: number;
  blockingOnFail: boolean;
  retryable: boolean;
}

export interface TestPlan {
  id: string;
  name: string;
  version: string; // semver-ish, e.g., "1.4"
  scope: TestPlanScope;
  /** Which Component kinds this plan is designed to qualify */
  appliesToKinds?: ComponentKind[];
  /** Optional restriction to specific platforms */
  appliesToPlatforms?: string[];
  description?: string;
  steps: TestStep[];
  acceptance: MetricSpec[];
  expectedDurationMin: number;
  requiredEquipment?: string[];
  requiredSkill?: string;
  ownerEngineerId?: string;
  createdISO: string;
  updatedISO: string;
  status: TestPlanStatus;
}

// ============================================================
// Reports / Validation
// ============================================================
export type RunType = "Thermal" | "Burn-in" | "Power" | "Memory" | "Network" | "Storage";
export type RunResult = "pass" | "fail" | "partial" | "running";

/** A structured measurement captured during a validation run. */
export interface TestMeasurement {
  metric: string; // "max_cpu_temp_c", "nccl_allreduce_gbps", "p99_latency_ns"
  value: number;
  unit?: string;
  limit?: number;
  comparator?: "lt" | "lte" | "gt" | "gte" | "eq";
  pass?: boolean;
}

export interface RunArtifact {
  name: string; // "burn-in-summary.csv"
  sizeKB: number;
  kind?: "log" | "csv" | "json" | "image" | "pdf";
}

export interface ValidationRun {
  id: string; // VR-3091
  type: RunType;
  serverId: string;

  // === NEW: full qualification context ===
  /** Platform of the chassis at test time. */
  platformId?: string;
  /** Campaign this run rolls up into. */
  campaignId?: string;
  /** Test plan executed (typed reference into the plans library). */
  testPlanId?: string;
  /** Immutable BOM snapshot at the time the run executed. */
  componentManifest?: BomSlot[];
  /** Structured measurements (replaces ad-hoc notes for metrics). */
  measurements?: TestMeasurement[];
  /** Attached artifacts: logs, CSVs, screenshots. */
  artifacts?: RunArtifact[];

  startedISO: string;
  durationMin: number;
  result: RunResult;
  engineerId: string;
  passCount: number;
  failCount: number;
  notes?: string;
}
