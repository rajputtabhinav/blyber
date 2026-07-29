import type { ComponentInstance } from "@/lib/types";

/**
 * Per-serial inventory of hardware components.
 *
 * Focus: high-value parts where traceability matters most — GPUs,
 * DIMM kits, NVMe drives, NICs. Adding every fan/screw is overkill;
 * we capture what an RMA or RCA actually needs to identify.
 */
export const componentInstances: ComponentInstance[] = [
  // ============================================================
  // GPUs — every GPU gets a serial (RMA + cold-plate-rework cases)
  // ============================================================
  // 4× H100 SXM5 in SVR-00124 (Tyrone TC-H100 4U)
  { id: "ci-001", componentId: "gpu-h100-sxm5", serial: "1322823064201", receivedISO: "2025-09-12T00:00:00Z", state: "installed", currentServerId: "SVR-00124", slot: "OAM_1", installedAtISO: "2025-09-18T00:00:00Z", installedByEngineerId: "eng-06" },
  { id: "ci-002", componentId: "gpu-h100-sxm5", serial: "1322823064202", receivedISO: "2025-09-12T00:00:00Z", state: "installed", currentServerId: "SVR-00124", slot: "OAM_2", installedAtISO: "2025-09-18T00:00:00Z", installedByEngineerId: "eng-06" },
  { id: "ci-003", componentId: "gpu-h100-sxm5", serial: "1322823064203", receivedISO: "2025-09-12T00:00:00Z", state: "installed", currentServerId: "SVR-00124", slot: "OAM_3", installedAtISO: "2025-09-18T00:00:00Z", installedByEngineerId: "eng-06" },
  { id: "ci-004", componentId: "gpu-h100-sxm5", serial: "1322823064204", receivedISO: "2025-09-12T00:00:00Z", state: "installed", currentServerId: "SVR-00124", slot: "OAM_4", installedAtISO: "2025-09-18T00:00:00Z", installedByEngineerId: "eng-06" },

  // 8× H100 SXM5 in SVR-00134 (Tyrone TC-H100 4U with 8 GPUs config)
  { id: "ci-005", componentId: "gpu-h100-sxm5", serial: "1340921017811", receivedISO: "2025-11-04T00:00:00Z", state: "installed", currentServerId: "SVR-00134", slot: "OAM_1", installedAtISO: "2025-11-10T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-006", componentId: "gpu-h100-sxm5", serial: "1340921017812", receivedISO: "2025-11-04T00:00:00Z", state: "installed", currentServerId: "SVR-00134", slot: "OAM_2", installedAtISO: "2025-11-10T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-007", componentId: "gpu-h100-sxm5", serial: "1340921017813", receivedISO: "2025-11-04T00:00:00Z", state: "rma", slot: "OAM_3", installedByEngineerId: "eng-08", notes: "Thermal slowdown at hour 47 — RMA-2026-0011, cold-plate seating suspected." },
  { id: "ci-008", componentId: "gpu-h100-sxm5", serial: "1340921017814", receivedISO: "2025-11-04T00:00:00Z", state: "installed", currentServerId: "SVR-00134", slot: "OAM_4", installedAtISO: "2025-11-10T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-009", componentId: "gpu-h100-sxm5", serial: "1340921017815", receivedISO: "2025-11-04T00:00:00Z", state: "installed", currentServerId: "SVR-00134", slot: "OAM_5", installedAtISO: "2025-11-10T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-010", componentId: "gpu-h100-sxm5", serial: "1340921017816", receivedISO: "2025-11-04T00:00:00Z", state: "installed", currentServerId: "SVR-00134", slot: "OAM_6", installedAtISO: "2025-11-10T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-011", componentId: "gpu-h100-sxm5", serial: "1340921017817", receivedISO: "2025-11-04T00:00:00Z", state: "installed", currentServerId: "SVR-00134", slot: "OAM_7", installedAtISO: "2025-11-10T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-012", componentId: "gpu-h100-sxm5", serial: "1340921017818", receivedISO: "2025-11-04T00:00:00Z", state: "installed", currentServerId: "SVR-00134", slot: "OAM_8", installedAtISO: "2025-11-10T00:00:00Z", installedByEngineerId: "eng-08" },

  // 4× H100 SXM5 in SVR-00145
  { id: "ci-013", componentId: "gpu-h100-sxm5", serial: "1410430112201", receivedISO: "2026-01-22T00:00:00Z", state: "installed", currentServerId: "SVR-00145", slot: "OAM_1", installedAtISO: "2026-01-28T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-014", componentId: "gpu-h100-sxm5", serial: "1410430112202", receivedISO: "2026-01-22T00:00:00Z", state: "installed", currentServerId: "SVR-00145", slot: "OAM_2", installedAtISO: "2026-01-28T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-015", componentId: "gpu-h100-sxm5", serial: "1410430112203", receivedISO: "2026-01-22T00:00:00Z", state: "installed", currentServerId: "SVR-00145", slot: "OAM_3", installedAtISO: "2026-01-28T00:00:00Z", installedByEngineerId: "eng-08" },
  { id: "ci-016", componentId: "gpu-h100-sxm5", serial: "1410430112204", receivedISO: "2026-01-22T00:00:00Z", state: "installed", currentServerId: "SVR-00145", slot: "OAM_4", installedAtISO: "2026-01-28T00:00:00Z", installedByEngineerId: "eng-08" },

  // A100 PCIe in lab evaluation chassis
  { id: "ci-017", componentId: "gpu-a100-pcie", serial: "0331621408871", receivedISO: "2024-08-04T00:00:00Z", state: "installed", currentServerId: "SVR-00137", slot: "PCIe_3", installedAtISO: "2024-08-09T00:00:00Z", installedByEngineerId: "eng-02" },

  // 2× L40S in SVR-00132 and SVR-00142
  { id: "ci-018", componentId: "gpu-l40s", serial: "1530419502201", receivedISO: "2025-08-18T00:00:00Z", state: "installed", currentServerId: "SVR-00132", slot: "PCIe_1" },
  { id: "ci-019", componentId: "gpu-l40s", serial: "1530419502202", receivedISO: "2025-08-18T00:00:00Z", state: "installed", currentServerId: "SVR-00132", slot: "PCIe_2" },
  { id: "ci-020", componentId: "gpu-l40s", serial: "1530419502203", receivedISO: "2025-08-18T00:00:00Z", state: "installed", currentServerId: "SVR-00142", slot: "PCIe_1" },
  { id: "ci-021", componentId: "gpu-l40s", serial: "1530419502204", receivedISO: "2025-08-18T00:00:00Z", state: "installed", currentServerId: "SVR-00142", slot: "PCIe_2" },

  // MI300X pre-prod loaner from AMD — NDA covered
  { id: "ci-022", componentId: "gpu-mi300x", serial: "MI300-PREPROD-AMD-001", receivedISO: "2026-02-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "OAM_1", installedAtISO: "2026-02-10T00:00:00Z", installedByEngineerId: "eng-08", notes: "AMD pre-prod loaner, NDA. Return by 2026-08-04." },
  { id: "ci-023", componentId: "gpu-mi300x", serial: "MI300-PREPROD-AMD-002", receivedISO: "2026-02-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "OAM_2" },
  { id: "ci-024", componentId: "gpu-mi300x", serial: "MI300-PREPROD-AMD-003", receivedISO: "2026-02-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "OAM_3" },
  { id: "ci-025", componentId: "gpu-mi300x", serial: "MI300-PREPROD-AMD-004", receivedISO: "2026-02-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "OAM_4" },
  { id: "ci-026", componentId: "gpu-mi300x", serial: "MI300-PREPROD-AMD-005", receivedISO: "2026-02-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "OAM_5" },
  { id: "ci-027", componentId: "gpu-mi300x", serial: "MI300-PREPROD-AMD-006", receivedISO: "2026-02-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "OAM_6" },
  { id: "ci-028", componentId: "gpu-mi300x", serial: "MI300-PREPROD-AMD-007", receivedISO: "2026-02-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "OAM_7" },
  { id: "ci-029", componentId: "gpu-mi300x", serial: "MI300-PREPROD-AMD-008", receivedISO: "2026-02-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "OAM_8" },

  // B200 pre-prod loaner from NVIDIA
  { id: "ci-030", componentId: "gpu-b200", serial: "B200-PREPROD-NV-001", receivedISO: "2026-04-19T00:00:00Z", state: "in_stock", notes: "NVIDIA pre-prod B200 SXM5 — awaiting TC-GB200 chassis allocation." },
  { id: "ci-031", componentId: "gpu-b200", serial: "B200-PREPROD-NV-002", receivedISO: "2026-04-19T00:00:00Z", state: "in_stock" },
  { id: "ci-032", componentId: "gpu-b200", serial: "B200-PREPROD-NV-003", receivedISO: "2026-04-19T00:00:00Z", state: "in_stock" },
  { id: "ci-033", componentId: "gpu-b200", serial: "B200-PREPROD-NV-004", receivedISO: "2026-04-19T00:00:00Z", state: "in_stock" },

  // ============================================================
  // High-value SSDs — Kioxia CM7 (the qualification ticket BLY-1242 references)
  // ============================================================
  { id: "ci-040", componentId: "ssd-cm7-7.68tb", serial: "CM7-Y4A001-7686-001", receivedISO: "2026-03-12T00:00:00Z", state: "installed", currentServerId: "SVR-00129", slot: "NVMe_1" },
  { id: "ci-041", componentId: "ssd-cm7-7.68tb", serial: "CM7-Y4A001-7686-002", receivedISO: "2026-03-12T00:00:00Z", state: "installed", currentServerId: "SVR-00129", slot: "NVMe_2" },
  { id: "ci-042", componentId: "ssd-cm7-7.68tb", serial: "CM7-Y4A001-7686-003", receivedISO: "2026-03-12T00:00:00Z", state: "installed", currentServerId: "SVR-00129", slot: "NVMe_3" },
  { id: "ci-043", componentId: "ssd-cm7-7.68tb", serial: "CM7-Y4A001-7686-004", receivedISO: "2026-03-12T00:00:00Z", state: "installed", currentServerId: "SVR-00129", slot: "NVMe_4" },
  { id: "ci-044", componentId: "ssd-cm7-7.68tb", serial: "CM7-Y4A001-7686-005", receivedISO: "2026-03-12T00:00:00Z", state: "installed", currentServerId: "SVR-00124", slot: "NVMe_1" },
  { id: "ci-045", componentId: "ssd-cm7-7.68tb", serial: "CM7-Y4A001-7686-006", receivedISO: "2026-03-12T00:00:00Z", state: "installed", currentServerId: "SVR-00124", slot: "NVMe_2" },

  // ============================================================
  // PM1733 NVMe — RMA cluster (BLY-1244 / RMA-2026-0014)
  // ============================================================
  { id: "ci-050", componentId: "ssd-pm1733-1.92tb", serial: "PM1733-K123-A001", receivedISO: "2024-10-08T00:00:00Z", state: "rma", notes: "RMA-2026-0014 predictive failure cluster." },
  { id: "ci-051", componentId: "ssd-pm1733-1.92tb", serial: "PM1733-K123-A002", receivedISO: "2024-10-08T00:00:00Z", state: "rma", notes: "RMA-2026-0014 predictive failure cluster." },
  { id: "ci-052", componentId: "ssd-pm1733-1.92tb", serial: "PM1733-K123-A003", receivedISO: "2024-10-08T00:00:00Z", state: "rma", notes: "RMA-2026-0014 predictive failure cluster." },
  { id: "ci-053", componentId: "ssd-pm1733-1.92tb", serial: "PM1733-K123-A004", receivedISO: "2024-10-08T00:00:00Z", state: "rma", notes: "RMA-2026-0014 predictive failure cluster." },

  // ============================================================
  // DIMM kits — focus on the 32GB DDR5-4800 batch (BLY-1238 inventory shortage)
  // ============================================================
  { id: "ci-060", componentId: "dimm-ddr5-4800-32g", serial: "MTC-2436-AC01", receivedISO: "2026-01-04T00:00:00Z", state: "installed", currentServerId: "SVR-00132", slot: "DIMM_A1" },
  { id: "ci-061", componentId: "dimm-ddr5-4800-32g", serial: "MTC-2436-AC02", receivedISO: "2026-01-04T00:00:00Z", state: "installed", currentServerId: "SVR-00132", slot: "DIMM_A2" },
  { id: "ci-062", componentId: "dimm-ddr5-4800-32g", serial: "MTC-2436-AC03", receivedISO: "2026-01-04T00:00:00Z", state: "in_stock" },
  { id: "ci-063", componentId: "dimm-ddr5-4800-32g", serial: "MTC-2436-AC04", receivedISO: "2026-01-04T00:00:00Z", state: "in_stock" },
  { id: "ci-064", componentId: "dimm-ddr5-4800-32g", serial: "MTC-2436-AC05", receivedISO: "2026-01-04T00:00:00Z", state: "in_stock" },
  { id: "ci-065", componentId: "dimm-ddr5-4800-32g", serial: "MTC-2436-AC06", receivedISO: "2026-01-04T00:00:00Z", state: "in_stock" },
  { id: "ci-066", componentId: "dimm-ddr4-3200-32g", serial: "HMA-2143-AC01", receivedISO: "2024-11-22T00:00:00Z", state: "rma", notes: "RMA-2026-0013 ECC threshold exceeded, CPU1 A2 slot." },

  // ============================================================
  // ConnectX-7 NICs — fleet of 9 (matches firmware appliesTo)
  // ============================================================
  { id: "ci-080", componentId: "nic-cx7-400g", serial: "CX7-MT2410-0001", receivedISO: "2025-12-04T00:00:00Z", state: "installed", currentServerId: "SVR-00124", slot: "PCIe_OCP" },
  { id: "ci-081", componentId: "nic-cx7-400g", serial: "CX7-MT2410-0002", receivedISO: "2025-12-04T00:00:00Z", state: "installed", currentServerId: "SVR-00132", slot: "PCIe_OCP" },
  { id: "ci-082", componentId: "nic-cx7-400g", serial: "CX7-MT2410-0003", receivedISO: "2025-12-04T00:00:00Z", state: "installed", currentServerId: "SVR-00133", slot: "PCIe_OCP" },
  { id: "ci-083", componentId: "nic-cx7-400g", serial: "CX7-MT2410-0004", receivedISO: "2025-12-04T00:00:00Z", state: "installed", currentServerId: "SVR-00134", slot: "PCIe_OCP" },
  { id: "ci-084", componentId: "nic-cx7-400g", serial: "CX7-MT2410-0005", receivedISO: "2025-12-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "PCIe_OCP_1" },
  { id: "ci-085", componentId: "nic-cx7-400g", serial: "CX7-MT2410-0006", receivedISO: "2025-12-04T00:00:00Z", state: "installed", currentServerId: "SVR-00140", slot: "PCIe_OCP_2" },
  { id: "ci-086", componentId: "nic-cx7-400g", serial: "CX7-MT2410-0007", receivedISO: "2025-12-04T00:00:00Z", state: "installed", currentServerId: "SVR-00145", slot: "PCIe_OCP" },

  // BlueField-3 DPU — pre-prod
  { id: "ci-090", componentId: "nic-bf3-dpu", serial: "BF3-PREPROD-NV-001", receivedISO: "2026-03-08T00:00:00Z", state: "in_stock", notes: "NVIDIA pre-prod BlueField-3 — awaiting DOCA 2.7 qualification campaign assignment." },
  { id: "ci-091", componentId: "nic-bf3-dpu", serial: "BF3-PREPROD-NV-002", receivedISO: "2026-03-08T00:00:00Z", state: "in_stock" },
];

export function componentInstanceById(id: string): ComponentInstance | undefined {
  return componentInstances.find((c) => c.id === id);
}

export function instancesByServer(serverId: string): ComponentInstance[] {
  return componentInstances.filter((c) => c.currentServerId === serverId);
}

export function instancesByComponent(componentId: string): ComponentInstance[] {
  return componentInstances.filter((c) => c.componentId === componentId);
}
