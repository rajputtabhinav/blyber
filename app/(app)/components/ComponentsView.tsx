"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Cpu as CpuIcon, Zap, BookOpen } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import type {
  Component as CatalogComponent,
  ComponentInstance,
  ComponentKind,
  Qualification,
} from "@/lib/types";
import { HARDWARE_KINDS, FIRMWARE_KINDS, SOFTWARE_KINDS } from "@/lib/types";

type Tab = "all" | "hardware" | "firmware" | "software";

const KIND_LABEL: Record<ComponentKind, string> = {
  CPU: "CPU",
  GPU: "GPU",
  DIMM: "DIMM",
  SSD: "SSD",
  HDD: "HDD",
  NIC: "NIC",
  HBA: "HBA",
  PSU: "PSU",
  FAN: "Fan",
  BIOS: "BIOS",
  BMC: "BMC",
  FW_NIC: "NIC FW",
  FW_GPU: "GPU VBIOS",
  FW_SSD: "SSD FW",
  FW_HBA: "HBA FW",
  OS: "OS",
  KERNEL: "Kernel",
  DRIVER_GPU: "GPU Driver",
  DRIVER_NIC: "NIC Driver",
  OFED: "OFED",
  CUDA: "CUDA",
  DOCA: "DOCA",
};

const TAB_KINDS: Record<Tab, ComponentKind[] | null> = {
  all: null,
  hardware: HARDWARE_KINDS,
  firmware: FIRMWARE_KINDS,
  software: SOFTWARE_KINDS,
};

