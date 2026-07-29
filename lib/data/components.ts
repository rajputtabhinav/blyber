import type { ComponentDef, CompatCell } from "@/lib/types";

export const matrixComponents: ComponentDef[] = [
  // NIC
  { id: "cmp-nic-01", name: "ConnectX-6 Dx 2×100GbE", vendor: "NVIDIA / Mellanox", category: "NIC", partNumber: "MCX623106AN-CDAT" },
  { id: "cmp-nic-02", name: "ConnectX-7 2×400GbE", vendor: "NVIDIA / Mellanox", category: "NIC", partNumber: "MCX755106AS-HEAT" },
  { id: "cmp-nic-03", name: "Intel E810 2×100GbE", vendor: "Intel", category: "NIC", partNumber: "E810-CQDA2" },
  { id: "cmp-nic-04", name: "Broadcom 57508 2×200GbE", vendor: "Broadcom", category: "NIC", partNumber: "BCM957508-P2200G" },
  { id: "cmp-nic-05", name: "Cisco VIC 1467 4×25GbE", vendor: "Cisco", category: "NIC", partNumber: "UCSC-M-V25-04" },

  // GPU
  { id: "cmp-gpu-01", name: "NVIDIA H100 80GB SXM5", vendor: "NVIDIA", category: "GPU", partNumber: "900-21010-0000-000" },
  { id: "cmp-gpu-02", name: "NVIDIA A100 80GB PCIe", vendor: "NVIDIA", category: "GPU", partNumber: "900-21001-0000-000" },
  { id: "cmp-gpu-03", name: "NVIDIA L40S 48GB", vendor: "NVIDIA", category: "GPU", partNumber: "900-2G133-0080-000" },
  { id: "cmp-gpu-04", name: "AMD Instinct MI300X 192GB", vendor: "AMD", category: "GPU", partNumber: "100-300000003" },

  // SSD
  { id: "cmp-ssd-01", name: "Samsung PM1733 3.84TB U.2", vendor: "Samsung", category: "SSD", partNumber: "MZWLJ3T8HBLS-00007" },
  { id: "cmp-ssd-02", name: "Kioxia CM7-V 7.68TB U.3", vendor: "Kioxia", category: "SSD", partNumber: "KCMYDVUG7T68" },
  { id: "cmp-ssd-03", name: "Intel D7-P5520 7.68TB U.2", vendor: "Intel / Solidigm", category: "SSD", partNumber: "SSDPF2KX076T1" },
  { id: "cmp-ssd-04", name: "Samsung PM1743 3.84TB E3.S", vendor: "Samsung", category: "SSD", partNumber: "MZ3LO3T8HCJR-00A07" },

  // HBA
  { id: "cmp-hba-01", name: "Broadcom 9560-16i RAID HBA", vendor: "Broadcom", category: "HBA", partNumber: "05-50077-00" },
  { id: "cmp-hba-02", name: "PERC H965i RAID Controller", vendor: "Dell", category: "HBA", partNumber: "0FNV5N" },

  // DIMM
  { id: "cmp-dimm-01", name: "32GB DDR5-4800 RDIMM", vendor: "Micron", category: "DIMM", partNumber: "MTC20F2085S1RC48BA1" },
  { id: "cmp-dimm-02", name: "64GB DDR5-4800 RDIMM", vendor: "Samsung", category: "DIMM", partNumber: "M321R8GA0BB0-CQK" },
  { id: "cmp-dimm-03", name: "32GB DDR4-3200 RDIMM", vendor: "Hynix", category: "DIMM", partNumber: "HMA84GR7CJR4N-XN" },

  // PSU
  { id: "cmp-psu-01", name: "Titanium 2400W PSU", vendor: "Delta", category: "PSU", partNumber: "DPS-2400AB-1" },
  { id: "cmp-psu-02", name: "Platinum 1600W PSU", vendor: "Lite-On", category: "PSU", partNumber: "PS-2162-7A1" },
];

