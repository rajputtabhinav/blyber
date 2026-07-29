"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Filter, Search, Rows3, Grid3X3, Flame } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/lib/cn";
import type {
  Component,
  ComponentKind,
  Platform,
  Qualification,
  QualificationState,
} from "@/lib/types";

type Density = "compact" | "detailed" | "heatmap";

// Kinds that make sense as matrix rows. Everything qualifiable, but
// limit defaults to a sensible subset to keep the matrix dense.
const ALL_KINDS: ComponentKind[] = [
  "CPU", "GPU", "DIMM", "SSD", "NIC", "HBA", "PSU",
  "BIOS", "BMC", "FW_GPU", "FW_NIC", "FW_SSD",
  "OS", "KERNEL", "DRIVER_GPU", "CUDA", "OFED",
];
const DEFAULT_KINDS: ComponentKind[] = ["CPU", "GPU", "DIMM", "SSD", "NIC", "HBA", "PSU"];

// Same idea for platforms: default to Netweb-only (Tyrone family) for
// the dense matrix; let engineers expand to other vendors.
type VendorFilter = "Tyrone" | "all" | "Dell" | "HPE" | "Supermicro" | "Lenovo" | "Cisco";

const LEGEND: { state: QualificationState; label: string; bg: string; icon: string }[] = [
  { state: "qualified", label: "Qualified", bg: "rgba(34,197,94,0.45)", icon: "✓" },
  { state: "limited", label: "Limited", bg: "rgba(245,158,11,0.55)", icon: "!" },
  { state: "unsupported", label: "Unsupported", bg: "rgba(239,68,68,0.55)", icon: "✕" },
  { state: "pending", label: "Validation pending", bg: "rgba(59,130,246,0.45)", icon: "⌛" },
  { state: "untested", label: "Untested", bg: "rgba(255,255,255,0.04)", icon: "?" },
];

function cellBg(s: QualificationState): string {
  switch (s) {
    case "qualified": return "rgba(34,197,94,0.10)";
    case "limited": return "rgba(245,158,11,0.14)";
    case "unsupported": return "rgba(239,68,68,0.14)";
    case "pending": return "rgba(59,130,246,0.10)";
    default: return "rgba(255,255,255,0.015)";
  }
}
function heatmapBg(s: QualificationState): string {
  return LEGEND.find((l) => l.state === s)?.bg ?? "rgba(255,255,255,0.04)";
}
function cellIcon(s: QualificationState): { ch: string; cls: string } {
  switch (s) {
    case "qualified": return { ch: "✓", cls: "ok" };
    case "limited": return { ch: "!", cls: "warn" };
    case "unsupported": return { ch: "✕", cls: "crit" };
    case "pending": return { ch: "⌛", cls: "pending" };
    default: return { ch: "?", cls: "" };
  }
}

