import type { Platform } from "@/lib/types";

/**
 * Server platforms tracked in the Netweb R&D lab. Includes the
 * native Tyrone Camarero family (qualification target) and the
 * third-party chassis the lab benchmarks against (Dell / HPE /
 * Supermicro / Lenovo / Cisco).
 */
export const platforms: Platform[] = [
  // ============================================================
  // Tyrone Camarero — Netweb's own SKUs
  // ============================================================
  {
    id: "tyrone-tc-gb200-nvl4",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-GB200 NVL4",
    generation: "Grace-Blackwell-2026",
    ruHeight: 4,
    cooling: "liquid",
    socketCount: 2,
    maxDimms: 0, // LPDDR5X soldered (Grace)
    maxGpus: 4,
    maxPsuW: 5400,
    defaultBiosFamily: "TC-GB200 BIOS",
    notes: "Reference design: Grace-Blackwell GB200 NVL4, liquid cooled, NVLink C2C between Grace + Blackwell.",
  },
  {
    id: "tyrone-tc-gb200-nvl72",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-GB200 NVL72",
    generation: "Grace-Blackwell-2026",
    ruHeight: 42, // a full rack
    cooling: "liquid",
    socketCount: 36,
    maxDimms: 0,
    maxGpus: 72,
    maxPsuW: 132000, // 120kW class
    defaultBiosFamily: "TC-GB200 BIOS",
    notes: "Full NVL72 liquid-cooled rack: 18 compute trays + 9 NVSwitch trays + CDU.",
  },
  {
    id: "tyrone-tc-h200-8u",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-H200 8U",
    generation: "Hopper-Refresh",
    ruHeight: 8,
    cooling: "air",
    socketCount: 2,
    maxDimms: 32,
    maxGpus: 8,
    maxPsuW: 6600,
    defaultBiosFamily: "TC-H200 BIOS",
  },
  {
    id: "tyrone-tc-h100-4u",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-H100 4U",
    generation: "Hopper",
    ruHeight: 4,
    cooling: "air",
    socketCount: 2,
    maxDimms: 32,
    maxGpus: 4,
    maxPsuW: 4000,
    defaultBiosFamily: "TC-H100 BIOS",
  },
  {
    id: "tyrone-tc-l40s-2u",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-L40S 2U",
    generation: "Ada-Lovelace",
    ruHeight: 2,
    cooling: "air",
    socketCount: 2,
    maxDimms: 24,
    maxGpus: 4,
    maxPsuW: 2400,
    defaultBiosFamily: "TC-L40S BIOS",
  },
  {
    id: "tyrone-tc-mi300x-8u",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-MI300X 8U",
    generation: "Instinct-MI300",
    ruHeight: 8,
    cooling: "air",
    socketCount: 2,
    maxDimms: 24,
    maxGpus: 8,
    maxPsuW: 8400,
    defaultBiosFamily: "TC-MI300 BIOS",
    notes: "AMD MI300X reference design.",
  },
  {
    id: "tyrone-tc-cpu-2u",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-CPU 2U",
    generation: "Emerald-Rapids",
    ruHeight: 2,
    cooling: "air",
    socketCount: 2,
    maxDimms: 32,
    maxGpus: 0,
    maxPsuW: 1600,
    defaultBiosFamily: "TC-CPU BIOS",
    notes: "General-purpose 2U dual-socket. Most-shipped Netweb SKU.",
  },
  {
    id: "tyrone-tc-storage-4u",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-Storage 4U",
    generation: "Storage-2026",
    ruHeight: 4,
    cooling: "air",
    socketCount: 2,
    maxDimms: 16,
    maxGpus: 0,
    maxPsuW: 2400,
    defaultBiosFamily: "TC-Storage BIOS",
    notes: "ParallelStor Velox storage node. 24× E3.S NVMe.",
  },
  {
    id: "tyrone-tc-spark",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-Spark",
    generation: "Grace-Blackwell-Desktop",
    ruHeight: 0, // desktop
    cooling: "air",
    socketCount: 1,
    maxDimms: 0,
    maxGpus: 1,
    maxPsuW: 240,
    defaultBiosFamily: "TC-Spark BIOS",
    notes: "Personal AI supercomputer. 1 PFLOP, 128GB unified memory.",
  },
  {
    id: "tyrone-tc-edge-1u",
    vendor: "Netweb",
    family: "Tyrone Camarero",
    name: "Tyrone TC-Edge 1U",
    generation: "Edge-2026",
    ruHeight: 1,
    cooling: "air",
    socketCount: 1,
    maxDimms: 8,
    maxGpus: 1,
    maxPsuW: 600,
    defaultBiosFamily: "TC-Edge BIOS",
  },

  // ============================================================
  // Third-party platforms in the lab (for benchmark + competitor evaluation)
  // ============================================================
  { id: "dell-r740xd", vendor: "Dell", name: "PowerEdge R740xd", generation: "14G", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 24, maxGpus: 3, maxPsuW: 2400 },
  { id: "dell-r750",   vendor: "Dell", name: "PowerEdge R750",   generation: "15G", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 32, maxGpus: 6, maxPsuW: 2400 },
  { id: "dell-r760",   vendor: "Dell", name: "PowerEdge R760",   generation: "16G", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 32, maxGpus: 8, maxPsuW: 2800 },
  { id: "hpe-dl380-gen10", vendor: "HPE", name: "ProLiant DL380 Gen10", generation: "Gen10", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 24, maxGpus: 3, maxPsuW: 1600 },
  { id: "hpe-dl380-gen11", vendor: "HPE", name: "ProLiant DL380 Gen11", generation: "Gen11", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 32, maxGpus: 4, maxPsuW: 1800 },
  { id: "hpe-dl385-gen11", vendor: "HPE", name: "ProLiant DL385 Gen11", generation: "Gen11", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 24, maxGpus: 4, maxPsuW: 1600 },
  { id: "smc-x12dpi", vendor: "Supermicro", name: "X12DPi-NT6", generation: "X12", ruHeight: 1, cooling: "air", socketCount: 2, maxDimms: 16, maxGpus: 0, maxPsuW: 1200 },
  { id: "smc-x13dem", vendor: "Supermicro", name: "X13DEM",     generation: "X13", ruHeight: 1, cooling: "air", socketCount: 2, maxDimms: 16, maxGpus: 0, maxPsuW: 1600 },
  { id: "smc-x13sae", vendor: "Supermicro", name: "X13SAE-F",   generation: "X13", ruHeight: 1, cooling: "air", socketCount: 1, maxDimms: 4,  maxGpus: 0, maxPsuW: 500 },
  { id: "smc-mi300x", vendor: "Supermicro", name: "AS-8125GS-TNMR2", generation: "X13", ruHeight: 8, cooling: "air", socketCount: 2, maxDimms: 24, maxGpus: 8, maxPsuW: 8400 },
  { id: "smc-altra",  vendor: "Supermicro", name: "ARS-210M-NR", generation: "Ampere", ruHeight: 1, cooling: "air", socketCount: 1, maxDimms: 16, maxGpus: 0, maxPsuW: 800 },
  { id: "lenovo-sr650v2", vendor: "Lenovo", name: "ThinkSystem SR650 V2", generation: "V2", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 32, maxGpus: 4, maxPsuW: 2400 },
  { id: "lenovo-sr650v3", vendor: "Lenovo", name: "ThinkSystem SR650 V3", generation: "V3", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 32, maxGpus: 4, maxPsuW: 2400 },
  { id: "cisco-c240m7", vendor: "Cisco", name: "UCS C240 M7", generation: "M7", ruHeight: 2, cooling: "air", socketCount: 2, maxDimms: 32, maxGpus: 4, maxPsuW: 2300 },
  { id: "cisco-c220m6", vendor: "Cisco", name: "UCS C220 M6", generation: "M6", ruHeight: 1, cooling: "air", socketCount: 2, maxDimms: 16, maxGpus: 0, maxPsuW: 1600 },
];

