"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, UserPlus } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip, SevDot } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { Engineer, Severity, Team, Ticket } from "@/lib/types";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { AnimatePresence, motion } from "framer-motion";

const TEAMS: Team[] = ["Validation", "Firmware", "Thermal", "Network", "Storage", "Compute", "Power"];

export function EngineersView({
  engineers,
  tickets,
}: {
  engineers: Engineer[];
  tickets: Ticket[];
}) {
  const [team, setTeam] = useState<Team | "all">("all");
  const [sort, setSort] = useState<"workload" | "active" | "resolved">("workload");
  const [selected, setSelected] = useState<Engineer | null>(engineers[0] ?? null);

  const filtered = useMemo(() => {
    const list = engineers.filter((e) => team === "all" || e.team === team);
    list.sort((a, b) => {
      if (sort === "workload") return b.workload - a.workload;
      if (sort === "active") return b.activeTickets - a.activeTickets;
      return b.resolvedThisWeek - a.resolvedThisWeek;
    });
    return list;
  }, [team, sort, engineers]);

  const queue = useMemo(() => {
    if (!selected) return [];
    return tickets
      .filter((t) => t.assigneeId === selected.id && t.status !== "resolved" && t.status !== "closed")
      .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  }, [selected, tickets]);

  const grouped: Record<Severity, typeof tickets> = {
    critical: queue.filter((t) => t.severity === "critical"),
    high: queue.filter((t) => t.severity === "high"),
    medium: queue.filter((t) => t.severity === "medium"),
    low: queue.filter((t) => t.severity === "low"),
  };

  return (
    <main className="page">
      <PageHead
        title="Engineer Assignment"
        meta={
          <>
            <span className="mono">{engineers.length} engineers</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">7 teams</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">avg workload 58%</span>
          </>
        }
        actions={
          <>
            <button className="btn">
              <Filter size={13} />
              Filter
            </button>
            <button className="btn btn-primary">
              <UserPlus size={13} />
              Add engineer
            </button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 12 }}>
        <Surface flush>
          <div className="toolbar">
            <span className="label-mono">Team</span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <button
                className={cn("filter-chip", team === "all" && "active")}
                onClick={() => setTeam("all")}
              >
                All
              </button>
              {TEAMS.map((t) => (
                <button
                  key={t}
                  className={cn("filter-chip", team === t && "active")}
                  onClick={() => setTeam(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="toolbar-spacer" />
            <span className="label-mono">Sort</span>
            <Select<typeof sort>
              value={sort}
              onChange={setSort}
              ariaLabel="Sort engineers"
              options={[
                { value: "workload", label: "Workload" },
                { value: "active", label: "Active tickets" },
                { value: "resolved", label: "Resolved this week" },
              ]}
            />
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Engineer</th>
                <th>Team</th>
                <th style={{ textAlign: "right" }}>Active</th>
                <th style={{ textAlign: "right" }}>Resolved (7d)</th>
                <th style={{ minWidth: 140 }}>Workload</th>
                <th>Shift</th>
                <th>Status</th>
              </tr>
            </thead>
            <Stagger as="tbody">
              {filtered.map((e) => {
                const tone = e.workload > 80 ? "crit" : e.workload > 60 ? "warn" : "ok";
                const statusColor = e.status === "online" ? "var(--success)" : e.status === "away" ? "var(--warning)" : "var(--text-3)";
                return (
                  <StaggerItem
                    as="tr"
                    key={e.id}
                    className={selected?.id === e.id ? "selected" : ""}
                    onClick={() => setSelected(e)}
                  >
                    <td>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Avatar name={e.name} size="md" />
                        <div>
                          <div style={{ fontWeight: 500 }}>{e.name}</div>
                          <div style={{ fontSize: 10.5, color: "var(--text-3)" }} className="mono">
                            {e.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Chip tone="outline">{e.team}</Chip>
                    </td>
                    <td className="num">{e.activeTickets}</td>
                    <td className="num">{e.resolvedThisWeek}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="bar" style={{ flex: 1 }}>
                          <div className={"bar-fill " + tone} style={{ width: `${e.workload}%` }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: "var(--text-2)" }}>
                          {e.workload}%
                        </span>
                      </div>
                    </td>
                    <td className="mono" style={{ color: "var(--text-3)" }}>
                      {e.shift}
                    </td>
                    <td>
                      <Chip tone="neutral" dot dotColor={statusColor}>
                        {e.status}
                      </Chip>
                    </td>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </table>
        </Surface>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {selected ? (
          <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0.2, 1] }}
            className="side-panel"
          >
            <div className="surface-head">
              <Avatar name={selected.name} size="lg" />
              <div>
                <div style={{ fontWeight: 600 }}>{selected.name}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {selected.role} · {selected.team}
                </div>
              </div>
              <button className="btn btn-ghost" style={{ marginLeft: "auto", padding: "2px 6px" }}>
                Profile
              </button>
            </div>
            <div className="side-panel-section">
              <div className="side-panel-title">Workload snapshot</div>
              <div className="side-panel-row"><span className="k">Active</span><span className="v mono">{selected.activeTickets} tickets</span></div>
              <div className="side-panel-row"><span className="k">Resolved 7d</span><span className="v mono">{selected.resolvedThisWeek}</span></div>
              <div className="side-panel-row"><span className="k">Utilization</span><span className="v mono">{selected.workload}%</span></div>
              <div className="side-panel-row"><span className="k">Shift</span><span className="v mono">{selected.shift}</span></div>
              <div className="side-panel-row"><span className="k">Email</span><span className="v mono" style={{ fontSize: 11 }}>{selected.email}</span></div>
              <div className="side-panel-row"><span className="k">Joined</span><TimeAgo iso={selected.joinedISO} className="v mono" /></div>
            </div>
          </motion.div>
          </AnimatePresence>
          ) : (
            <div className="side-panel" style={{ padding: 14 }}>
              <div className="empty">Select an engineer.</div>
            </div>
          )}

          <Surface
            flush
            title={
              <>
                Current queue
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {queue.length} open
                </span>
              </>
            }
          >
            <div>
              {(["critical", "high", "medium", "low"] as Severity[]).map((sev) => {
                const list = grouped[sev];
                if (list.length === 0) return null;
                return (
                  <div key={sev} style={{ borderBottom: "1px solid var(--border)" }}>
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "rgba(255,255,255,0.012)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <SevDot severity={sev} />
                      <span className="label-mono" style={{ color: "var(--text-2)" }}>
                        {sev}
                      </span>
                      <span className="mono" style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 11 }}>
                        {list.length}
                      </span>
                    </div>
                    {list.map((t) => (
                      <Link
                        key={t.id}
                        href={`/tickets/${t.id}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "80px minmax(0, 1fr) auto",
                          gap: 8,
                          padding: "7px 12px",
                          textDecoration: "none",
                          color: "inherit",
                          fontSize: 12,
                          borderTop: "1px solid var(--border)",
                        }}
                        className="hover-row"
                      >
                        <span className="mono" style={{ color: "var(--text-2)" }}>
                          {t.id}
                        </span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.title}
                        </span>
                        <TimeAgo iso={t.updatedISO} className="mono" />
                      </Link>
                    ))}
                  </div>
                );
              })}
              {queue.length === 0 && (
                <div className="empty">No active tickets for this engineer.</div>
              )}
            </div>
          </Surface>

          <Surface
            flush
            title="Recent activity"
          >
            <div>
              {[
                { t: "1h", action: "commented on", ref: "BLY-1247" },
                { t: "4h", action: "closed", ref: "BLY-1234" },
                { t: "1d", action: "flashed firmware", ref: "ConnectX-7 28.39.1002" },
                { t: "2d", action: "qualified", ref: "Kioxia CM7 FW 0107" },
                { t: "3d", action: "authored KB", ref: "KB-1058" },
              ].map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    padding: "7px 12px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "var(--text-2)" }}>
                    {a.action} <span className="mono" style={{ color: "var(--text)" }}>{a.ref}</span>
                  </span>
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                    {a.t} ago
                  </span>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </main>
  );
}

function severityRank(s: Severity): number {
  return s === "critical" ? 3 : s === "high" ? 2 : s === "medium" ? 1 : 0;
}
