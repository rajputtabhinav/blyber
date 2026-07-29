import type { FirmwareEntry } from "@/lib/types";

export const firmware: FirmwareEntry[] = [
  // BIOS
  { id: "fw-001", name: "Dell R740xd BIOS", vendor: "Dell", category: "BIOS", currentVersion: "2.18.0", latestVersion: "2.18.1", releasedISO: "2026-04-22T00:00:00Z", appliesTo: 14, fileSizeMB: 32, critical: false, state: "behind" },
  { id: "fw-002", name: "Dell R750 BIOS", vendor: "Dell", category: "BIOS", currentVersion: "1.13.3", latestVersion: "1.13.3", releasedISO: "2026-03-08T00:00:00Z", appliesTo: 9, fileSizeMB: 38, critical: false, state: "matching" },
  { id: "fw-003", name: "Dell R760 BIOS", vendor: "Dell", category: "BIOS", currentVersion: "1.4.8", latestVersion: "1.5.0", releasedISO: "2026-05-02T00:00:00Z", appliesTo: 11, fileSizeMB: 42, critical: true, state: "critical" },
  { id: "fw-004", name: "HPE DL380 Gen10 ROM", vendor: "HPE", category: "BIOS", currentVersion: "U30 2.08", latestVersion: "U30 2.10", releasedISO: "2026-04-15T00:00:00Z", appliesTo: 6, fileSizeMB: 28, critical: false, state: "behind" },
  { id: "fw-005", name: "HPE DL380 Gen11 ROM", vendor: "HPE", category: "BIOS", currentVersion: "U30 2.10", latestVersion: "U30 2.10", releasedISO: "2026-04-15T00:00:00Z", appliesTo: 5, fileSizeMB: 31, critical: false, state: "matching" },
  { id: "fw-006", name: "HPE DL385 Gen11 ROM", vendor: "HPE", category: "BIOS", currentVersion: "A47 3.10", latestVersion: "A47 3.10", releasedISO: "2026-04-15T00:00:00Z", appliesTo: 4, fileSizeMB: 30, critical: false, state: "matching" },
  { id: "fw-007", name: "Supermicro X12 BIOS", vendor: "Supermicro", category: "BIOS", currentVersion: "1.3c", latestVersion: "1.3c", releasedISO: "2026-02-19T00:00:00Z", appliesTo: 4, fileSizeMB: 24, critical: false, state: "matching" },
  { id: "fw-008", name: "Supermicro X13 BIOS", vendor: "Supermicro", category: "BIOS", currentVersion: "1.4a", latestVersion: "1.5", releasedISO: "2026-04-30T00:00:00Z", appliesTo: 5, fileSizeMB: 26, critical: false, state: "behind" },
  { id: "fw-009", name: "Lenovo SR650 V3 BIOS", vendor: "Lenovo", category: "BIOS", currentVersion: "ESE110I-1.50", latestVersion: "ESE110I-1.51", releasedISO: "2026-05-05T00:00:00Z", appliesTo: 3, fileSizeMB: 28, critical: false, state: "behind" },
  { id: "fw-010", name: "Cisco UCS C240 M7 BIOS", vendor: "Cisco", category: "BIOS", currentVersion: "C240M7.4.3.2g", latestVersion: "C240M7.4.3.2g", releasedISO: "2026-03-22T00:00:00Z", appliesTo: 2, fileSizeMB: 22, critical: false, state: "matching" },

  // BMC
  { id: "fw-011", name: "Dell iDRAC 9", vendor: "Dell", category: "BMC", currentVersion: "5.10.50.00", latestVersion: "5.10.50.00", releasedISO: "2026-03-30T00:00:00Z", appliesTo: 14, fileSizeMB: 110, critical: false, state: "matching" },
  { id: "fw-012", name: "Dell iDRAC 10", vendor: "Dell", category: "BMC", currentVersion: "7.10.30.00", latestVersion: "7.13.45.00", releasedISO: "2026-05-12T00:00:00Z", appliesTo: 11, fileSizeMB: 145, critical: true, state: "critical" },
  { id: "fw-013", name: "HPE iLO 5", vendor: "HPE", category: "BMC", currentVersion: "2.78", latestVersion: "2.81", releasedISO: "2026-04-28T00:00:00Z", appliesTo: 6, fileSizeMB: 96, critical: true, state: "critical" },
  { id: "fw-014", name: "HPE iLO 6", vendor: "HPE", category: "BMC", currentVersion: "1.55", latestVersion: "1.55", releasedISO: "2026-04-12T00:00:00Z", appliesTo: 9, fileSizeMB: 102, critical: false, state: "matching" },
  { id: "fw-015", name: "Supermicro BMC X12/X13", vendor: "Supermicro / AMI", category: "BMC", currentVersion: "01.74.10", latestVersion: "01.74.18", releasedISO: "2026-05-08T00:00:00Z", appliesTo: 9, fileSizeMB: 64, critical: false, state: "behind" },
  { id: "fw-016", name: "Lenovo XCC", vendor: "Lenovo", category: "BMC", currentVersion: "XCC 7.30", latestVersion: "XCC 7.30", releasedISO: "2026-04-02T00:00:00Z", appliesTo: 4, fileSizeMB: 88, critical: false, state: "matching" },
  { id: "fw-017", name: "Cisco CIMC", vendor: "Cisco", category: "BMC", currentVersion: "4.3(2.240016)", latestVersion: "4.3(2.240016)", releasedISO: "2026-03-12T00:00:00Z", appliesTo: 4, fileSizeMB: 78, critical: false, state: "matching" },

  // NIC
  { id: "fw-018", name: "ConnectX-6 Dx", vendor: "NVIDIA / Mellanox", category: "NIC", currentVersion: "22.36.1010", latestVersion: "22.39.1002", releasedISO: "2026-04-19T00:00:00Z", appliesTo: 14, fileSizeMB: 24, critical: true, state: "critical" },
  { id: "fw-019", name: "ConnectX-7", vendor: "NVIDIA / Mellanox", category: "NIC", currentVersion: "28.39.1002", latestVersion: "28.39.1002", releasedISO: "2026-04-19T00:00:00Z", appliesTo: 9, fileSizeMB: 26, critical: false, state: "matching" },
  { id: "fw-020", name: "Intel E810-CQDA2", vendor: "Intel", category: "NIC", currentVersion: "4.40", latestVersion: "4.50", releasedISO: "2026-05-04T00:00:00Z", appliesTo: 6, fileSizeMB: 18, critical: false, state: "behind" },
  { id: "fw-021", name: "Broadcom 57508", vendor: "Broadcom", category: "NIC", currentVersion: "228.0.131", latestVersion: "228.0.139", releasedISO: "2026-04-22T00:00:00Z", appliesTo: 7, fileSizeMB: 22, critical: false, state: "behind" },
  { id: "fw-022", name: "Cisco VIC 1467", vendor: "Cisco", category: "NIC", currentVersion: "5.3(1a)", latestVersion: "5.3(1a)", releasedISO: "2026-02-28T00:00:00Z", appliesTo: 4, fileSizeMB: 16, critical: false, state: "matching" },

  // RAID
  { id: "fw-023", name: "Broadcom 9560-16i", vendor: "Broadcom", category: "RAID", currentVersion: "5.2206.00", latestVersion: "5.2206.00", releasedISO: "2026-03-15T00:00:00Z", appliesTo: 11, fileSizeMB: 14, critical: false, state: "matching" },
  { id: "fw-024", name: "Dell PERC H965i", vendor: "Dell / Broadcom", category: "RAID", currentVersion: "8.6.0.0-19", latestVersion: "8.7.0.0-22", releasedISO: "2026-05-09T00:00:00Z", appliesTo: 5, fileSizeMB: 16, critical: false, state: "behind" },

  // PSU
  { id: "fw-025", name: "Delta 2400W Titanium PSU", vendor: "Delta", category: "PSU", currentVersion: "1.07", latestVersion: "1.07", releasedISO: "2025-11-04T00:00:00Z", appliesTo: 18, fileSizeMB: 2, critical: false, state: "matching" },
  { id: "fw-026", name: "Lite-On 1600W Platinum PSU", vendor: "Lite-On", category: "PSU", currentVersion: "0.42", latestVersion: "0.44", releasedISO: "2026-04-08T00:00:00Z", appliesTo: 22, fileSizeMB: 2, critical: false, state: "behind" },

  // GPU
  { id: "fw-027", name: "NVIDIA H100 SXM5 VBIOS", vendor: "NVIDIA", category: "GPU", currentVersion: "96.00.A6.00.05", latestVersion: "96.00.A6.00.07", releasedISO: "2026-05-01T00:00:00Z", appliesTo: 12, fileSizeMB: 4, critical: true, state: "critical" },
  { id: "fw-028", name: "NVIDIA A100 PCIe VBIOS", vendor: "NVIDIA", category: "GPU", currentVersion: "92.00.45.00.03", latestVersion: "92.00.45.00.03", releasedISO: "2025-12-19T00:00:00Z", appliesTo: 1, fileSizeMB: 4, critical: false, state: "matching" },
  { id: "fw-029", name: "AMD MI300X VBIOS", vendor: "AMD", category: "GPU", currentVersion: "6.1.3", latestVersion: "6.1.5", releasedISO: "2026-05-06T00:00:00Z", appliesTo: 8, fileSizeMB: 6, critical: false, state: "behind" },

  // SSD
  { id: "fw-030", name: "Samsung PM1733 FW", vendor: "Samsung", category: "SSD", currentVersion: "EPK99H3Q", latestVersion: "EPK99H3Q", releasedISO: "2025-09-22T00:00:00Z", appliesTo: 56, fileSizeMB: 1, critical: false, state: "matching" },
  { id: "fw-031", name: "Kioxia CM7-V FW", vendor: "Kioxia", category: "SSD", currentVersion: "0103", latestVersion: "0107", releasedISO: "2026-04-26T00:00:00Z", appliesTo: 24, fileSizeMB: 1, critical: false, state: "behind" },
  { id: "fw-032", name: "Intel D7-P5520 FW", vendor: "Solidigm", category: "SSD", currentVersion: "9CV10410", latestVersion: "9CV10410", releasedISO: "2025-10-10T00:00:00Z", appliesTo: 28, fileSizeMB: 1, critical: false, state: "matching" },
];