export function platformById(id: string): Platform | undefined {
  return platforms.find((p) => p.id === id);
}

/**
 * Derive a platformId from a legacy ServerNode that has free-text
 * `vendor` + `model` fields. Lets us bind existing inventory to the
 * new Platform abstraction without rewriting servers.ts.
 *
 * Returns undefined if the model isn't recognised — callers should
 * treat that as "platform unknown, fall back to display strings."
 */
export function derivePlatformId(server: {
  vendor: string;
  model: string;
}): string | undefined {
  const key = `${server.vendor} ${server.model}`.toLowerCase();
  const map: Record<string, string> = {
    "dell poweredge r740xd": "dell-r740xd",
    "dell poweredge r750": "dell-r750",
    "dell poweredge r760": "dell-r760",
    "hpe proliant dl380 gen10": "hpe-dl380-gen10",
    "hpe proliant dl380 gen11": "hpe-dl380-gen11",
    "hpe proliant dl385 gen11": "hpe-dl385-gen11",
    "supermicro x12dpi-nt6": "smc-x12dpi",
    "supermicro x13dem": "smc-x13dem",
    "supermicro x13sae-f": "smc-x13sae",
    "supermicro ars-210m-nr": "smc-altra",
    "supermicro as-8125gs-tnmr2": "smc-mi300x",
    "lenovo thinksystem sr650 v2": "lenovo-sr650v2",
    "lenovo thinksystem sr650 v3": "lenovo-sr650v3",
    "cisco ucs c240 m7": "cisco-c240m7",
    "cisco ucs c220 m6": "cisco-c220m6",
  };
  return map[key];
}
