"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Truck, PackageCheck, PackageX, ArchiveX, Inbox, type LucideIcon } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { RmaItem, RmaStatus } from "@/lib/types";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const COLS: { value: RmaStatus; label: string; Icon: LucideIcon }[] = [
  { value: "queued", label: "Queued", Icon: Inbox },
  { value: "shipped", label: "Shipped", Icon: Truck },
  { value: "received", label: "Received", Icon: PackageCheck },
  { value: "replaced", label: "Replaced", Icon: PackageX },
  { value: "closed", label: "Closed", Icon: ArchiveX },
];

function StatusChip({ s }: { s: RmaStatus }) {
  const tone =
    s === "queued"
      ? "neutral"
      : s === "shipped"
      ? "info"
      : s === "received"
      ? "teal"
      : s === "replaced"
      ? "success"
      : "neutral";
  return <Chip tone={tone}>{s}</Chip>;
}

export function RmaView({ rmaItems }: { rmaItems: RmaItem[] }) {
  const [filter, setFilter] = useState<RmaStatus | "all">("all");
  const [q, setQ] = useState("");

  const grouped = useMemo(() => {
    const g: Record<RmaStatus, typeof rmaItems> = {
      queued: [],
      shipped: [],
      received: [],
      replaced: [],
      closed: [],
    };
    for (const r of rmaItems) g[r.status].push(r);
    return g;
  }, [rmaItems]);

  const filtered = useMemo(() => {
    return rmaItems.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (q) {
        const n = q.toLowerCase();
        if (
          !r.id.toLowerCase().includes(n) &&
          !r.serverId.toLowerCase().includes(n) &&
          !r.componentName.toLowerCase().includes(n) &&
          !r.vendor.toLowerCase().includes(n) &&
          !(r.rmaNumber ?? "").toLowerCase().includes(n)
        )
          return false;
      }
      return true;
    });
  }, [filter, q, rmaItems]);

  const totalCost = rmaItems.reduce((s, r) => s + r.costUSD, 0);
  const longOpen = rmaItems.filter((r) => r.daysOpen > 14 && r.status !== "closed" && r.status !== "replaced").length;

  return (
    <main className="page">
      <PageHead
        title="RMA Tracking"
        meta={
          <>
            <span className="mono">{rmaItems.length} RMAs</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono" style={{ color: longOpen > 0 ? "var(--warning)" : "var(--text-2)" }}>
              {longOpen} {longOpen === 1 ? "long-open" : "long-opens"} (&gt;14d)
            </span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">non-warranty: ${totalCost.toLocaleString()}</span>
          </>
        }
        actions={
          <button className="btn btn-primary">
            <Plus size={13} />
            Open RMA
          </button>
        }
      />

      <Stagger className="kanban" style={{ marginBottom: 12 }}>
        {COLS.map((col) => {
          const items = grouped[col.value];
          const Icon = col.Icon;
          return (
            <StaggerItem
              key={col.value}
              className="kanban-col"
              onClick={() => setFilter(col.value === filter ? "all" : col.value)}
              style={{
                cursor: "pointer",
                outline: filter === col.value ? "1px solid var(--accent)" : undefined,
              }}
            >
              <div className="kanban-col-head">
                <Icon size={13} />
                <span>{col.label}</span>
                <span className="kanban-col-count">{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {items.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: 8,
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    <div className="mono" style={{ fontWeight: 600, color: "var(--text)" }}>
                      {r.id}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        color: "var(--text-2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.componentName}
                    </div>
                    <div className="mono" style={{ marginTop: 3, color: "var(--text-3)", fontSize: 10 }}>
                      {r.serverId} · {r.daysOpen}d
                    </div>
                  </div>
                ))}
                {items.length > 3 && (
                  <div style={{ fontSize: 10.5, color: "var(--text-3)", textAlign: "center" }} className="mono">
                    +{items.length - 3} more
                  </div>
                )}
                {items.length === 0 && (
                  <div style={{ fontSize: 11, color: "var(--text-3)", padding: 6, textAlign: "center" }}>
                    none
                  </div>
                )}
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <Surface flush>
        <div className="toolbar">
          <span className="label-mono">Status</span>
          <button
            className={cn("filter-chip", filter === "all" && "active")}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {COLS.map((c) => (
            <button
              key={c.value}
              className={cn("filter-chip", filter === c.value && "active")}
              onClick={() => setFilter(c.value)}
            >
              {c.label}
            </button>
          ))}
          <div className="toolbar-sep" />
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="RMA#, server, component..."
            />
          </div>
          <div className="toolbar-spacer" />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
            {filtered.length} shown
          </span>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>RMA</th>
              <th>Vendor RMA #</th>
              <th>Server</th>
              <th>Component</th>
              <th>Vendor</th>
              <th>Reason</th>
              <th style={{ textAlign: "right" }}>Days open</th>
              <th style={{ textAlign: "right" }}>Cost</th>
              <th>Status</th>
              <th>Opened</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="id-cell">{r.id}</td>
                <td className="mono" style={{ color: "var(--text-2)" }}>
                  {r.rmaNumber || "—"}
                </td>
                <td className="mono" style={{ color: "var(--text-2)" }}>
                  {r.serverId}
                </td>
                <td>{r.componentName}</td>
                <td style={{ color: "var(--text-2)" }}>{r.vendor}</td>
                <td style={{ color: "var(--text-3)", fontSize: 11.5, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.reason}
                </td>
                <td
                  className="num"
                  style={{
                    color:
                      r.daysOpen > 14 && r.status !== "closed" && r.status !== "replaced"
                        ? "var(--danger)"
                        : "var(--text)",
                  }}
                >
                  {r.daysOpen}
                </td>
                <td className="num">{r.costUSD === 0 ? "warranty" : `$${r.costUSD.toLocaleString()}`}</td>
                <td>
                  <StatusChip s={r.status} />
                </td>
                <td className="mono" style={{ color: "var(--text-3)" }}>
                  <TimeAgo iso={r.openedISO} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>
    </main>
  );
}