export function ComponentsView({
  catalog,
  qualifications,
  componentInstances,
}: {
  catalog: CatalogComponent[];
  qualifications: Qualification[];
  componentInstances: ComponentInstance[];
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [activeKinds, setActiveKinds] = useState<Set<ComponentKind>>(new Set());
  const [q, setQ] = useState("");

  const tabCounts = useMemo(() => ({
    all: catalog.length,
    hardware: catalog.filter((c) => HARDWARE_KINDS.includes(c.kind)).length,
    firmware: catalog.filter((c) => FIRMWARE_KINDS.includes(c.kind)).length,
    software: catalog.filter((c) => SOFTWARE_KINDS.includes(c.kind)).length,
  }), [catalog]);

  const visibleKinds = useMemo(() => {
    const kinds = TAB_KINDS[tab] ?? Array.from(new Set(catalog.map((c) => c.kind)));
    return kinds;
  }, [tab, catalog]);

  const filtered = useMemo(() => {
    return catalog.filter((c) => {
      const tabKinds = TAB_KINDS[tab];
      if (tabKinds && !tabKinds.includes(c.kind)) return false;
      if (activeKinds.size > 0 && !activeKinds.has(c.kind)) return false;
      if (q) {
        const n = q.toLowerCase();
        if (
          !c.name.toLowerCase().includes(n) &&
          !c.vendor.toLowerCase().includes(n) &&
          !(c.partNumber?.toLowerCase().includes(n)) &&
          !(c.version?.toLowerCase().includes(n))
        ) return false;
      }
      return true;
    });
  }, [tab, activeKinds, q, catalog]);

  function toggleKind(k: ComponentKind) {
    setActiveKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  // Derived stats per component
  function stats(componentId: string) {
    const quals = qualifications.filter((qq) => qq.componentId === componentId);
    const instances = componentInstances.filter((i) => i.componentId === componentId);
    const qualified = quals.filter((qq) => qq.state === "qualified").length;
    return {
      qualifiedOn: qualified,
      totalQuals: quals.length,
      inLab: instances.length,
      installed: instances.filter((i) => i.state === "installed").length,
    };
  }

  return (
    <main className="page">
      <PageHead
        title="Components"
        meta={
          <>
            <span className="mono">{catalog.length} in catalog</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{componentInstances.length} serial-tracked instances</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{qualifications.length} qualification records</span>
          </>
        }
        actions={
          <button className="btn btn-primary">
            <Plus size={13} />
            Add component
          </button>
        }
      />

      <Surface flush>
        <div className="toolbar">
          <div className="tabs">
            {(["all", "hardware", "firmware", "software"] as Tab[]).map((t) => (
              <button
                key={t}
                className={cn("tab", tab === t && "active")}
                onClick={() => { setTab(t); setActiveKinds(new Set()); }}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
                <span className="tab-count">{tabCounts[t]}</span>
              </button>
            ))}
          </div>
          <div className="toolbar-sep" />
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, vendor, P/N, version…"
            />
          </div>
          <div className="toolbar-spacer" />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
            {filtered.length} shown
          </span>
        </div>

        <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 4 }}>
          <span className="label-mono" style={{ marginRight: 6, alignSelf: "center" }}>
            <Filter size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Kind
          </span>
          {visibleKinds.map((k) => (
            <button
              key={k}
              className={cn("filter-chip", activeKinds.has(k) && "active")}
              onClick={() => toggleKind(k)}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kind</th>
              <th>Name</th>
              <th>Vendor</th>
              <th>Version / P/N</th>
              <th style={{ textAlign: "right" }}>Qualified on</th>
              <th style={{ textAlign: "right" }}>Instances</th>
              <th>TDP</th>
            </tr>
          </thead>
          <Stagger as="tbody">
            {filtered.map((c) => {
              const s = stats(c.id);
              return (
                <StaggerItem as="tr" key={c.id}>
                  <td className="id-cell">
                    <Link href={`/components/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {c.id}
                    </Link>
                  </td>
                  <td>
                    <Chip tone="outline">{KIND_LABEL[c.kind]}</Chip>
                  </td>
                  <td>
                    <Link href={`/components/${c.id}`} style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}>
                      {c.name}
                    </Link>
                    {c.shortName && c.shortName !== c.name && (
                      <span className="mono" style={{ marginLeft: 6, color: "var(--text-3)", fontSize: 10.5 }}>
                        {c.shortName}
                      </span>
                    )}
                  </td>
                  <td style={{ color: "var(--text-2)" }}>{c.vendor}</td>
                  <td className="mono" style={{ color: "var(--text-2)", fontSize: 11.5 }}>
                    {c.version ?? c.partNumber ?? "—"}
                  </td>
                  <td className="num">
                    {s.qualifiedOn > 0 ? (
                      <span style={{ color: "var(--success)" }}>{s.qualifiedOn}</span>
                    ) : s.totalQuals > 0 ? (
                      <span style={{ color: "var(--warning)" }}>{s.qualifiedOn}/{s.totalQuals}</span>
                    ) : (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </td>
                  <td className="num" style={{ color: "var(--text-2)" }}>
                    {s.inLab > 0 ? `${s.installed}/${s.inLab}` : "—"}
                  </td>
                  <td className="mono" style={{ color: "var(--text-3)" }}>
                    {c.tdpW ? `${c.tdpW} W` : "—"}
                  </td>
                </StaggerItem>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="empty">No components match the current filters.</div>
                </td>
              </tr>
            )}
          </Stagger>
        </table>
      </Surface>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
        <Surface
          flush
          title={
            <>
              <CpuIcon size={13} style={{ color: "var(--text-2)" }} />
              Hardware kinds
            </>
          }
        >
          <div style={{ padding: 12 }}>
            <KindRollup kinds={HARDWARE_KINDS} catalog={catalog} />
          </div>
        </Surface>
        <Surface
          flush
          title={
            <>
              <Zap size={13} style={{ color: "var(--text-2)" }} />
              Firmware kinds
            </>
          }
        >
          <div style={{ padding: 12 }}>
            <KindRollup kinds={FIRMWARE_KINDS} catalog={catalog} />
          </div>
        </Surface>
        <Surface
          flush
          title={
            <>
              <BookOpen size={13} style={{ color: "var(--text-2)" }} />
              Software kinds
            </>
          }
        >
          <div style={{ padding: 12 }}>
            <KindRollup kinds={SOFTWARE_KINDS} catalog={catalog} />
          </div>
        </Surface>
      </div>
    </main>
  );
}

function KindRollup({ kinds, catalog }: { kinds: ComponentKind[]; catalog: CatalogComponent[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {kinds.map((k) => {
        const count = catalog.filter((c) => c.kind === k).length;
        if (count === 0) return null;
        return (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ flex: 1 }}>{KIND_LABEL[k]}</span>
            <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
              {count}
            </span>
            <div className="bar" style={{ width: 80 }}>
              <div className="bar-fill teal" style={{ width: `${Math.min(100, count * 12)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