// Server models for matrix columns
export const matrixServerModels = [
  { id: "r740xd", name: "PowerEdge R740xd", vendor: "Dell 14G" },
  { id: "r750", name: "PowerEdge R750", vendor: "Dell 15G" },
  { id: "r760", name: "PowerEdge R760", vendor: "Dell 16G" },
  { id: "dl380g10", name: "ProLiant DL380 Gen10", vendor: "HPE Gen10" },
  { id: "dl380g11", name: "ProLiant DL380 Gen11", vendor: "HPE Gen11" },
  { id: "dl385g11", name: "ProLiant DL385 Gen11", vendor: "HPE Gen11" },
  { id: "x12", name: "X12DPi-NT6", vendor: "Supermicro X12" },
  { id: "x13", name: "X13DEM", vendor: "Supermicro X13" },
  { id: "sr650v2", name: "SR650 V2", vendor: "Lenovo V2" },
  { id: "sr650v3", name: "SR650 V3", vendor: "Lenovo V3" },
  { id: "c240m7", name: "UCS C240 M7", vendor: "Cisco M7" },
];

// helper to build cells quickly
type Status = "ok" | "warn" | "crit" | "untested" | "pending";
function c(cmp: string, model: string, status: Status, firmware?: string): CompatCell {
  return { componentId: cmp, serverModel: model, status, firmware };
}

