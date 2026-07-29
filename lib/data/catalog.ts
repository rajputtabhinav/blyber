import type { Component } from "@/lib/types";

/**
 * Full catalog of "qualifiable things" tracked by the validation lab.
 *
 * Hardware: physical SKUs (instances tracked separately in
 * componentInstances.ts).
 * Firmware: BIOS / BMC / NIC FW / GPU VBIOS — version records only.
 * Software: OS / kernel / drivers / OFED / CUDA / DOCA — version
 * records only.
 *
 * Each (componentId × platformId) pair can have a `Qualification`
 * record stating its qualified state.
 */
export const catalog: Component[] = [
  // ============================================================
  // CPUs
  // ============================================================
  { id: "cpu-xeon-6338",   kind: "CPU", vendor: "Intel", name: "Xeon Gold 6338",       shortName: "Gold 6338",   partNumber: "SRKJ9", tdpW: 205, releasedISO: "2021-04-06T00:00:00Z" },
  { id: "cpu-xeon-6448y",  kind: "CPU", vendor: "Intel", name: "Xeon Gold 6448Y",      shortName: "Gold 6448Y",  partNumber: "SRMG1", tdpW: 225, releasedISO: "2023-01-10T00:00:00Z" },
  { id: "cpu-xeon-8462y",  kind: "CPU", vendor: "Intel", name: "Xeon Platinum 8462Y+", shortName: "Plat 8462Y+", partNumber: "SRMGB", tdpW: 300, releasedISO: "2023-01-10T00:00:00Z" },
  { id: "cpu-xeon-8480",   kind: "CPU", vendor: "Intel", name: "Xeon Platinum 8480+",  shortName: "Plat 8480+",  partNumber: "SRMG3", tdpW: 350, releasedISO: "2023-01-10T00:00:00Z" },
  { id: "cpu-xeon-6248r",  kind: "CPU", vendor: "Intel", name: "Xeon Gold 6248R",      shortName: "Gold 6248R",  partNumber: "SRGZG", tdpW: 205, releasedISO: "2020-02-24T00:00:00Z" },
  { id: "cpu-xeon-6342",   kind: "CPU", vendor: "Intel", name: "Xeon Gold 6342",       shortName: "Gold 6342",   tdpW: 230, releasedISO: "2021-04-06T00:00:00Z" },
  { id: "cpu-xeon-6442y",  kind: "CPU", vendor: "Intel", name: "Xeon Gold 6442Y",      shortName: "Gold 6442Y",  tdpW: 225, releasedISO: "2023-01-10T00:00:00Z" },
  { id: "cpu-xeon-6326",   kind: "CPU", vendor: "Intel", name: "Xeon Gold 6326",       shortName: "Gold 6326",   tdpW: 185, releasedISO: "2021-04-06T00:00:00Z" },
  { id: "cpu-xeon-8470",   kind: "CPU", vendor: "Intel", name: "Xeon Platinum 8470",   shortName: "Plat 8470",   tdpW: 350, releasedISO: "2023-01-10T00:00:00Z" },
  { id: "cpu-epyc-7763",   kind: "CPU", vendor: "AMD",   name: "EPYC 7763",            shortName: "EPYC 7763",   partNumber: "100-000000312", tdpW: 280, releasedISO: "2021-03-15T00:00:00Z" },
  { id: "cpu-epyc-9554",   kind: "CPU", vendor: "AMD",   name: "EPYC 9554",            shortName: "EPYC 9554",   tdpW: 360, releasedISO: "2022-11-10T00:00:00Z" },
  { id: "cpu-epyc-9654",   kind: "CPU", vendor: "AMD",   name: "EPYC 9654",            shortName: "EPYC 9654",   partNumber: "100-000000789", tdpW: 360, releasedISO: "2022-11-10T00:00:00Z" },
  { id: "cpu-altra-max",   kind: "CPU", vendor: "Ampere", name: "Altra Max M128-30",   shortName: "Altra Max",   tdpW: 250, releasedISO: "2021-09-09T00:00:00Z" },
  { id: "cpu-grace",       kind: "CPU", vendor: "NVIDIA", name: "Grace CPU",           shortName: "Grace",       tdpW: 500, releasedISO: "2024-03-18T00:00:00Z", notes: "72-core Arm Neoverse V2; part of Grace Hopper / Grace Blackwell." },

  // ============================================================
  // GPUs
  // ============================================================
  { id: "gpu-h100-sxm5",   kind: "GPU", vendor: "NVIDIA", name: "H100 80GB SXM5",      shortName: "H100 SXM",    partNumber: "900-21010-0000-000", tdpW: 700, releasedISO: "2022-09-20T00:00:00Z" },
  { id: "gpu-h200-sxm5",   kind: "GPU", vendor: "NVIDIA", name: "H200 141GB SXM5",     shortName: "H200 SXM",    tdpW: 700, releasedISO: "2024-03-18T00:00:00Z" },
  { id: "gpu-a100-pcie",   kind: "GPU", vendor: "NVIDIA", name: "A100 80GB PCIe",      shortName: "A100",        partNumber: "900-21001-0000-000", tdpW: 300, releasedISO: "2020-11-16T00:00:00Z" },
  { id: "gpu-l40s",        kind: "GPU", vendor: "NVIDIA", name: "L40S 48GB",           shortName: "L40S",        partNumber: "900-2G133-0080-000", tdpW: 350, releasedISO: "2023-08-08T00:00:00Z" },
  { id: "gpu-b100",        kind: "GPU", vendor: "NVIDIA", name: "B100 192GB SXM6",     shortName: "B100",        tdpW: 700, releasedISO: "2025-03-18T00:00:00Z" },
  { id: "gpu-b200",        kind: "GPU", vendor: "NVIDIA", name: "B200 192GB SXM6",     shortName: "B200",        tdpW: 1000, releasedISO: "2025-03-18T00:00:00Z" },
  { id: "gpu-mi300x",      kind: "GPU", vendor: "AMD",    name: "Instinct MI300X 192GB", shortName: "MI300X",    partNumber: "100-300000003", tdpW: 750, releasedISO: "2023-12-06T00:00:00Z" },

  // ============================================================
  // DIMMs
  // ============================================================
  { id: "dimm-ddr4-3200-32g", kind: "DIMM", vendor: "Hynix",   name: "32GB DDR4-3200 RDIMM", shortName: "32G DDR4-3200", partNumber: "HMA84GR7CJR4N-XN" },
  { id: "dimm-ddr4-2933-32g", kind: "DIMM", vendor: "Samsung", name: "32GB DDR4-2933 RDIMM", shortName: "32G DDR4-2933" },
  { id: "dimm-ddr5-4800-32g", kind: "DIMM", vendor: "Micron",  name: "32GB DDR5-4800 RDIMM", shortName: "32G DDR5-4800", partNumber: "MTC20F2085S1RC48BA1" },
  { id: "dimm-ddr5-4800-64g", kind: "DIMM", vendor: "Samsung", name: "64GB DDR5-4800 RDIMM", shortName: "64G DDR5-4800", partNumber: "M321R8GA0BB0-CQK" },
  { id: "dimm-ddr5-5600-64g", kind: "DIMM", vendor: "Samsung", name: "64GB DDR5-5600 RDIMM", shortName: "64G DDR5-5600" },

  // ============================================================
  // SSDs
  // ============================================================
  { id: "ssd-pm1733-3.84tb", kind: "SSD", vendor: "Samsung", name: "PM1733 3.84TB U.2",     shortName: "PM1733 3.84T", partNumber: "MZWLJ3T8HBLS-00007" },
  { id: "ssd-pm1733-1.92tb", kind: "SSD", vendor: "Samsung", name: "PM1733 1.92TB U.2",     shortName: "PM1733 1.92T" },
  { id: "ssd-pm1743-3.84tb", kind: "SSD", vendor: "Samsung", name: "PM1743 3.84TB E3.S",    shortName: "PM1743 E3.S",  partNumber: "MZ3LO3T8HCJR-00A07" },
  { id: "ssd-cm7-7.68tb",    kind: "SSD", vendor: "Kioxia",  name: "CM7-V 7.68TB U.3",       shortName: "CM7 7.68T",    partNumber: "KCMYDVUG7T68" },
  { id: "ssd-cm7-3.84tb",    kind: "SSD", vendor: "Kioxia",  name: "CM7-V 3.84TB U.3",       shortName: "CM7 3.84T" },
  { id: "ssd-d7-p5520",      kind: "SSD", vendor: "Solidigm", name: "D7-P5520 7.68TB U.2",   shortName: "D7-P5520",     partNumber: "SSDPF2KX076T1" },
  { id: "ssd-pm9a1",         kind: "SSD", vendor: "Samsung", name: "PM9A1 1.92TB",           shortName: "PM9A1" },

  // ============================================================
  // NICs
  // ============================================================
  { id: "nic-cx6dx-100g",    kind: "NIC", vendor: "NVIDIA", name: "ConnectX-6 Dx 2×100GbE", shortName: "CX-6 Dx 100G", partNumber: "MCX623106AN-CDAT" },
  { id: "nic-cx7-400g",      kind: "NIC", vendor: "NVIDIA", name: "ConnectX-7 2×400GbE",    shortName: "CX-7 400G",    partNumber: "MCX755106AS-HEAT" },
  { id: "nic-bf3-dpu",       kind: "NIC", vendor: "NVIDIA", name: "BlueField-3 DPU 2×400G", shortName: "BF-3 DPU" },
  { id: "nic-e810",          kind: "NIC", vendor: "Intel",  name: "E810-CQDA2 2×100GbE",    shortName: "E810",         partNumber: "E810-CQDA2" },
  { id: "nic-57508",         kind: "NIC", vendor: "Broadcom", name: "57508 2×200GbE",        shortName: "BCM57508",     partNumber: "BCM957508-P2200G" },
  { id: "nic-vic-1467",      kind: "NIC", vendor: "Cisco",  name: "VIC 1467 4×25GbE",       shortName: "VIC 1467",     partNumber: "UCSC-M-V25-04" },

  // ============================================================
  // HBAs
  // ============================================================
  { id: "hba-9560-16i",      kind: "HBA", vendor: "Broadcom", name: "9560-16i RAID HBA", shortName: "9560-16i", partNumber: "05-50077-00" },
  { id: "hba-perc-h965i",    kind: "HBA", vendor: "Dell",     name: "PERC H965i Front",  shortName: "PERC H965i", partNumber: "0FNV5N" },

  // ============================================================
  // PSUs
  // ============================================================
  { id: "psu-delta-2400ti",  kind: "PSU", vendor: "Delta",   name: "Titanium 2400W",     shortName: "Delta 2400W", partNumber: "DPS-2400AB-1", tdpW: 2400 },
  { id: "psu-liteon-1600pt", kind: "PSU", vendor: "Lite-On", name: "Platinum 1600W",     shortName: "LO 1600W",    partNumber: "PS-2162-7A1",  tdpW: 1600 },
  { id: "psu-delta-3000ti",  kind: "PSU", vendor: "Delta",   name: "Titanium 3000W",     shortName: "Delta 3000W", tdpW: 3000 },

  // ============================================================
  // BIOS versions (firmware)
  // ============================================================
  { id: "bios-tc-gb200-1.0a",   kind: "BIOS", vendor: "Netweb", name: "TC-GB200 BIOS",   version: "1.0a", releasedISO: "2026-04-12T00:00:00Z" },
  { id: "bios-tc-gb200-1.1b",   kind: "BIOS", vendor: "Netweb", name: "TC-GB200 BIOS",   version: "1.1b", releasedISO: "2026-05-08T00:00:00Z" },
  { id: "bios-tc-h200-1.2",     kind: "BIOS", vendor: "Netweb", name: "TC-H200 BIOS",    version: "1.2",  releasedISO: "2026-04-22T00:00:00Z" },
  { id: "bios-tc-h100-1.4a",    kind: "BIOS", vendor: "Netweb", name: "TC-H100 BIOS",    version: "1.4a", releasedISO: "2026-03-11T00:00:00Z" },
  { id: "bios-tc-cpu-2.0",      kind: "BIOS", vendor: "Netweb", name: "TC-CPU BIOS",     version: "2.0",  releasedISO: "2026-02-19T00:00:00Z" },
  { id: "bios-dell-r760-1.5.0", kind: "BIOS", vendor: "Dell",   name: "R760 BIOS",       version: "1.5.0", releasedISO: "2026-05-02T00:00:00Z" },
  { id: "bios-dell-r760-1.4.8", kind: "BIOS", vendor: "Dell",   name: "R760 BIOS",       version: "1.4.8", releasedISO: "2026-03-04T00:00:00Z" },
  { id: "bios-dell-r750-1.13.3", kind: "BIOS", vendor: "Dell",  name: "R750 BIOS",       version: "1.13.3", releasedISO: "2026-03-08T00:00:00Z" },
  { id: "bios-hpe-dl380g11-2.10", kind: "BIOS", vendor: "HPE",  name: "DL380 Gen11 ROM", version: "U30 2.10", releasedISO: "2026-04-15T00:00:00Z" },

  // ============================================================
  // BMC versions
  // ============================================================
  { id: "bmc-tc-1.0",         kind: "BMC", vendor: "Netweb",   name: "Tyrone BMC",  version: "1.0",         releasedISO: "2026-04-12T00:00:00Z" },
  { id: "bmc-idrac10-7.13.45", kind: "BMC", vendor: "Dell",    name: "iDRAC 10",    version: "7.13.45.00",  releasedISO: "2026-05-12T00:00:00Z" },
  { id: "bmc-idrac10-7.10.30", kind: "BMC", vendor: "Dell",    name: "iDRAC 10",    version: "7.10.30.00",  releasedISO: "2026-02-04T00:00:00Z" },
  { id: "bmc-ilo6-1.55",      kind: "BMC", vendor: "HPE",      name: "iLO 6",       version: "1.55",        releasedISO: "2026-04-12T00:00:00Z" },
  { id: "bmc-ilo5-2.81",      kind: "BMC", vendor: "HPE",      name: "iLO 5",       version: "2.81",        releasedISO: "2026-04-28T00:00:00Z" },

  // ============================================================
  // GPU VBIOS
  // ============================================================
  { id: "fwgpu-h100-96.00.a6.07", kind: "FW_GPU", vendor: "NVIDIA", name: "H100 VBIOS", version: "96.00.A6.00.07", releasedISO: "2026-05-01T00:00:00Z" },
  { id: "fwgpu-h100-96.00.a6.05", kind: "FW_GPU", vendor: "NVIDIA", name: "H100 VBIOS", version: "96.00.A6.00.05", releasedISO: "2025-11-12T00:00:00Z" },
  { id: "fwgpu-mi300-6.1.3",     kind: "FW_GPU", vendor: "AMD",    name: "MI300X VBIOS", version: "6.1.3",        releasedISO: "2026-03-20T00:00:00Z" },
  { id: "fwgpu-mi300-6.1.5",     kind: "FW_GPU", vendor: "AMD",    name: "MI300X VBIOS", version: "6.1.5",        releasedISO: "2026-05-06T00:00:00Z" },

  // ============================================================
  // NIC firmware
  // ============================================================
  { id: "fwnic-cx7-28.39.1002", kind: "FW_NIC", vendor: "NVIDIA",   name: "ConnectX-7 FW", version: "28.39.1002", releasedISO: "2026-04-19T00:00:00Z" },
  { id: "fwnic-cx6dx-22.39",    kind: "FW_NIC", vendor: "NVIDIA",   name: "ConnectX-6 Dx FW", version: "22.39.1002", releasedISO: "2026-04-19T00:00:00Z" },
  { id: "fwnic-cx6dx-22.36",    kind: "FW_NIC", vendor: "NVIDIA",   name: "ConnectX-6 Dx FW", version: "22.36.1010", releasedISO: "2025-12-10T00:00:00Z" },
  { id: "fwnic-bcm-228.0.139",  kind: "FW_NIC", vendor: "Broadcom", name: "BCM57508 FW",   version: "228.0.139",  releasedISO: "2026-04-22T00:00:00Z" },

  // ============================================================
  // SSD firmware
  // ============================================================
  { id: "fwssd-cm7-0107",      kind: "FW_SSD", vendor: "Kioxia",  name: "CM7-V FW",         version: "0107", releasedISO: "2026-04-26T00:00:00Z" },
  { id: "fwssd-cm7-0103",      kind: "FW_SSD", vendor: "Kioxia",  name: "CM7-V FW",         version: "0103", releasedISO: "2025-10-04T00:00:00Z" },
  { id: "fwssd-pm1733-epk99h3q", kind: "FW_SSD", vendor: "Samsung", name: "PM1733 FW",      version: "EPK99H3Q", releasedISO: "2025-09-22T00:00:00Z" },
  { id: "fwssd-pm1743-gdc7402q", kind: "FW_SSD", vendor: "Samsung", name: "PM1743 FW",      version: "GDC7402Q", releasedISO: "2026-02-14T00:00:00Z" },

  // ============================================================
  // OS
  // ============================================================
  { id: "os-rhel-9.4",        kind: "OS", vendor: "Red Hat",   name: "RHEL",          version: "9.4",       releasedISO: "2024-05-01T00:00:00Z" },
  { id: "os-rhel-9.5",        kind: "OS", vendor: "Red Hat",   name: "RHEL",          version: "9.5",       releasedISO: "2024-11-13T00:00:00Z" },
  { id: "os-rhel-8.10",       kind: "OS", vendor: "Red Hat",   name: "RHEL",          version: "8.10",      releasedISO: "2024-05-23T00:00:00Z" },
  { id: "os-ubuntu-24.04",    kind: "OS", vendor: "Canonical", name: "Ubuntu LTS",    version: "24.04",     releasedISO: "2024-04-25T00:00:00Z" },
  { id: "os-ubuntu-22.04",    kind: "OS", vendor: "Canonical", name: "Ubuntu LTS",    version: "22.04",     releasedISO: "2022-04-21T00:00:00Z" },
  { id: "os-rocky-9.4",       kind: "OS", vendor: "Rocky",     name: "Rocky Linux",   version: "9.4",       releasedISO: "2024-05-10T00:00:00Z" },

  // ============================================================
  // Kernel
  // ============================================================
  { id: "kernel-5.14.0-427", kind: "KERNEL", vendor: "Red Hat",   name: "Linux kernel", version: "5.14.0-427", releasedISO: "2024-05-01T00:00:00Z" },
  { id: "kernel-5.14.0-503", kind: "KERNEL", vendor: "Red Hat",   name: "Linux kernel", version: "5.14.0-503", releasedISO: "2024-11-13T00:00:00Z" },
  { id: "kernel-6.8.0-31",   kind: "KERNEL", vendor: "Canonical", name: "Linux kernel", version: "6.8.0-31",   releasedISO: "2024-04-25T00:00:00Z" },
  { id: "kernel-6.5.0-arm64", kind: "KERNEL", vendor: "Mainline",  name: "Linux kernel aarch64", version: "6.5.0", releasedISO: "2024-02-01T00:00:00Z" },

  // ============================================================
  // NVIDIA drivers
  // ============================================================
  { id: "drv-nv-535.129.03", kind: "DRIVER_GPU", vendor: "NVIDIA", name: "NVIDIA Linux driver", version: "535.129.03", releasedISO: "2024-09-15T00:00:00Z" },
  { id: "drv-nv-550.54.15",  kind: "DRIVER_GPU", vendor: "NVIDIA", name: "NVIDIA Linux driver", version: "550.54.15",  releasedISO: "2024-12-04T00:00:00Z" },
  { id: "drv-nv-555.42.06",  kind: "DRIVER_GPU", vendor: "NVIDIA", name: "NVIDIA Linux driver", version: "555.42.06",  releasedISO: "2026-04-22T00:00:00Z" },

  // ============================================================
  // CUDA
  // ============================================================
  { id: "cuda-12.4", kind: "CUDA", vendor: "NVIDIA", name: "CUDA Toolkit", version: "12.4", releasedISO: "2024-03-04T00:00:00Z" },
  { id: "cuda-12.5", kind: "CUDA", vendor: "NVIDIA", name: "CUDA Toolkit", version: "12.5", releasedISO: "2024-05-15T00:00:00Z" },
  { id: "cuda-12.6", kind: "CUDA", vendor: "NVIDIA", name: "CUDA Toolkit", version: "12.6", releasedISO: "2024-08-21T00:00:00Z" },

  // ============================================================
  // OFED
  // ============================================================
  { id: "ofed-23.10", kind: "OFED", vendor: "NVIDIA", name: "MLNX_OFED", version: "23.10-1.1.9.0", releasedISO: "2024-01-15T00:00:00Z" },
  { id: "ofed-24.01", kind: "OFED", vendor: "NVIDIA", name: "MLNX_OFED", version: "24.01-0.3.3.1", releasedISO: "2024-05-20T00:00:00Z" },

  // ============================================================
  // DOCA
  // ============================================================
  { id: "doca-2.5", kind: "DOCA", vendor: "NVIDIA", name: "DOCA",     version: "2.5",  releasedISO: "2024-04-01T00:00:00Z" },
  { id: "doca-2.7", kind: "DOCA", vendor: "NVIDIA", name: "DOCA",     version: "2.7",  releasedISO: "2024-09-10T00:00:00Z" },
];

export function componentById(id: string): Component | undefined {
  return catalog.find((c) => c.id === id);
}

export function componentsByKind(kind: Component["kind"]): Component[] {
  return catalog.filter((c) => c.kind === kind);
}