export function CompatibilityView({
  catalog,
  platforms,
  qualifications,
}: {
  catalog: Component[];
  platforms: Platform[];
  qualifications: Qualification[];
}) {
  const [activeKinds, setActiveKinds] = useState<Set<ComponentKind>>(new Set(DEFAULT_KINDS));
  const [vendor, setVendor] = useState<VendorFilter>("Tyrone");
  const [q, setQ] = useState("");
  const [density, setDensity] = useState<Density>("detailed");

  const toggleKind = (k: ComponentKind) => {
    setActiveKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      if (next.size === 0) return new Set(DEFAULT_KINDS);
      return next;
    });
  };

  // Filter rows (components)
  const rows: Component[] = useMemo(() => {
    return catalog.filter((c) => {
      if (!activeKinds.has(c.kind)) return false;
      if (q) {
        const n = q.toLowerCase();
        if (!c.name.toLowerCase().includes(n) && !c.vendor.toLowerCase().includes(n)) return false;
      }
      return true;
    });
  }, [activeKinds, q, catalog]);

  // Filter columns (platforms)
  const cols: Platform[] = useMemo(() => {
    return platforms.filter((p) => {
      if (vendor === "Tyrone") return p.vendor === "Netweb";
      if (vendor === "all") return true;
      return p.vendor === vendor;
    });
  }, [vendor, platforms]);

  // Index qualifications for O(1) cell lookup
  const qualIndex = useMemo(() => {
    const m = new Map<string, typeof qualifications[number]>();
    for (const q of qualifications) m.set(`${q.componentId}::${q.platformId}`, q);
    return m;
  }, [qualifications]);

  function lookup(componentId: string, platformId: string) {
    return qualIndex.get(`${componentId}::${platformId}`);
  }

  // Per-platform header rollup: how many qualified / limited / etc.
  const colStats = useMemo(() => {
    return new Map(
      cols.map((p) => {
        const qs = qualifications.filter((qq) => qq.platformId === p.id && rows.some((r) => r.id === qq.componentId));
        return [
          p.id,
          {
            qualified: qs.filter((qq) => qq.state === "qualified").length,
            limited: qs.filter((qq) => qq.state === "limited").length,
            pending: qs.filter((qq) => qq.state === "pending").length,
            total: qs.length,
          },
        ];
      }),
    );
  }, [cols, rows, qualifications]);

  return (
    <main className="page">
      <PageHead
        title="Compatibility Matrix"
        meta={
          <>
            <span className="mono">{rows.length} components</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{cols.length} platforms</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">computed from {qualifications.length} qualification records</span>
          </>
        }
        actions={
          <>
            <button className="btn">
              <Filter size={13} />
              Vendor
            </button>
            <button className="btn">
              <Download size={13} />
              Export
            </button>
          </>
        }
      />

      <Surface flush>
        <div className="toolbar">
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find component or vendor…"
            />
          </div>
          <div className="toolbar-sep" />
          <span className="label-mono">Platforms</span>
          {(["Tyrone", "all", "Dell", "HPE", "Supermicro", "Lenovo", "Cisco"] as VendorFilter[]).map((v) => (
            <button
              key={v}
              className={cn("filter-chip", vendor === v && "active")}
              onClick={() => setVendor(v)}
            >
              {v === "all" ? "All" : v}
            </button>
          ))}
          <div className="toolbar-sep" />
          <span className="label-mono">Density</span>
          <button className={cn("filter-chip", density === "compact" && "active")} onClick={() => setDensity("compact")} title="Compact"><Rows3 size={11} /></button>
          <button className={cn("filter-chip", density === "detailed" && "active")} onClick={() => setDensity("detailed")} title="Detailed"><Grid3X3 size={11} /></button>
          <button className={cn("filter-chip", density === "heatmap" && "active")} onClick={() => setDensity("heatmap")} title="Heatmap"><Flame size={11} /></button>
          <div className="toolbar-spacer" />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {LEGEND.map((l) => (
              <div
                key={l.state}
                style={{ display: "inline-flex", alignItems: "center", fontSize: 11, color: "var(--text-3)", gap: 4 }}
              >
                <span className="legend-dot" style={{ background: l.bg }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 4 }}>
          <span className="label-mono" style={{ marginRight: 6, alignSelf: "center" }}>Kind</span>
          {ALL_KINDS.map((k) => (
            <button
              key={k}
              className={cn("filter-chip", activeKinds.has(k) && "active")}
              onClick={() => toggleKind(k)}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="matrix-wrap">
          <table className="matrix">
            <thead>
              <tr>
                <th className="corner">Component / Platform</th>
                {cols.map((p) => {
                  const s = colStats.get(p.id)!;
                  return (
                    <th key={p.id}>
                      <Link href={`/platforms/${p.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {p.name}
                      </Link>
                      <span className="vendor">
                        {p.vendor} · <span style={{ color: "var(--success)" }}>{s.qualified}</span>/{s.total}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <th>
                    <Link href={`/components/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {c.name}
                      {c.version && (
                        <span className="mono" style={{ marginLeft: 6, color: "var(--text-3)", fontSize: 10.5 }}>
                          {c.version}
                        </span>
                      )}
                    </Link>
                    <span className="vendor">
                      {c.vendor}{c.partNumber ? ` · ${c.partNumber}` : ""}
                    </span>
                  </th>
                  {cols.map((p) => {
                    const q = lookup(c.id, p.id);
                    const state: QualificationState = q?.state ?? "untested";
                    const ic = cellIcon(state);
                    if (density === "heatmap") {
                      return (
                        <td
                          key={p.id}
                          style={{ height: 32, padding: 0, background: heatmapBg(state) }}
                          title={`${c.name} × ${p.name}: ${state}${q?.limitations ? ` (${q.limitations})` : ""}`}
                        />
                      );
                    }
                    if (density === "compact") {
                      return (
                        <td
                          key={p.id}
                          style={{ height: 24, padding: "2px 4px", background: cellBg(state) }}
                          title={`${c.name} × ${p.name}: ${state}`}
                        >
                          <div className={"cell-icon " + ic.cls}>{ic.ch}</div>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={p.id}
                        style={{ background: cellBg(state) }}
                        title={q?.limitations ?? state}
                      >
                        <div className={"cell-icon " + ic.cls}>{ic.ch}</div>
                        {q?.supportingRunIds && q.supportingRunIds.length > 0 && (
                          <div className="cell-fw">
                            {q.supportingRunIds.length} run{q.supportingRunIds.length !== 1 ? "s" : ""}
                          </div>
                        )}
                        {!q?.supportingRunIds?.length && q?.signedOffISO && (
                          <div className="cell-fw">signed</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={cols.length + 1}>
                    <div className="empty">No components match the current filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Surface>
    </main>
  );
}
