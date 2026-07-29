import type { Qualification, QualificationCampaign } from "@/lib/types";

/**
 * Qualification records: signed-off statements that a Component
 * is qualified on a Platform.
 *
 * Today these are hand-authored. In the target model they're
 * derived from sign-off events at the end of QualificationCampaigns
 * — the campaign attaches the supporting validation runs, an
 * engineer signs off, and a `Qualification` is emitted.
 */
export const qualifications: Qualification[] = [
  // ============================================================
  // GPU qualifications — H100 SXM5
  // ============================================================
  { id: "QUAL-2026-0001", componentId: "gpu-h100-sxm5", platformId: "tyrone-tc-h100-4u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2025-10-04T00:00:00Z", supportingRunIds: ["VR-2901", "VR-2902", "VR-2911"], campaignId: "QCAMP-2025-0044", notes: "Reference design qualified end-to-end: NCCL all-reduce 387 GB/s, gpu-burn 4h clean, NVLink topology verified." },
  { id: "QUAL-2026-0002", componentId: "gpu-h100-sxm5", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2026-01-22T00:00:00Z", supportingRunIds: ["VR-3041", "VR-3055"], campaignId: "QCAMP-2026-0008" },
  { id: "QUAL-2026-0003", componentId: "gpu-h100-sxm5", platformId: "dell-r760", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2025-11-19T00:00:00Z", supportingRunIds: ["VR-2987"], notes: "Qualified on R760 4-GPU PCIe variant for benchmark comparison." },
  { id: "QUAL-2026-0004", componentId: "gpu-h100-sxm5", platformId: "smc-mi300x", state: "unsupported", supportingRunIds: [], notes: "Chassis is AMD-only socket; physical incompatibility." },
  { id: "QUAL-2026-0005", componentId: "gpu-h100-sxm5", platformId: "tyrone-tc-gb200-nvl4", state: "limited", signedOffByEngineerId: "eng-06", signedOffISO: "2026-03-04T00:00:00Z", supportingRunIds: ["VR-3088"], limitations: "Works in PCIe-passthrough mode only. SXM topology incompatible with GB200 NVL4.", campaignId: "QCAMP-2026-0028" },

  // ============================================================
  // GPU qualifications — H200 SXM5
  // ============================================================
  { id: "QUAL-2026-0010", componentId: "gpu-h200-sxm5", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2026-02-28T00:00:00Z", supportingRunIds: ["VR-3062", "VR-3071"], campaignId: "QCAMP-2026-0015", notes: "Native H200 platform. NCCL all-reduce 392 GB/s, MLPerf Llama-2-70B passed." },

  // ============================================================
  // GPU qualifications — MI300X
  // ============================================================
  { id: "QUAL-2026-0015", componentId: "gpu-mi300x", platformId: "tyrone-tc-mi300x-8u", state: "limited", signedOffByEngineerId: "eng-08", signedOffISO: "2026-04-11T00:00:00Z", supportingRunIds: ["VR-3084", "VR-3087"], limitations: "RCCL all-reduce stalls at iteration ~120 under ROCm 6.1.2; works clean on ROCm 6.1.3+. See BLY-1244.", campaignId: "QCAMP-2026-0023" },
  { id: "QUAL-2026-0016", componentId: "gpu-mi300x", platformId: "smc-mi300x", state: "qualified", signedOffByEngineerId: "eng-08", signedOffISO: "2026-03-22T00:00:00Z", supportingRunIds: ["VR-3066"], notes: "Benchmark baseline against Supermicro reference." },

  // ============================================================
  // GPU qualifications — B200 (pre-prod)
  // ============================================================
  { id: "QUAL-2026-0020", componentId: "gpu-b200", platformId: "tyrone-tc-gb200-nvl4", state: "pending", supportingRunIds: ["VR-3092"], campaignId: "QCAMP-2026-0042", notes: "Active campaign — NVIDIA pre-prod silicon, NDA covered." },
  { id: "QUAL-2026-0021", componentId: "gpu-b200", platformId: "tyrone-tc-gb200-nvl72", state: "pending", supportingRunIds: [], campaignId: "QCAMP-2026-0043", notes: "Awaiting Tyrone TC-GB200 NVL72 chassis delivery." },

  // ============================================================
  // SSD qualifications — Kioxia CM7
  // ============================================================
  { id: "QUAL-2026-0030", componentId: "ssd-cm7-7.68tb", platformId: "tyrone-tc-storage-4u", state: "qualified", signedOffByEngineerId: "eng-05", signedOffISO: "2026-05-04T00:00:00Z", supportingRunIds: ["VR-3086"], campaignId: "QCAMP-2026-0031", notes: "Qualified with FW 0107 — earlier FW 0103 had write-latency tail issues. See BLY-1242." },
  { id: "QUAL-2026-0031", componentId: "ssd-cm7-7.68tb", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-05", signedOffISO: "2026-04-18T00:00:00Z", supportingRunIds: ["VR-3072"], notes: "FW 0107 mandatory." },
  { id: "QUAL-2026-0032", componentId: "ssd-cm7-7.68tb", platformId: "lenovo-sr650v3", state: "qualified", signedOffByEngineerId: "eng-05", signedOffISO: "2026-04-22T00:00:00Z", supportingRunIds: ["VR-3083"] },
  { id: "QUAL-2026-0033", componentId: "ssd-cm7-7.68tb", platformId: "dell-r760", state: "qualified", signedOffByEngineerId: "eng-05", signedOffISO: "2026-04-20T00:00:00Z", supportingRunIds: ["VR-3076"] },
  { id: "QUAL-2026-0034", componentId: "ssd-cm7-7.68tb", platformId: "hpe-dl380-gen10", state: "limited", limitations: "FW 0103 only; FW 0107 backplane handshake fails on Gen10. Stay on 0103 for Gen10 fleet.", supportingRunIds: ["VR-2980"] },

  // ============================================================
  // SSD qualifications — Samsung PM1733
  // ============================================================
  { id: "QUAL-2026-0040", componentId: "ssd-pm1733-3.84tb", platformId: "dell-r740xd", state: "qualified", signedOffByEngineerId: "eng-05", signedOffISO: "2024-12-19T00:00:00Z", supportingRunIds: ["VR-2401"] },
  { id: "QUAL-2026-0041", componentId: "ssd-pm1733-3.84tb", platformId: "dell-r750", state: "qualified", signedOffByEngineerId: "eng-05", signedOffISO: "2025-02-04T00:00:00Z", supportingRunIds: ["VR-2502"] },
  { id: "QUAL-2026-0042", componentId: "ssd-pm1733-3.84tb", platformId: "tyrone-tc-cpu-2u", state: "qualified", signedOffByEngineerId: "eng-05", signedOffISO: "2025-04-11T00:00:00Z", supportingRunIds: ["VR-2611"] },

  // ============================================================
  // NIC qualifications
  // ============================================================
  { id: "QUAL-2026-0050", componentId: "nic-cx7-400g", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-04", signedOffISO: "2026-02-04T00:00:00Z", supportingRunIds: ["VR-3050"], notes: "FW 28.39.1002 mandatory." },
  { id: "QUAL-2026-0051", componentId: "nic-cx7-400g", platformId: "tyrone-tc-mi300x-8u", state: "qualified", signedOffByEngineerId: "eng-04", signedOffISO: "2026-03-04T00:00:00Z", supportingRunIds: ["VR-3066"] },
  { id: "QUAL-2026-0052", componentId: "nic-cx7-400g", platformId: "dell-r760", state: "limited", limitations: "p2p1 link flap every ~11 min observed; cable and transceiver swap inconclusive. See BLY-1251.", supportingRunIds: ["VR-3090"] },

  // ============================================================
  // BIOS / BMC qualifications (per-platform per-version)
  // ============================================================
  { id: "QUAL-2026-0060", componentId: "bios-tc-gb200-1.1b", platformId: "tyrone-tc-gb200-nvl4", state: "qualified", signedOffByEngineerId: "eng-02", signedOffISO: "2026-05-12T00:00:00Z", supportingRunIds: ["VR-3091", "VR-3092"], campaignId: "QCAMP-2026-0041" },
  { id: "QUAL-2026-0061", componentId: "bios-dell-r760-1.5.0", platformId: "dell-r760", state: "qualified", signedOffByEngineerId: "eng-02", signedOffISO: "2026-05-15T00:00:00Z", supportingRunIds: ["VR-3088"] },
  { id: "QUAL-2026-0062", componentId: "bios-dell-r760-1.4.8", platformId: "dell-r760", state: "limited", limitations: "Memory training instability under DDR5-4800 1DPC. Upgrade to 1.5.0 before production.", supportingRunIds: [] },

  // ============================================================
  // OS qualifications
  // ============================================================
  { id: "QUAL-2026-0070", componentId: "os-rhel-9.4", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2026-02-19T00:00:00Z", supportingRunIds: ["VR-3060"], notes: "Default Netweb production OS." },
  { id: "QUAL-2026-0071", componentId: "os-rhel-9.4", platformId: "tyrone-tc-mi300x-8u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2026-03-22T00:00:00Z", supportingRunIds: ["VR-3066"] },
  { id: "QUAL-2026-0072", componentId: "os-ubuntu-24.04", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2026-04-08T00:00:00Z", supportingRunIds: ["VR-3068"] },
  { id: "QUAL-2026-0073", componentId: "os-rocky-9.4", platformId: "tyrone-tc-cpu-2u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2026-05-02T00:00:00Z", supportingRunIds: [] },

  // ============================================================
  // Kernel qualifications
  // ============================================================
  { id: "QUAL-2026-0080", componentId: "kernel-5.14.0-503", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2026-04-04T00:00:00Z", supportingRunIds: ["VR-3068"] },
  { id: "QUAL-2026-0081", componentId: "kernel-6.5.0-arm64", platformId: "smc-altra", state: "limited", limitations: "Kernel panic when reserving >32GB hugepages. Workaround: hugepagesz=1G boot param. See BLY-1237.", supportingRunIds: [] },

  // ============================================================
  // NVIDIA driver qualifications
  // ============================================================
  { id: "QUAL-2026-0090", componentId: "drv-nv-550.54.15", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-02", signedOffISO: "2026-03-22T00:00:00Z", supportingRunIds: ["VR-3067"] },
  { id: "QUAL-2026-0091", componentId: "drv-nv-550.54.15", platformId: "tyrone-tc-h100-4u", state: "qualified", signedOffByEngineerId: "eng-02", signedOffISO: "2026-03-22T00:00:00Z", supportingRunIds: ["VR-3069"] },
  { id: "QUAL-2026-0092", componentId: "drv-nv-555.42.06", platformId: "tyrone-tc-h200-8u", state: "pending", supportingRunIds: ["VR-3093"], campaignId: "QCAMP-2026-0044", notes: "Active qualification campaign opened on driver release." },

  // ============================================================
  // CUDA qualifications
  // ============================================================
  { id: "QUAL-2026-0100", componentId: "cuda-12.6", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-06", signedOffISO: "2026-04-12T00:00:00Z", supportingRunIds: [] },

  // ============================================================
  // OFED qualifications
  // ============================================================
  { id: "QUAL-2026-0110", componentId: "ofed-24.01", platformId: "tyrone-tc-h200-8u", state: "qualified", signedOffByEngineerId: "eng-04", signedOffISO: "2026-04-22T00:00:00Z", supportingRunIds: [] },
];

/**
 * Active and historical qualification campaigns. Each campaign
 * groups runs that test one component against one platform.
 */
export const campaigns: QualificationCampaign[] = [
  // --- Active ---
  {
    id: "QCAMP-2026-0044",
    name: "NVIDIA driver 555.42.06 × Tyrone TC-H200 8U",
    componentId: "drv-nv-555.42.06",
    platformId: "tyrone-tc-h200-8u",
    ownerEngineerId: "eng-02",
    status: "active",
    createdISO: "2026-05-08T00:00:00Z",
    targetCompletionISO: "2026-05-22T00:00:00Z",
    testPlans: ["GPU bring-up", "NCCL all-reduce", "gpu-burn 4h", "MIG topology", "MLPerf inference"],
    testPlanIds: ["plan-nvidia-driver", "plan-gpu-qual"],
    runIds: ["VR-3093", "VR-3094"],
    notes: "Triggered automatically by NVIDIA 555.42.06 driver release on 2026-04-22. Canary chassis: SVR-00145.",
  },
  {
    id: "QCAMP-2026-0042",
    name: "NVIDIA B200 SXM5 × Tyrone TC-GB200 NVL4",
    componentId: "gpu-b200",
    platformId: "tyrone-tc-gb200-nvl4",
    ownerEngineerId: "eng-06",
    status: "active",
    createdISO: "2026-04-22T00:00:00Z",
    targetCompletionISO: "2026-06-15T00:00:00Z",
    testPlans: ["Initial POST", "NVLink topology", "HBM3e stress", "NCCL all-reduce", "Thermal soak 8h", "MLPerf training Llama-2-70B"],
    runIds: ["VR-3092"],
    notes: "NVIDIA pre-prod silicon under NDA. 4× B200 SXM5 received 2026-04-19, awaiting full chassis integration.",
  },
  {
    id: "QCAMP-2026-0043",
    name: "NVIDIA B200 × Tyrone TC-GB200 NVL72",
    componentId: "gpu-b200",
    platformId: "tyrone-tc-gb200-nvl72",
    ownerEngineerId: "eng-06",
    status: "planning",
    createdISO: "2026-05-02T00:00:00Z",
    targetCompletionISO: "2026-08-01T00:00:00Z",
    testPlans: ["Rack bring-up", "CDU liquid cooling validation", "72-GPU NCCL ring", "Power budget verification", "SHARP aggregation"],
    runIds: [],
    notes: "Blocked on TC-GB200 NVL72 chassis arrival from Faridabad assembly.",
  },
  {
    id: "QCAMP-2026-0041",
    name: "TC-GB200 BIOS 1.1b × Tyrone TC-GB200 NVL4",
    componentId: "bios-tc-gb200-1.1b",
    platformId: "tyrone-tc-gb200-nvl4",
    ownerEngineerId: "eng-02",
    status: "passed",
    createdISO: "2026-04-30T00:00:00Z",
    completedISO: "2026-05-12T00:00:00Z",
    testPlans: ["BIOS recovery", "Memory training", "POST under all valid topologies"],
    runIds: ["VR-3091", "VR-3092"],
    resultSummary: "All test cases pass. BIOS 1.1b promoted to TC-GB200 default.",
  },

  // --- Recently completed ---
  {
    id: "QCAMP-2026-0031",
    name: "Kioxia CM7 7.68TB FW 0107 × Tyrone TC-Storage 4U",
    componentId: "ssd-cm7-7.68tb",
    platformId: "tyrone-tc-storage-4u",
    ownerEngineerId: "eng-05",
    status: "passed",
    createdISO: "2026-04-26T00:00:00Z",
    completedISO: "2026-05-04T00:00:00Z",
    testPlans: ["IOR sequential", "IOR random", "fio mixed 70/30", "Power-loss-protection", "Sustained 72h"],
    testPlanIds: ["plan-storage-qual"],
    runIds: ["VR-3086"],
    resultSummary: "FW 0107 qualified. Earlier FW 0103 fails sustained random-write tail-latency criterion.",
  },
  {
    id: "QCAMP-2026-0023",
    name: "AMD MI300X × Tyrone TC-MI300X 8U",
    componentId: "gpu-mi300x",
    platformId: "tyrone-tc-mi300x-8u",
    ownerEngineerId: "eng-08",
    status: "passed",
    createdISO: "2026-03-04T00:00:00Z",
    completedISO: "2026-04-11T00:00:00Z",
    testPlans: ["Initial bring-up", "HBM stress", "RCCL all-reduce", "ROCm verification", "Thermal soak"],
    runIds: ["VR-3084", "VR-3087"],
    resultSummary: "Qualified with limitation: requires ROCm 6.1.3 or newer for stable all-reduce.",
  },

  // --- Blocked / failed ---
  {
    id: "QCAMP-2026-0028",
    name: "H100 SXM5 PCIe-passthrough × Tyrone TC-GB200 NVL4",
    componentId: "gpu-h100-sxm5",
    platformId: "tyrone-tc-gb200-nvl4",
    ownerEngineerId: "eng-06",
    status: "passed",
    createdISO: "2026-02-22T00:00:00Z",
    completedISO: "2026-03-04T00:00:00Z",
    testPlans: ["PCIe enumeration", "Driver bind", "Single-GPU CUDA benchmarks"],
    runIds: ["VR-3088"],
    resultSummary: "PCIe-passthrough mode works. Native SXM is incompatible with GB200 topology — limitation noted on qualification.",
  },
  {
    id: "QCAMP-2026-0045",
    name: "BlueField-3 DPU × Tyrone TC-CPU 2U",
    componentId: "nic-bf3-dpu",
    platformId: "tyrone-tc-cpu-2u",
    ownerEngineerId: "eng-04",
    status: "blocked",
    createdISO: "2026-04-30T00:00:00Z",
    testPlans: ["DOCA 2.7 install", "DPU bring-up", "RDMA verification"],
    runIds: [],
    notes: "Blocked on DOCA 2.7 packaging for Rocky 9.4. NVIDIA case NV-2026-44182 open.",
  },
];

export function qualificationById(id: string): Qualification | undefined {
  return qualifications.find((q) => q.id === id);
}
export function campaignById(id: string): QualificationCampaign | undefined {
  return campaigns.find((c) => c.id === id);
}
export function qualificationsByComponent(componentId: string): Qualification[] {
  return qualifications.filter((q) => q.componentId === componentId);
}
export function qualificationsByPlatform(platformId: string): Qualification[] {
  return qualifications.filter((q) => q.platformId === platformId);
}
