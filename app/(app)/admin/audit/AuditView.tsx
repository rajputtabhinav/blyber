"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Filter, Search, ScrollText } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { KPI } from "@/components/ui/KPI";
import { cn } from "@/lib/cn";
import type { Engineer } from "@/lib/types";

type AuditEntry = {
  id: number;
  atISO: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  notes?: string;
};

const ACTION_TONES: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  resolve: "success",
  close: "neutral",
  assign: "info",
  signoff: "success",
  schedule: "info",
  toggle: "neutral",
  set_status: "warning",
  power_cycle: "warning",
  increment: "neutral",
};

function actionTone(action: string) {
  // Match by prefix (e.g., "ticket.resolve" → "resolve")
  const key = action.split(".").pop() ?? action;
  return ACTION_TONES[key] ?? "neutral";
}

function entityHref(entityType: string, entityId: string): string | null {
  switch (entityType) {
    case "ticket":
      return `/tickets/${entityId}`;
    case "server":
      return `/inventory/${entityId}`;
    case "qualification":
      // Qualifications live inside campaign detail — link to component if we
      // can't easily resolve campaign here. For now, surface raw id.
      return null;
    case "campaign":
      return `/qualifications/${entityId}`;
    case "firmware":
      return `/firmware`;
    case "checklist_item":
      return null;
    case "kb_article":
      return `/kb/${entityId}`;
    default:
      return null;
  }
}

function formatChange(before: unknown, after: unknown): string {
  if (before === null && after === null) return "—";
  if (typeof before === "string" || typeof before === "number" || typeof before === "boolean") {
    return `${before} → ${after}`;
  }
  if (before && typeof before === "object" && after && typeof after === "object") {
    // Pick differing keys
    const b = before as Record<string, unknown>;
    const a = after as Record<string, unknown>;
    const diffs: string[] = [];
    const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
    for (const k of keys) {
      if (JSON.stringify(b[k]) !== JSON.stringify(a[k])) {
        diffs.push(`${k}: ${JSON.stringify(b[k])} → ${JSON.stringify(a[k])}`);
      }
    }
    return diffs.slice(0, 3).join(" · ") || "—";
  }
  if (after !== null && after !== undefined) return String(after);
  return "—";
}

