"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileText, GitBranch, Play, Search, X } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { KPI } from "@/components/ui/KPI";
import { cn } from "@/lib/cn";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { Engineer, RunResult, RunType, ValidationRun } from "@/lib/types";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { AnimatePresence, motion } from "framer-motion";

const RUN_TYPES: RunType[] = ["Thermal", "Burn-in", "Power", "Memory", "Network", "Storage"];

function ResultChip({ r }: { r: RunResult }) {
  const tone =
    r === "pass" ? "success" :
    r === "fail" ? "danger" :
    r === "partial" ? "warning" :
    "info";
  const dot =
    r === "pass" ? "var(--success)" :
    r === "fail" ? "var(--danger)" :
    r === "partial" ? "var(--warning)" :
    "var(--info)";
  return (
    <Chip tone={tone} dot dotColor={dot}>
      {r === "running" ? "running" : r}
    </Chip>
  );
}

export function ReportsView({
  validationRuns,
  engineers,
}: {
  validationRuns: ValidationRun[];
  engineers: Engineer[];
}) {
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const [types, setTypes] = useState<Set<RunType>>(new Set(RUN_TYPES));
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<ValidationRun | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  function toggleCompare(id: string) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  }

  // runsToday depends on Date.now() — keep client-only to avoid hydration drift.
  const [runsToday, setRunsToday] = useState(0);
  useEffect(() => {
    const cutoff = Date.now() - 86400000;
    setRunsToday(validationRuns.filter((r) => +new Date(r.startedISO) >= cutoff).length);
  }, [validationRuns]);

  const { passRate, avgDuration, failures, completedCount } = useMemo(() => {
    const completed = validationRuns.filter((r) => r.result !== "running");
    const passCount = completed.filter((r) => r.result === "pass").length;
    return {
      completedCount: completed.length,
      passRate: completed.length > 0 ? Math.round((passCount / completed.length) * 100) : 0,
      avgDuration:
        completed.length > 0
          ? Math.round(completed.reduce((s, r) => s + r.durationMin, 0) / completed.length)
          : 0,
      failures: validationRuns.filter((r) => r.result === "fail").length,
    };
  }, [validationRuns]);
  // Suppress unused-warning while keeping the field available for future KPIs
  void completedCount;

  const toggleType = (t: RunType) => {
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      if (next.size === 0) return new Set(RUN_TYPES);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return validationRuns.filter((r) => {
      if (!types.has(r.type)) return false;
      if (q) {
        const n = q.toLowerCase();
        if (!r.id.toLowerCase().includes(n) && !r.serverId.toLowerCase().includes(n)) {
          return false;
        }
      }
      return true;
    });
  }, [types, q, validationRuns]);

  return (
    <main className="page">
      <PageHead
        title="Reports & Validation"
        meta={
          <>
            <span className="mono">{validationRuns.length} runs tracked</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">retention 90d</span>
          </>
        }
        actions={
          <>
            <Link href="/reports/servers" className="btn">
              <FileText size={13} />
              Server Reports
            </Link>
            <button className="btn">
              <Download size={13} />
              Export
            </button>
            <button className="btn btn-primary">
              <Play size={13} />
              New run
            </button>
          </>
        }
      />

      <Stagger
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <StaggerItem><KPI label="Runs today" value={runsToday} delta={{ dir: "up", value: "+3" }} foot="vs yesterday" /></StaggerItem>
        <StaggerItem><KPI label="Pass rate" value={`${passRate}%`} delta={{ dir: "up", value: "+2" }} foot="last 50 runs" /></StaggerItem>
        <StaggerItem><KPI label="Avg duration" value={`${Math.round(avgDuration / 60)}h`} delta={{ dir: "flat", value: "0" }} foot={`${avgDuration} min`} /></StaggerItem>
        <StaggerItem>
          <KPI
            label="Failures (7d)"
            value={<span style={{ color: "var(--danger)" }}>{failures}</span>}
            delta={{ dir: "down", value: "-1" }}
            foot="vs prior week"
          />
        </StaggerItem>
      </Stagger>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "minmax(0, 1fr) 360px" : "minmax(0, 1fr)", gap: 12 }}>
        <Surface flush>
          <div className="toolbar">
            <span className="label-mono">Type</span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {RUN_TYPES.map((t) => (
                <button
                  key={t}
                  className={cn("filter-chip", types.has(t) && "active")}
                  onClick={() => toggleType(t)}
                >
                  {t}
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
                placeholder="Run ID, server..."
              />
            </div>
            <div className="toolbar-spacer" />
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
              {filtered.length} runs
            </span>
          </div>

          {compareIds.size > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "var(--accent-dim)",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
              }}
            >
              <GitBranch size={12} style={{ color: "var(--accent-2)" }} />
              <span className="mono" style={{ color: "var(--text)" }}>
                {compareIds.size} selected
              </span>
              <span style={{ color: "var(--text-3)" }}>(max 4)</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <Link
                  href={`/reports/compare?ids=${Array.from(compareIds).join(",")}`}
                  className="btn btn-primary"
                  style={{ padding: "3px 8px", fontSize: 11 }}
                >
                  Compare side-by-side
                </Link>
                <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => setCompareIds(new Set())}>
                  <X size={11} />
                  Clear
                </button>
              </div>
            </div>
          )}

          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 28 }} />
                <th>Run</th>
                <th>Type</th>
                <th>Server</th>
                <th>Started</th>
                <th style={{ textAlign: "right" }}>Duration</th>
                <th>Result</th>
                <th>Engineer</th>
                <th>Notes</th>
              </tr>
            </thead>
            <Stagger as="tbody">
              {filtered.map((r) => {
                const eng = engineerById(r.engineerId);
                return (
                  <StaggerItem
                    as="tr"
                    key={r.id}
                    className={selected?.id === r.id ? "selected" : ""}
                    onClick={() => setSelected(r)}
                  >
                    <td onClick={(e) => { e.stopPropagation(); toggleCompare(r.id); }}>
                      <input
                        type="checkbox"
                        checked={compareIds.has(r.id)}
                        onChange={() => toggleCompare(r.id)}
                        disabled={!compareIds.has(r.id) && compareIds.size >= 4}
                        aria-label={`Select ${r.id} for comparison`}
                      />
                    </td>
                    <td className="id-cell">{r.id}</td>
                    <td>
                      <Chip tone="outline">{r.type}</Chip>
                    </td>
                    <td className="mono" style={{ color: "var(--text-2)" }}>
                      {r.serverId}
                    </td>
                    <td className="mono" style={{ color: "var(--text-3)" }}>
                      <TimeAgo iso={r.startedISO} />
                    </td>
                    <td className="num">
                      {r.result === "running"
                        ? "in progress"
                        : r.durationMin >= 60
                        ? `${(r.durationMin / 60).toFixed(1)}h`
                        : `${r.durationMin}m`}
                    </td>
                    <td>
                      <ResultChip r={r.result} />
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Avatar name={eng?.name ?? "??"} size="sm" />
                        <span style={{ fontSize: 11.5 }}>{eng?.initials}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-3)", fontSize: 11.5, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.notes || "—"}
                    </td>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </table>
        </Surface>

        <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0.2, 1] }}
            className="side-panel"
            style={{ alignSelf: "start", position: "sticky", top: 60 }}
          >
            <div className="surface-head">
              <span className="mono" style={{ fontWeight: 600 }}>
                {selected.id}
              </span>
              <Chip tone="outline" className="ml-2">
                {selected.type}
              </Chip>
              <button
                className="btn btn-ghost"
                style={{ marginLeft: "auto", padding: "2px 6px" }}
                onClick={() => setSelected(null)}
              >
                <X size={12} />
              </button>
            </div>

            <div className="side-panel-section">
              <div className="side-panel-title">Summary</div>
              <div className="side-panel-row"><span className="k">Server</span><span className="v mono">{selected.serverId}</span></div>
              <div className="side-panel-row"><span className="k">Started</span><TimeAgo iso={selected.startedISO} className="v mono" /></div>
              <div className="side-panel-row"><span className="k">Duration</span><span className="v mono">{selected.durationMin} min</span></div>
              <div className="side-panel-row"><span className="k">Result</span><span className="v"><ResultChip r={selected.result} /></span></div>
              <div className="side-panel-row"><span className="k">Pass</span><span className="v mono">{selected.passCount}</span></div>
              <div className="side-panel-row"><span className="k">Fail</span><span className="v mono" style={{ color: selected.failCount > 0 ? "var(--danger)" : "var(--text)" }}>{selected.failCount}</span></div>
            </div>

            <div className="side-panel-section">
              <div className="side-panel-title">Steps</div>
              <div>
                {generateSteps(selected).map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto",
                      padding: "5px 0",
                      fontSize: 11.5,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span className="mono" style={{ color: "var(--text-2)" }}>
                      {step.name}
                    </span>
                    <span>
                      <Chip
                        tone={
                          step.status === "pass"
                            ? "success"
                            : step.status === "fail"
                            ? "danger"
                            : step.status === "running"
                            ? "info"
                            : "neutral"
                        }
                      >
                        {step.status}
                      </Chip>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selected.notes && (
              <div className="side-panel-section">
                <div className="side-panel-title">Notes</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
                  {selected.notes}
                </div>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function generateSteps(r: ValidationRun): { name: string; status: "pass" | "fail" | "running" | "skipped" }[] {
  const base: Record<RunType, string[]> = {
    Thermal: ["Inlet baseline", "Soak 25% load", "Soak 75% load", "Recovery", "Sensor delta check"],
    "Burn-in": ["Pre-flight", "8h ramp", "24h sustained", "48h sustained", "72h sustained", "Cool-down"],
    Power: ["1+1 redundancy", "2+2 redundancy", "AC failover", "DC failover", "PSU swap"],
    Memory: ["Pattern walk", "Random R/W", "Bandwidth saturation", "ECC injection"],
    Network: ["Link bring-up", "Bidirectional iperf3", "Latency RTT", "Packet loss"],
    Storage: ["Sequential R", "Sequential W", "Random R/W", "Mixed workload", "Endurance burst"],
  };
  const steps = base[r.type];
  return steps.map((name, i) => {
    if (r.result === "running") {
      return { name, status: i < Math.floor(steps.length / 2) ? "pass" : i === Math.floor(steps.length / 2) ? "running" : "skipped" };
    }
    if (r.result === "fail" && i === steps.length - 1) return { name, status: "fail" };
    if (r.result === "partial" && i >= steps.length - 2) {
      return { name, status: i === steps.length - 1 ? "fail" : "pass" };
    }
    return { name, status: "pass" };
  });
}
