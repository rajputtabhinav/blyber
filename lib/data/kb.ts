import type { KBArticle } from "@/lib/types";

export const kbArticles: KBArticle[] = [
  {
    id: "KB-1041",
    title: "Gen10 fan tachometer wire wear pattern — root cause analysis",
    category: "Thermal",
    authorId: "eng-03",
    updatedISO: "2026-05-18T07:30:00Z",
    views: 1247,
    snippet:
      "Three incidents in 90 days traced to insulation wear where the F3 tachometer wire routes past the front riser bracket. Wire crosses a 90° edge during fan-tray insertion. Replacement P/N 875937-001 ships with reinforced sleeving.",
    tags: ["thermal", "gen10", "fan", "rca"],
  },
  {
    id: "KB-1023",
    title: "Dell R760 dual-BIOS recovery via BMC redfish",
    category: "Firmware",
    authorId: "eng-02",
    updatedISO: "2026-05-15T16:00:00Z",
    views: 2891,
    snippet:
      "Step-by-step procedure for triggering dual-BIOS rollback on R760 via iDRAC10 redfish API when primary BIOS image fails to POST. Requires sideband BMC access and IPMI active.",
    tags: ["bios", "r760", "recovery", "redfish"],
  },
  {
    id: "KB-1038",
    title: "ConnectX-7 link flap diagnosis — fiber, transceiver, and FW checklist",
    category: "Network",
    authorId: "eng-04",
    updatedISO: "2026-05-14T11:00:00Z",
    views: 1820,
    snippet:
      "Systematic walkthrough for diagnosing ConnectX-7 400GbE link flaps: cable trace, transceiver swap protocol, FW version cross-check against 28.39.1002 baseline, switch-side ECN matching, and bnxt_en/mlx5_core driver verification.",
    tags: ["network", "connectx-7", "link-flap", "diagnostics"],
  },
  {
    id: "KB-1015",
    title: "PM1733 wear leveling thresholds and predicted failure analysis",
    category: "Storage",
    authorId: "eng-05",
    updatedISO: "2026-05-11T09:00:00Z",
    views: 944,
    snippet:
      "SMART attribute interpretation for Samsung PM1733: reallocated sectors (0x05), wear leveling count (0xAD), and percentage used (0xE7). Predicted failure windows by attribute trajectory.",
    tags: ["ssd", "smart", "samsung", "wear-leveling"],
  },
  {
    id: "KB-1029",
    title: "EPYC 9004-series NUMA topology and pinning for HPC workloads",
    category: "Compute",
    authorId: "eng-06",
    updatedISO: "2026-05-09T14:00:00Z",
    views: 1612,
    snippet:
      "EPYC 9654 / 9554 / 9474F NUMA layout: 12 CCDs per socket, 4 NUMA-per-socket (NPS=4) mode optimization, L3 cache topology, and best-practice pinning for OpenMPI and NCCL workloads.",
    tags: ["amd", "epyc", "numa", "hpc"],
  },
  {
    id: "KB-1052",
    title: "H100 SXM5 cold-plate seating QA — 4U vs 8U chassis",
    category: "Thermal",
    authorId: "eng-11",
    updatedISO: "2026-05-08T17:00:00Z",
    views: 1305,
    snippet:
      "Torque sequence and seating verification for HGX H100 cold plates. Dense 4U chassis require staged tightening to avoid uneven contact; ΔT >3°C between any two GPUs indicates re-seat required.",
    tags: ["thermal", "h100", "cold-plate", "qa"],
  },
  {
    id: "KB-1011",
    title: "DDR5 memory training — failure modes and recovery sequences",
    category: "Compute",
    authorId: "eng-06",
    updatedISO: "2026-05-05T10:00:00Z",
    views: 2244,
    snippet:
      "Memory training failure taxonomy for DDR5 RDIMM systems. Catalogs slot-mismatch errors, MRC failure codes, and how to interpret memory error logs from BMC and serial console.",
    tags: ["memory", "ddr5", "training", "boot"],
  },
  {
    id: "KB-1063",
    title: "RMA process — pre-shipment checklist and vendor portal",
    category: "RMA Process",
    authorId: "eng-12",
    updatedISO: "2026-05-04T16:00:00Z",
    views: 871,
    snippet:
      "End-to-end RMA workflow: failure capture, serial verification, vendor portal selection (Dell ProSupport, HPE Pointnext, Supermicro RMA), shipment label generation, and tracking entry into Blyber RMA module.",
    tags: ["rma", "process", "vendor"],
  },
  {
    id: "KB-1047",
    title: "Burn-in test profile — 72h thermal envelope for 2U dense compute",
    category: "Validation",
    authorId: "eng-01",
    updatedISO: "2026-05-03T13:00:00Z",
    views: 1576,
    snippet:
      "Standardized 72h burn-in profile for 2U dual-socket platforms. Defines workload mix (45% CPU, 30% memory bandwidth, 25% storage random IO), inlet temperature setpoints, and pass/fail criteria.",
    tags: ["validation", "burn-in", "thermal", "profile"],
  },
  {
    id: "KB-1058",
    title: "RCCL collective failure on MI300X — xGMI link debugging",
    category: "Network",
    authorId: "eng-08",
    updatedISO: "2026-05-02T11:00:00Z",
    views: 522,
    snippet:
      "Debug guide for RCCL all-reduce stalls on AMD MI300X clusters. Walks through xGMI link state inspection, ROCm-smi diagnostics, and known firmware combinations that trigger queue exhaustion.",
    tags: ["gpu", "mi300x", "rccl", "xgmi"],
  },
  {
    id: "KB-1019",
    title: "PSU redundancy modes and AC-failure recovery on dense compute",
    category: "Validation",
    authorId: "eng-09",
    updatedISO: "2026-04-30T15:00:00Z",
    views: 689,
    snippet:
      "Configuration matrix for 1+1, 2+2, and 3+1 PSU modes across vendor chassis. Failover sequence diagrams and recovery validation procedure for unplanned AC loss.",
    tags: ["power", "psu", "redundancy"],
  },
  {
    id: "KB-1071",
    title: "ConnectX-6 Dx CVE-2026-1421 — firmware backport procedure",
    category: "Firmware",
    authorId: "eng-04",
    updatedISO: "2026-04-28T09:00:00Z",
    views: 1108,
    snippet:
      "Procedure for upgrading 14 ConnectX-6 Dx units from FW 22.36.1010 to 22.39.1002 to address CVE-2026-1421. Includes rolling-deploy ordering, traffic drain steps, and OFED kernel module compatibility matrix.",
    tags: ["security", "cve", "connectx-6", "firmware"],
  },
  {
    id: "KB-1034",
    title: "Kioxia CM7 firmware 0107 — qualification report",
    category: "Storage",
    authorId: "eng-05",
    updatedISO: "2026-04-26T12:00:00Z",
    views: 437,
    snippet:
      "Full qualification of Kioxia CM7-V firmware 0107 across all 8 supported chassis. Covers sequential and random IO benchmarks, power-loss-protection verification, and TLP error rate measurements.",
    tags: ["ssd", "kioxia", "qualification"],
  },
  {
    id: "KB-1009",
    title: "Lab safety — ESD protocol and torque-wrench standards",
    category: "RMA Process",
    authorId: "eng-07",
    updatedISO: "2026-04-21T10:00:00Z",
    views: 1942,
    snippet:
      "Mandatory ESD wristband and mat protocol for all hardware handling. Lists approved torque settings for chassis-screw, CPU socket, cold-plate, and DIMM operations.",
    tags: ["safety", "esd", "process"],
  },
  {
    id: "KB-1066",
    title: "Ampere Altra Max — kernel 6.5 hugepage panic workaround",
    category: "Compute",
    authorId: "eng-06",
    updatedISO: "2026-04-19T08:00:00Z",
    views: 213,
    snippet:
      "Workaround for kernel 6.5.0 panic when reserving >32GB hugepages on Ampere Altra Max. Disable transparent hugepages and use boot-time hugepagesz=1G parameter.",
    tags: ["arm64", "kernel", "altra", "hugepages"],
  },
];

export const kbCategoryCounts = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const a of kbArticles) counts[a.category] = (counts[a.category] || 0) + 1;
  return counts;
};