export const matrixCells: CompatCell[] = [
  // ConnectX-6 Dx
  c("cmp-nic-01", "r740xd", "ok", "22.39.1002"),
  c("cmp-nic-01", "r750", "ok", "22.39.1002"),
  c("cmp-nic-01", "r760", "ok", "22.39.1002"),
  c("cmp-nic-01", "dl380g10", "ok", "22.39.1002"),
  c("cmp-nic-01", "dl380g11", "ok", "22.39.1002"),
  c("cmp-nic-01", "dl385g11", "ok", "22.39.1002"),
  c("cmp-nic-01", "x12", "ok", "22.39.1002"),
  c("cmp-nic-01", "x13", "ok", "22.39.1002"),
  c("cmp-nic-01", "sr650v2", "warn", "22.36.1010"),
  c("cmp-nic-01", "sr650v3", "ok", "22.39.1002"),
  c("cmp-nic-01", "c240m7", "ok", "22.39.1002"),

  // ConnectX-7
  c("cmp-nic-02", "r740xd", "crit"),
  c("cmp-nic-02", "r750", "warn", "28.39.1002"),
  c("cmp-nic-02", "r760", "ok", "28.39.1002"),
  c("cmp-nic-02", "dl380g10", "crit"),
  c("cmp-nic-02", "dl380g11", "ok", "28.39.1002"),
  c("cmp-nic-02", "dl385g11", "ok", "28.39.1002"),
  c("cmp-nic-02", "x12", "pending"),
  c("cmp-nic-02", "x13", "ok", "28.39.1002"),
  c("cmp-nic-02", "sr650v2", "crit"),
  c("cmp-nic-02", "sr650v3", "ok", "28.39.1002"),
  c("cmp-nic-02", "c240m7", "warn", "28.36.1010"),

  // Intel E810
  c("cmp-nic-03", "r740xd", "ok", "4.40"),
  c("cmp-nic-03", "r750", "ok", "4.40"),
  c("cmp-nic-03", "r760", "ok", "4.50"),
  c("cmp-nic-03", "dl380g10", "warn", "4.20"),
  c("cmp-nic-03", "dl380g11", "ok", "4.50"),
  c("cmp-nic-03", "dl385g11", "ok", "4.50"),
  c("cmp-nic-03", "x12", "ok", "4.40"),
  c("cmp-nic-03", "x13", "ok", "4.50"),
  c("cmp-nic-03", "sr650v2", "ok", "4.40"),
  c("cmp-nic-03", "sr650v3", "ok", "4.50"),
  c("cmp-nic-03", "c240m7", "untested"),

  // Broadcom 57508
  c("cmp-nic-04", "r740xd", "ok", "228.0.139"),
  c("cmp-nic-04", "r750", "ok", "228.0.139"),
  c("cmp-nic-04", "r760", "ok", "228.0.139"),
  c("cmp-nic-04", "dl380g10", "ok", "228.0.131"),
  c("cmp-nic-04", "dl380g11", "ok", "228.0.139"),
  c("cmp-nic-04", "dl385g11", "ok", "228.0.139"),
  c("cmp-nic-04", "x12", "warn", "228.0.131"),
  c("cmp-nic-04", "x13", "ok", "228.0.139"),
  c("cmp-nic-04", "sr650v2", "ok", "228.0.139"),
  c("cmp-nic-04", "sr650v3", "ok", "228.0.139"),
  c("cmp-nic-04", "c240m7", "untested"),

  // Cisco VIC
  c("cmp-nic-05", "r740xd", "crit"),
  c("cmp-nic-05", "r750", "crit"),
  c("cmp-nic-05", "r760", "crit"),
  c("cmp-nic-05", "dl380g10", "crit"),
  c("cmp-nic-05", "dl380g11", "crit"),
  c("cmp-nic-05", "dl385g11", "crit"),
  c("cmp-nic-05", "x12", "crit"),
  c("cmp-nic-05", "x13", "crit"),
  c("cmp-nic-05", "sr650v2", "crit"),
  c("cmp-nic-05", "sr650v3", "crit"),
  c("cmp-nic-05", "c240m7", "ok", "5.3(1a)"),

  // H100 SXM5
  c("cmp-gpu-01", "r740xd", "crit"),
  c("cmp-gpu-01", "r750", "ok", "535.129.03"),
  c("cmp-gpu-01", "r760", "ok", "550.54.15"),
  c("cmp-gpu-01", "dl380g10", "crit"),
  c("cmp-gpu-01", "dl380g11", "ok", "550.54.15"),
  c("cmp-gpu-01", "dl385g11", "warn", "535.129.03"),
  c("cmp-gpu-01", "x12", "untested"),
  c("cmp-gpu-01", "x13", "ok", "550.54.15"),
  c("cmp-gpu-01", "sr650v2", "crit"),
  c("cmp-gpu-01", "sr650v3", "ok", "550.54.15"),
  c("cmp-gpu-01", "c240m7", "warn", "535.129.03"),

  // A100 PCIe
  c("cmp-gpu-02", "r740xd", "ok", "535.86.10"),
  c("cmp-gpu-02", "r750", "ok", "550.54.15"),
  c("cmp-gpu-02", "r760", "ok", "550.54.15"),
  c("cmp-gpu-02", "dl380g10", "ok", "535.86.10"),
  c("cmp-gpu-02", "dl380g11", "ok", "550.54.15"),
  c("cmp-gpu-02", "dl385g11", "ok", "550.54.15"),
  c("cmp-gpu-02", "x12", "ok", "535.86.10"),
  c("cmp-gpu-02", "x13", "ok", "550.54.15"),
  c("cmp-gpu-02", "sr650v2", "ok", "535.86.10"),
  c("cmp-gpu-02", "sr650v3", "ok", "550.54.15"),
  c("cmp-gpu-02", "c240m7", "ok", "550.54.15"),

  // L40S
  c("cmp-gpu-03", "r740xd", "warn", "535.129.03"),
  c("cmp-gpu-03", "r750", "ok", "550.54.15"),
  c("cmp-gpu-03", "r760", "ok", "550.54.15"),
  c("cmp-gpu-03", "dl380g10", "untested"),
  c("cmp-gpu-03", "dl380g11", "ok", "550.54.15"),
  c("cmp-gpu-03", "dl385g11", "ok", "550.54.15"),
  c("cmp-gpu-03", "x12", "warn", "535.129.03"),
  c("cmp-gpu-03", "x13", "ok", "550.54.15"),
  c("cmp-gpu-03", "sr650v2", "pending"),
  c("cmp-gpu-03", "sr650v3", "ok", "550.54.15"),
  c("cmp-gpu-03", "c240m7", "ok", "550.54.15"),

  // MI300X
  c("cmp-gpu-04", "r740xd", "crit"),
  c("cmp-gpu-04", "r750", "untested"),
  c("cmp-gpu-04", "r760", "pending"),
  c("cmp-gpu-04", "dl380g10", "crit"),
  c("cmp-gpu-04", "dl380g11", "untested"),
  c("cmp-gpu-04", "dl385g11", "pending"),
  c("cmp-gpu-04", "x12", "crit"),
  c("cmp-gpu-04", "x13", "ok", "6.1.3"),
  c("cmp-gpu-04", "sr650v2", "crit"),
  c("cmp-gpu-04", "sr650v3", "untested"),
  c("cmp-gpu-04", "c240m7", "untested"),

  // PM1733
  c("cmp-ssd-01", "r740xd", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "r750", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "r760", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "dl380g10", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "dl380g11", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "dl385g11", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "x12", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "x13", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "sr650v2", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "sr650v3", "ok", "EPK99H3Q"),
  c("cmp-ssd-01", "c240m7", "ok", "EPK99H3Q"),

  // Kioxia CM7
  c("cmp-ssd-02", "r740xd", "warn", "0103"),
  c("cmp-ssd-02", "r750", "ok", "0107"),
  c("cmp-ssd-02", "r760", "ok", "0107"),
  c("cmp-ssd-02", "dl380g10", "warn", "0103"),
  c("cmp-ssd-02", "dl380g11", "ok", "0107"),
  c("cmp-ssd-02", "dl385g11", "ok", "0107"),
  c("cmp-ssd-02", "x12", "ok", "0107"),
  c("cmp-ssd-02", "x13", "ok", "0107"),
  c("cmp-ssd-02", "sr650v2", "warn", "0103"),
  c("cmp-ssd-02", "sr650v3", "ok", "0107"),
  c("cmp-ssd-02", "c240m7", "ok", "0107"),

  // Intel D7-P5520
  c("cmp-ssd-03", "r740xd", "ok", "9CV10410"),
  c("cmp-ssd-03", "r750", "ok", "9CV10410"),
  c("cmp-ssd-03", "r760", "ok", "9CV10410"),
  c("cmp-ssd-03", "dl380g10", "ok", "9CV10410"),
  c("cmp-ssd-03", "dl380g11", "ok", "9CV10410"),
  c("cmp-ssd-03", "dl385g11", "ok", "9CV10410"),
  c("cmp-ssd-03", "x12", "ok", "9CV10410"),
  c("cmp-ssd-03", "x13", "ok", "9CV10410"),
  c("cmp-ssd-03", "sr650v2", "ok", "9CV10410"),
  c("cmp-ssd-03", "sr650v3", "ok", "9CV10410"),
  c("cmp-ssd-03", "c240m7", "ok", "9CV10410"),

  // PM1743 E3.S
  c("cmp-ssd-04", "r740xd", "crit"),
  c("cmp-ssd-04", "r750", "crit"),
  c("cmp-ssd-04", "r760", "ok", "GDC7402Q"),
  c("cmp-ssd-04", "dl380g10", "crit"),
  c("cmp-ssd-04", "dl380g11", "ok", "GDC7402Q"),
  c("cmp-ssd-04", "dl385g11", "ok", "GDC7402Q"),
  c("cmp-ssd-04", "x12", "untested"),
  c("cmp-ssd-04", "x13", "ok", "GDC7402Q"),
  c("cmp-ssd-04", "sr650v2", "crit"),
  c("cmp-ssd-04", "sr650v3", "ok", "GDC7402Q"),
  c("cmp-ssd-04", "c240m7", "pending"),

  // Broadcom 9560
  c("cmp-hba-01", "r740xd", "ok", "5.2206.00"),
  c("cmp-hba-01", "r750", "ok", "5.2206.00"),
  c("cmp-hba-01", "r760", "ok", "5.2206.00"),
  c("cmp-hba-01", "dl380g10", "ok", "5.2206.00"),
  c("cmp-hba-01", "dl380g11", "ok", "5.2206.00"),
  c("cmp-hba-01", "dl385g11", "ok", "5.2206.00"),
  c("cmp-hba-01", "x12", "ok", "5.2206.00"),
  c("cmp-hba-01", "x13", "ok", "5.2206.00"),
  c("cmp-hba-01", "sr650v2", "ok", "5.2206.00"),
  c("cmp-hba-01", "sr650v3", "ok", "5.2206.00"),
  c("cmp-hba-01", "c240m7", "ok", "5.2206.00"),

  // PERC H965i
  c("cmp-hba-02", "r740xd", "untested"),
  c("cmp-hba-02", "r750", "ok", "8.6.0.0-19"),
  c("cmp-hba-02", "r760", "ok", "8.7.0.0-22"),
  c("cmp-hba-02", "dl380g10", "crit"),
  c("cmp-hba-02", "dl380g11", "crit"),
  c("cmp-hba-02", "dl385g11", "crit"),
  c("cmp-hba-02", "x12", "crit"),
  c("cmp-hba-02", "x13", "crit"),
  c("cmp-hba-02", "sr650v2", "crit"),
  c("cmp-hba-02", "sr650v3", "crit"),
  c("cmp-hba-02", "c240m7", "crit"),

  // DDR5-4800 32GB
  c("cmp-dimm-01", "r740xd", "crit"),
  c("cmp-dimm-01", "r750", "warn"),
  c("cmp-dimm-01", "r760", "ok"),
  c("cmp-dimm-01", "dl380g10", "crit"),
  c("cmp-dimm-01", "dl380g11", "ok"),
  c("cmp-dimm-01", "dl385g11", "ok"),
  c("cmp-dimm-01", "x12", "crit"),
  c("cmp-dimm-01", "x13", "ok"),
  c("cmp-dimm-01", "sr650v2", "crit"),
  c("cmp-dimm-01", "sr650v3", "ok"),
  c("cmp-dimm-01", "c240m7", "ok"),

  // DDR5-4800 64GB
  c("cmp-dimm-02", "r740xd", "crit"),
  c("cmp-dimm-02", "r750", "crit"),
  c("cmp-dimm-02", "r760", "ok"),
  c("cmp-dimm-02", "dl380g10", "crit"),
  c("cmp-dimm-02", "dl380g11", "ok"),
  c("cmp-dimm-02", "dl385g11", "ok"),
  c("cmp-dimm-02", "x12", "crit"),
  c("cmp-dimm-02", "x13", "ok"),
  c("cmp-dimm-02", "sr650v2", "crit"),
  c("cmp-dimm-02", "sr650v3", "ok"),
  c("cmp-dimm-02", "c240m7", "ok"),

  // DDR4-3200 32GB
  c("cmp-dimm-03", "r740xd", "ok"),
  c("cmp-dimm-03", "r750", "ok"),
  c("cmp-dimm-03", "r760", "crit"),
  c("cmp-dimm-03", "dl380g10", "ok"),
  c("cmp-dimm-03", "dl380g11", "crit"),
  c("cmp-dimm-03", "dl385g11", "crit"),
  c("cmp-dimm-03", "x12", "ok"),
  c("cmp-dimm-03", "x13", "crit"),
  c("cmp-dimm-03", "sr650v2", "ok"),
  c("cmp-dimm-03", "sr650v3", "crit"),
  c("cmp-dimm-03", "c240m7", "crit"),

  // Delta 2400W
  c("cmp-psu-01", "r740xd", "untested"),
  c("cmp-psu-01", "r750", "ok"),
  c("cmp-psu-01", "r760", "ok"),
  c("cmp-psu-01", "dl380g10", "untested"),
  c("cmp-psu-01", "dl380g11", "ok"),
  c("cmp-psu-01", "dl385g11", "ok"),
  c("cmp-psu-01", "x12", "ok"),
  c("cmp-psu-01", "x13", "ok"),
  c("cmp-psu-01", "sr650v2", "untested"),
  c("cmp-psu-01", "sr650v3", "ok"),
  c("cmp-psu-01", "c240m7", "ok"),

  // Lite-On 1600W
  c("cmp-psu-02", "r740xd", "ok"),
  c("cmp-psu-02", "r750", "ok"),
  c("cmp-psu-02", "r760", "warn"),
  c("cmp-psu-02", "dl380g10", "ok"),
  c("cmp-psu-02", "dl380g11", "ok"),
  c("cmp-psu-02", "dl385g11", "ok"),
  c("cmp-psu-02", "x12", "ok"),
  c("cmp-psu-02", "x13", "ok"),
  c("cmp-psu-02", "sr650v2", "ok"),
  c("cmp-psu-02", "sr650v3", "ok"),
  c("cmp-psu-02", "c240m7", "ok"),
];

export function getCell(cmpId: string, modelId: string): CompatCell | undefined {
  return matrixCells.find((c) => c.componentId === cmpId && c.serverModel === modelId);
}
