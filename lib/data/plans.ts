import type { TestPlan } from "@/lib/types";

/**
 * Test Plan library. Plans are the *definition* of "qualified" for
 * each scope. Versioned. Campaigns reference plans by id; runs
 * execute one plan and are judged by its acceptance criteria.
 */
export const testPlans: TestPlan[] = [
  // ============================================================
  // GPU qualification suite
  // ============================================================
  {
    id: "plan-gpu-qual",
    name: "GPU qualification (full suite)",
    version: "1.4",
    scope: "GPU",
    appliesToKinds: ["GPU"],
    description:
      "End-to-end qualification of a GPU SKU on a target platform: POST visibility, NVLink topology, collective performance, sustained burn, MIG verification.",
    steps: [
      { id: "s1", name: "POST + driver bind", description: "Verify nvidia-smi sees all GPUs at correct rate/links.", command: "nvidia-smi -q", expectedDurationMin: 5, blockingOnFail: true, retryable: false },
      { id: "s2", name: "NVLink topology check", description: "Verify expected NVLink mesh; all peer-pairs at expected bandwidth.", command: "nvidia-smi nvlink -s; nvidia-smi topo -p2p w", expectedDurationMin: 5, blockingOnFail: true, retryable: false },
      { id: "s3", name: "NCCL all-reduce", description: "NCCL collective performance baseline.", command: "all_reduce_perf -b 8 -e 256M -g <n>", expectedDurationMin: 15, blockingOnFail: false, retryable: true },
      { id: "s4", name: "gpu-burn 4h", description: "Sustained 100% load under gpu-burn; watch thermal envelope.", command: "gpu_burn 14400", expectedDurationMin: 240, blockingOnFail: false, retryable: false },
      { id: "s5", name: "HBM stress", description: "HBM bandwidth + ECC scrub.", expectedDurationMin: 60, blockingOnFail: false, retryable: true },
      { id: "s6", name: "MIG partitioning verification", description: "Create/destroy all valid MIG profiles; verify isolation.", expectedDurationMin: 30, blockingOnFail: false, retryable: true },
    ],
    acceptance: [
      { metric: "nccl_allreduce_gbps", unit: "Gbps", comparator: "gte", limit: 380, severity: "must", description: "NCCL all-reduce must clear 380 Gbps on 4× H100 SXM5." },
      { metric: "nccl_allreduce_latency_us", unit: "µs", comparator: "lte", limit: 15, severity: "should" },
      { metric: "gpu_max_hbm_temp_c", unit: "°C", comparator: "lt", limit: 85, severity: "must" },
      { metric: "gpu_burn_minutes_clean", unit: "min", comparator: "gte", limit: 240, severity: "must" },
      { metric: "ecc_errors_total", unit: "count", comparator: "eq", limit: 0, severity: "must" },
    ],
    expectedDurationMin: 355,
    requiredEquipment: ["FLIR thermal camera"],
    requiredSkill: "GPU-trained",
    ownerEngineerId: "eng-06",
    createdISO: "2024-09-04T00:00:00Z",
    updatedISO: "2026-04-18T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // Thermal soak
  // ============================================================
  {
    id: "plan-thermal-soak",
    name: "Thermal soak (4h, 75% load)",
    version: "2.1",
    scope: "Thermal",
    description:
      "Sustained 4-hour mixed workload to characterise the thermal envelope. Records peak CPU/GPU/HBM temps and fan stability.",
    steps: [
      { id: "s1", name: "Inlet baseline", description: "Sample inlet/exhaust ambient for 5 min before load.", expectedDurationMin: 5, blockingOnFail: false, retryable: false },
      { id: "s2", name: "Ramp 25%", description: "stress-ng cpu/mem at 25% for 30 min.", command: "stress-ng --cpu 50% --vm 50% --timeout 1800", expectedDurationMin: 30, blockingOnFail: false, retryable: false },
      { id: "s3", name: "Soak 75%", description: "Sustained 75% mixed workload for 3 hours.", expectedDurationMin: 180, blockingOnFail: false, retryable: false },
      { id: "s4", name: "Recovery", description: "Cool-down; verify fans ramp down correctly.", expectedDurationMin: 25, blockingOnFail: false, retryable: false },
    ],
    acceptance: [
      { metric: "max_cpu_temp_c", unit: "°C", comparator: "lt", limit: 80, severity: "must" },
      { metric: "intake_temp_c", unit: "°C", comparator: "lt", limit: 27, severity: "should" },
      { metric: "exhaust_temp_c", unit: "°C", comparator: "lt", limit: 45, severity: "must" },
      { metric: "fan_rpm_stable", unit: "bool", comparator: "eq", limit: 1, severity: "must" },
    ],
    expectedDurationMin: 240,
    requiredEquipment: ["FLIR thermal camera", "Ambient T/H sensor"],
    ownerEngineerId: "eng-03",
    createdISO: "2024-06-12T00:00:00Z",
    updatedISO: "2026-03-22T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // Burn-in 24/48/72h
  // ============================================================
  {
    id: "plan-burnin-72",
    name: "Burn-in 72h (full system)",
    version: "3.0",
    scope: "Burn-in",
    description:
      "72-hour sustained burn-in across all subsystems for pre-shipment validation. Mixed workload: 45% CPU / 30% memory bw / 25% storage random IO.",
    steps: [
      { id: "s1", name: "Pre-flight", description: "BMC/BIOS sanity + sensor poll baseline.", expectedDurationMin: 10, blockingOnFail: true, retryable: false },
      { id: "s2", name: "8h ramp", description: "Gradual load ramp 25% → 100% over 8h.", expectedDurationMin: 480, blockingOnFail: false, retryable: false },
      { id: "s3", name: "24h sustained", expectedDurationMin: 1440, blockingOnFail: false, retryable: false },
      { id: "s4", name: "48h sustained", expectedDurationMin: 1440, blockingOnFail: false, retryable: false },
      { id: "s5", name: "72h sustained", expectedDurationMin: 1440, blockingOnFail: false, retryable: false },
      { id: "s6", name: "Cool-down + final sweep", expectedDurationMin: 30, blockingOnFail: false, retryable: false },
    ],
    acceptance: [
      { metric: "burn_in_hours", unit: "h", comparator: "gte", limit: 72, severity: "must" },
      { metric: "max_cpu_temp_c", unit: "°C", comparator: "lt", limit: 85, severity: "must" },
      { metric: "degraded_events", unit: "count", comparator: "eq", limit: 0, severity: "must" },
      { metric: "ecc_errors_total", unit: "count", comparator: "lte", limit: 10, severity: "should" },
      { metric: "fan_rpm_stddev", unit: "rpm", comparator: "lt", limit: 200, severity: "should" },
    ],
    expectedDurationMin: 4840,
    ownerEngineerId: "eng-01",
    createdISO: "2024-02-19T00:00:00Z",
    updatedISO: "2026-05-03T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // Memory walk
  // ============================================================
  {
    id: "plan-memory-walk",
    name: "Memory walk (memtester + MLC)",
    version: "1.2",
    scope: "Memory",
    appliesToKinds: ["DIMM"],
    description:
      "Memory subsystem qualification: bit-pattern walk, bandwidth saturation, latency matrix, ECC injection.",
    steps: [
      { id: "s1", name: "Pattern walk", description: "memtester full address space across all patterns.", command: "memtester <ramGB> 2", expectedDurationMin: 120, blockingOnFail: true, retryable: false },
      { id: "s2", name: "MLC bandwidth", description: "Intel MLC bandwidth matrix.", command: "mlc --bandwidth_matrix", expectedDurationMin: 20, blockingOnFail: false, retryable: true },
      { id: "s3", name: "MLC latency", command: "mlc --latency_matrix", expectedDurationMin: 20, blockingOnFail: false, retryable: true },
      { id: "s4", name: "ECC injection", description: "Inject correctable + uncorrectable errors; verify reporting.", expectedDurationMin: 30, blockingOnFail: false, retryable: false },
    ],
    acceptance: [
      { metric: "memtester_pass", unit: "bool", comparator: "eq", limit: 1, severity: "must" },
      { metric: "mlc_bw_gbps", unit: "GB/s", comparator: "gte", limit: 380, severity: "should" },
      { metric: "mlc_latency_ns", unit: "ns", comparator: "lte", limit: 120, severity: "should" },
      { metric: "ecc_correctable_reported", unit: "bool", comparator: "eq", limit: 1, severity: "must" },
    ],
    expectedDurationMin: 200,
    ownerEngineerId: "eng-06",
    createdISO: "2024-04-08T00:00:00Z",
    updatedISO: "2025-12-09T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // Storage qualification
  // ============================================================
  {
    id: "plan-storage-qual",
    name: "Storage qualification (fio sweep)",
    version: "1.1",
    scope: "Storage",
    appliesToKinds: ["SSD", "HDD"],
    description:
      "fio sweep for storage media qualification: sequential, random, mixed, sustained endurance burst, power-loss-protection check.",
    steps: [
      { id: "s1", name: "Sequential read", command: "fio --rw=read --bs=1M --iodepth=32 --time_based --runtime=600", expectedDurationMin: 10, blockingOnFail: false, retryable: false },
      { id: "s2", name: "Sequential write", command: "fio --rw=write --bs=1M --iodepth=32 --time_based --runtime=600", expectedDurationMin: 10, blockingOnFail: false, retryable: false },
      { id: "s3", name: "Random R/W mix 70/30", command: "fio --rw=randrw --rwmixread=70 --bs=4k --iodepth=128 --time_based --runtime=1800", expectedDurationMin: 30, blockingOnFail: false, retryable: false },
      { id: "s4", name: "Sustained random write", description: "Catches steady-state vs burst delta.", expectedDurationMin: 60, blockingOnFail: false, retryable: false },
      { id: "s5", name: "Power-loss-protection", description: "Pull power mid-write; verify PLP retains data.", expectedDurationMin: 20, blockingOnFail: false, retryable: false },
      { id: "s6", name: "SMART scan", expectedDurationMin: 5, blockingOnFail: false, retryable: true },
    ],
    acceptance: [
      { metric: "seq_read_mbps", unit: "MB/s", comparator: "gte", limit: 6000, severity: "must" },
      { metric: "seq_write_mbps", unit: "MB/s", comparator: "gte", limit: 3500, severity: "must" },
      { metric: "random_70_30_iops", unit: "IOPS", comparator: "gte", limit: 1000000, severity: "should" },
      { metric: "p99_latency_us", unit: "µs", comparator: "lte", limit: 200, severity: "should" },
      { metric: "sustained_write_tail_us", unit: "µs", comparator: "lte", limit: 800, severity: "must" },
      { metric: "smart_pass", unit: "bool", comparator: "eq", limit: 1, severity: "must" },
    ],
    expectedDurationMin: 135,
    ownerEngineerId: "eng-05",
    createdISO: "2024-03-15T00:00:00Z",
    updatedISO: "2026-04-26T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // Network qualification
  // ============================================================
  {
    id: "plan-network-qual",
    name: "Network qualification (iperf + IB)",
    version: "1.3",
    scope: "Network",
    appliesToKinds: ["NIC"],
    description:
      "NIC qualification covering Ethernet + InfiniBand: link bring-up, bidirectional bandwidth, latency, packet loss, MTU sweep, fabric error counters.",
    steps: [
      { id: "s1", name: "Link bring-up", description: "Verify link up at expected rate, no FEC errors.", expectedDurationMin: 5, blockingOnFail: true, retryable: false },
      { id: "s2", name: "iperf3 bidirectional", command: "iperf3 -c <peer> --bidir -t 600", expectedDurationMin: 10, blockingOnFail: false, retryable: true },
      { id: "s3", name: "ib_write_bw bidir", command: "ib_write_bw -b --report_gbits", expectedDurationMin: 5, blockingOnFail: false, retryable: true },
      { id: "s4", name: "Latency RTT", expectedDurationMin: 5, blockingOnFail: false, retryable: true },
      { id: "s5", name: "Packet loss / link flap", description: "Long-hold (1h) link integrity check.", expectedDurationMin: 60, blockingOnFail: false, retryable: false },
      { id: "s6", name: "Fabric counter sweep", description: "Capture port_xmit_discards / symbol_error / link_downed.", expectedDurationMin: 5, blockingOnFail: false, retryable: false },
    ],
    acceptance: [
      { metric: "ib_write_bw_gbps", unit: "Gbps", comparator: "gte", limit: 380, severity: "must" },
      { metric: "iperf3_bidir_gbps", unit: "Gbps", comparator: "gte", limit: 90, severity: "must" },
      { metric: "rtt_p50_us", unit: "µs", comparator: "lte", limit: 5, severity: "should" },
      { metric: "p2p1_link_flap_count", unit: "count", comparator: "eq", limit: 0, severity: "must" },
      { metric: "symbol_error_count", unit: "count", comparator: "lte", limit: 100, severity: "should" },
    ],
    expectedDurationMin: 90,
    ownerEngineerId: "eng-04",
    createdISO: "2024-05-22T00:00:00Z",
    updatedISO: "2026-04-19T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // Power redundancy
  // ============================================================
  {
    id: "plan-power-redundancy",
    name: "Power redundancy (N+1 / N+N failover)",
    version: "1.0",
    scope: "Power",
    appliesToKinds: ["PSU"],
    description:
      "Pull a PSU mid-load and verify redundancy; verify AC failover and re-energise.",
    steps: [
      { id: "s1", name: "1+1 redundancy pull", expectedDurationMin: 10, blockingOnFail: true, retryable: false },
      { id: "s2", name: "2+2 redundancy pull", expectedDurationMin: 10, blockingOnFail: false, retryable: false },
      { id: "s3", name: "AC input fault simulation", description: "Drop one AC feed; verify no impact.", expectedDurationMin: 10, blockingOnFail: false, retryable: false },
      { id: "s4", name: "PSU hot-swap", description: "Replace PSU under load.", expectedDurationMin: 10, blockingOnFail: false, retryable: false },
    ],
    acceptance: [
      { metric: "failover_to_remaining_psu", unit: "bool", comparator: "eq", limit: 1, severity: "must" },
      { metric: "auto_recover_on_restore", unit: "bool", comparator: "eq", limit: 1, severity: "must" },
      { metric: "power_blip_ms", unit: "ms", comparator: "lte", limit: 50, severity: "should" },
    ],
    expectedDurationMin: 60,
    ownerEngineerId: "eng-09",
    createdISO: "2024-07-04T00:00:00Z",
    updatedISO: "2026-02-04T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // BIOS/BMC qualification
  // ============================================================
  {
    id: "plan-firmware-bios-bmc",
    name: "BIOS + BMC qualification",
    version: "1.2",
    scope: "Firmware",
    appliesToKinds: ["BIOS", "BMC"],
    description:
      "Per-version qualification of platform firmware: boot variants, recovery flow, settings persistence, BMC redfish/IPMI coverage.",
    steps: [
      { id: "s1", name: "Cold boot", expectedDurationMin: 5, blockingOnFail: true, retryable: false },
      { id: "s2", name: "Memory training under all valid DIMM topologies", expectedDurationMin: 30, blockingOnFail: true, retryable: false },
      { id: "s3", name: "PCIe enumeration sweep", expectedDurationMin: 10, blockingOnFail: false, retryable: false },
      { id: "s4", name: "BIOS settings persistence", expectedDurationMin: 10, blockingOnFail: false, retryable: false },
      { id: "s5", name: "Dual-BIOS recovery", expectedDurationMin: 15, blockingOnFail: false, retryable: false },
      { id: "s6", name: "Redfish API coverage", expectedDurationMin: 15, blockingOnFail: false, retryable: true },
      { id: "s7", name: "IPMI API coverage", expectedDurationMin: 15, blockingOnFail: false, retryable: true },
    ],
    acceptance: [
      { metric: "post_pass_rate", unit: "%", comparator: "gte", limit: 100, severity: "must" },
      { metric: "settings_persist_pass", unit: "bool", comparator: "eq", limit: 1, severity: "must" },
      { metric: "redfish_coverage_pct", unit: "%", comparator: "gte", limit: 95, severity: "should" },
      { metric: "recovery_pass_rate", unit: "%", comparator: "gte", limit: 100, severity: "must" },
    ],
    expectedDurationMin: 100,
    ownerEngineerId: "eng-02",
    createdISO: "2024-08-19T00:00:00Z",
    updatedISO: "2026-05-08T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // NVIDIA driver qualification (composite)
  // ============================================================
  {
    id: "plan-nvidia-driver",
    name: "NVIDIA driver qualification",
    version: "2.0",
    scope: "Firmware",
    appliesToKinds: ["DRIVER_GPU"],
    description:
      "Triggered automatically on NVIDIA driver release. Composes GPU + Network plans with regression checks against a baseline run.",
    steps: [
      { id: "s1", name: "Driver install + load", expectedDurationMin: 10, blockingOnFail: true, retryable: false },
      { id: "s2", name: "GPU qualification suite", description: "Run plan-gpu-qual.", expectedDurationMin: 355, blockingOnFail: false, retryable: false },
      { id: "s3", name: "Network qualification (NCCL leg)", expectedDurationMin: 30, blockingOnFail: false, retryable: false },
      { id: "s4", name: "Baseline regression check", description: "Diff metrics vs previous-driver baseline; flag >2% drops.", expectedDurationMin: 5, blockingOnFail: false, retryable: false },
    ],
    acceptance: [
      { metric: "nccl_allreduce_gbps", unit: "Gbps", comparator: "gte", limit: 380, severity: "must" },
      { metric: "perf_regression_pct", unit: "%", comparator: "lte", limit: 2, severity: "must", description: "No metric may regress more than 2% vs previous-driver baseline." },
      { metric: "driver_install_pass", unit: "bool", comparator: "eq", limit: 1, severity: "must" },
    ],
    expectedDurationMin: 400,
    requiredSkill: "GPU-trained",
    ownerEngineerId: "eng-02",
    createdISO: "2024-11-04T00:00:00Z",
    updatedISO: "2026-04-30T00:00:00Z",
    status: "active",
  },

  // ============================================================
  // Deprecated plan (kept for history)
  // ============================================================
  {
    id: "plan-gpu-qual-legacy-v0",
    name: "GPU qualification (legacy)",
    version: "0.9",
    scope: "GPU",
    description: "Original GPU plan. Replaced by plan-gpu-qual v1.x. Kept for run history.",
    steps: [],
    acceptance: [],
    expectedDurationMin: 0,
    ownerEngineerId: "eng-06",
    createdISO: "2023-11-12T00:00:00Z",
    updatedISO: "2024-09-04T00:00:00Z",
    status: "deprecated",
  },
];

export function testPlanById(id: string): TestPlan | undefined {
  return testPlans.find((p) => p.id === id);
}

export function testPlansForKind(kind: string): TestPlan[] {
  return testPlans.filter((p) => p.appliesToKinds?.includes(kind as never));
}