export function AuditView({
  entries,
  engineers,
}: {
  entries: AuditEntry[];
  engineers: Engineer[];
}) {
  const [q, setQ] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");

  const engineerById = useMemo(() => {
    const m = new Map<string, Engineer>();
    engineers.forEach((e) => m.set(e.id, e));
    return m;
  }, [engineers]);

  const entityTypes = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => set.add(e.entityType));
    return Array.from(set).sort();
  }, [entries]);

  const actors = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.actorId) set.add(e.actorId);
    });
    return Array.from(set).sort();
  }, [entries]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (entityFilter !== "all" && e.entityType !== entityFilter) return false;
      if (actorFilter !== "all" && e.actorId !== actorFilter) return false;
      if (needle) {
        const hay = `${e.id} ${e.action} ${e.entityType} ${e.entityId} ${e.notes ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [entries, q, entityFilter, actorFilter]);

  // Stats — last24hCount uses Date.now() so defer to client to avoid
  // hydration mismatch on the KPI tile.
  const [last24hCount, setLast24hCount] = useState(0);
  useEffect(() => {
    const cutoff = Date.now() - 24 * 3600 * 1000;
    setLast24hCount(entries.filter((e) => +new Date(e.atISO) >= cutoff).length);
  }, [entries]);

  const mostActiveActor = useMemo(() => {
    const counts = new Map<string, number>();
    entries.forEach((e) => {
      if (!e.actorId) return;
      counts.set(e.actorId, (counts.get(e.actorId) ?? 0) + 1);
    });
    let max: [string, number] | null = null;
    counts.forEach((v, k) => {
      if (!max || v > max[1]) max = [k, v];
    });
    return max;
  }, [entries]);

  function exportCsv() {
    const header = ["id", "atISO", "actorId", "action", "entityType", "entityId", "notes"];
    const lines = [header.join(",")];
    rows.forEach((r) => {
      const cells = [
        r.id,
        r.atISO,
        r.actorId ?? "",
        r.action,
        r.entityType,
        r.entityId,
        (r.notes ?? "").replace(/[,\n]/g, " "),
      ];
      lines.push(cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <PageHead
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ScrollText size={16} style={{ color: "var(--text-2)" }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>Audit Log</span>
          </div>
        }
        meta={
          <>
            <span className="mono">{entries.length} entries total</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{rows.length} shown</span>
          </>
        }
        actions={
          <>
            <button className="btn" onClick={exportCsv}>
              <Download size={13} />
              Export CSV
            </button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
        <KPI label="Total entries" value={entries.length} foot="all time" />
        <KPI label="Last 24h" value={last24hCount} foot="activity" />
        <KPI label="Entity types" value={entityTypes.length} foot="distinct" />
        <KPI
          label="Top actor"
          value={
            mostActiveActor ? (
              <span style={{ fontSize: 13 }}>
                {engineerById.get(mostActiveActor[0])?.initials ?? mostActiveActor[0]}
              </span>
            ) : "—"
          }
          foot={mostActiveActor ? `${mostActiveActor[1]} actions` : "no data"}
        />
      </div>

      <Surface flush>
        <div className="toolbar">
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find action, entity, or ID…"
            />
          </div>
          <div className="toolbar-sep" />
          <Filter size={11} style={{ color: "var(--text-3)" }} />
          <span className="label-mono">Entity</span>
          <button
            className={cn("filter-chip", entityFilter === "all" && "active")}
            onClick={() => setEntityFilter("all")}
          >
            All
          </button>
          {entityTypes.map((t) => (
            <button
              key={t}
              className={cn("filter-chip", entityFilter === t && "active")}
              onClick={() => setEntityFilter(t)}
            >
              {t}
            </button>
          ))}
          <div className="toolbar-sep" />
          <span className="label-mono">Actor</span>
          <button
            className={cn("filter-chip", actorFilter === "all" && "active")}
            onClick={() => setActorFilter("all")}
          >
            All
          </button>
          {actors.slice(0, 6).map((a) => {
            const eng = engineerById.get(a);
            return (
              <button
                key={a}
                className={cn("filter-chip", actorFilter === a && "active")}
                onClick={() => setActorFilter(a)}
              >
                {eng?.initials ?? a}
              </button>
            );
          })}
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 130 }}>When</th>
              <th style={{ width: 90 }}>Actor</th>
              <th style={{ width: 110 }}>Action</th>
              <th style={{ width: 110 }}>Entity</th>
              <th style={{ width: 140 }}>Entity ID</th>
              <th>Change</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty">No audit entries match the current filters.</div>
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const eng = r.actorId ? engineerById.get(r.actorId) : undefined;
              const href = entityHref(r.entityType, r.entityId);
              return (
                <tr key={r.id}>
                  <td className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                    <TimeAgo iso={r.atISO} />
                  </td>
                  <td>
                    {eng ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Avatar name={eng.name} size="sm" />
                        <span style={{ fontSize: 11.5 }}>{eng.initials}</span>
                      </div>
                    ) : (
                      <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                        {r.actorId ?? "system"}
                      </span>
                    )}
                  </td>
                  <td>
                    <Chip tone={actionTone(r.action)} mono>{r.action}</Chip>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-2)" }}>
                      {r.entityType}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 11 }}>
                    {href ? (
                      <Link href={href} style={{ color: "var(--accent-2)", textDecoration: "none" }}>
                        {r.entityId}
                      </Link>
                    ) : (
                      <span style={{ color: "var(--text-2)" }}>{r.entityId}</span>
                    )}
                  </td>
                  <td
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--text-2)",
                      maxWidth: 360,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={formatChange(r.before, r.after)}
                  >
                    {formatChange(r.before, r.after)}
                  </td>
                  <td style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                    {r.notes ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Surface>
    </main>
  );
}
