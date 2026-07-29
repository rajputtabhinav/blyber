"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, Cpu, Droplet } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { derivePlatformId } from "@/lib/data";
import type { Platform, PlatformVendor, Qualification, ServerNode } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const VENDORS: (PlatformVendor | "all")[] = ["all", "Netweb", "Dell", "HPE", "Supermicro", "Lenovo", "Cisco"];

export function PlatformsView({
  platforms,
  qualifications,
  servers,
}: {
  platforms: Platform[];
  qualifications: Qualification[];
  servers: ServerNode[];
}) {
  const [vendor, setVendor] = useState<PlatformVendor | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return platforms.filter((p) => {
      if (vendor !== "all" && p.vendor !== vendor) return false;
      if (q) {
        const n = q.toLowerCase();
        if (
          !p.name.toLowerCase().includes(n) &&
          !p.vendor.toLowerCase().includes(n) &&
          !(p.family?.toLowerCase().includes(n)) &&
          !p.generation.toLowerCase().includes(n)
        ) return false;
      }
      return true;
    });
  }, [vendor, q, platforms]);

  // Group by vendor for the card layout
  const grouped = useMemo(() => {
    const out: Record<string, typeof platforms> = {};
    for (const p of filtered) {
      (out[p.vendor] ??= []).push(p);
    }
    // ordering: Netweb first
    return Object.entries(out).sort(([a], [b]) =>
      a === "Netweb" ? -1 : b === "Netweb" ? 1 : a.localeCompare(b),
    );
  }, [filtered]);

  function platformStats(platformId: string) {
    const chassisCount = servers.filter((s) => derivePlatformId(s) === platformId).length;
    const quals = qualifications.filter((qq) => qq.platformId === platformId);
    return {
      chassisCount,
      qualifiedComponents: quals.filter((qq) => qq.state === "qualified").length,
      totalQuals: quals.length,
    };
  }

  return (
    <main className="page">
      <PageHead
        title="Platforms"
        meta={
          <>
            <span className="mono">{platforms.length} platforms</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{platforms.filter((p) => p.vendor === "Netweb").length} Tyrone</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{platforms.filter((p) => p.vendor !== "Netweb").length} third-party</span>
          </>
        }
        actions={
          <button className="btn btn-primary">
            <Plus size={13} />
            Add platform
          </button>
        }
      />

      <Surface flush>
        <div className="toolbar">
          <span className="label-mono">Vendor</span>
          {VENDORS.map((v) => (
            <button
              key={v}
              className={cn("filter-chip", vendor === v && "active")}
              onClick={() => setVendor(v)}
            >
              {v === "all" ? "All" : v}
            </button>
          ))}
          <div className="toolbar-sep" />
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, family, generation…"
            />
          </div>
          <div className="toolbar-spacer" />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
            {filtered.length} shown
          </span>
        </div>
      </Surface>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
        {grouped.map(([vendorName, items]) => (
          <section key={vendorName}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 4px 6px",
                borderBottom: "1px solid var(--border)",
                marginBottom: 10,
              }}
            >
              <span className="label-mono" style={{ color: "var(--text-2)" }}>
                {vendorName}
              </span>
              <span className="mono" style={{ marginLeft: 4, color: "var(--text-3)", fontSize: 10.5 }}>
                {items.length} platform{items.length !== 1 ? "s" : ""}
              </span>
              {vendorName === "Netweb" && (
                <Chip tone="teal" className="ml-2">
                  Tyrone Camarero
                </Chip>
              )}
            </div>

            <Stagger
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 10,
              }}
            >
              {items.map((p) => {
                const s = platformStats(p.id);
                return (
                  <StaggerItem key={p.id}>
                    <Link
                      href={`/platforms/${p.id}`}
                      style={{
                        display: "block",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        padding: 12,
                        textDecoration: "none",
                        color: "inherit",
                        transition: "background-color 100ms ease, border-color 100ms ease",
                      }}
                      className="hover-row"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Cpu size={14} style={{ color: "var(--text-3)" }} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                        {p.cooling === "liquid" && (
                          <span title="Liquid-cooled" style={{ display: "inline-flex", color: "var(--info)" }}>
                            <Droplet size={11} />
                          </span>
                        )}
                      </div>
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 2 }}>
                        {p.generation} · {p.ruHeight === 0 ? "desktop" : `${p.ruHeight}U`} · {p.cooling}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginTop: 10 }}>
                        <Spec label="Sockets" value={p.socketCount.toString()} />
                        <Spec label="GPUs" value={p.maxGpus.toString()} />
                        <Spec label="DIMMs" value={p.maxDimms.toString()} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          marginTop: 10,
                          paddingTop: 8,
                          borderTop: "1px solid var(--border)",
                          fontSize: 11,
                          color: "var(--text-2)",
                        }}
                      >
                        <span className="mono">
                          {s.chassisCount} chassis
                        </span>
                        <span className="mono" style={{ color: "var(--success)" }}>
                          {s.qualifiedComponents}/{s.totalQuals} qual
                        </span>
                        {p.maxPsuW && (
                          <span className="mono" style={{ color: "var(--text-3)" }}>
                            {(p.maxPsuW / 1000).toFixed(1)}kW
                          </span>
                        )}
                      </div>

                      {p.notes && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 11,
                            color: "var(--text-3)",
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {p.notes}
                        </div>
                      )}
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </section>
        ))}
        {filtered.length === 0 && (
          <Surface>
            <div className="empty">No platforms match the current filters.</div>
          </Surface>
        )}
      </div>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label-mono" style={{ fontSize: 9, marginBottom: 1 }}>{label}</div>
      <div className="mono" style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{value}</div>
    </div>
  );
}
