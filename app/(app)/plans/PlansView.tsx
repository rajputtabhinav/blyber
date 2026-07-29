"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Filter, Plus, Search } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { KPI } from "@/components/ui/KPI";
import type { Engineer, TestPlan, TestPlanScope, TestPlanStatus, ValidationRun } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const SCOPES: (TestPlanScope | "all")[] = [
  "all", "GPU", "CPU", "Memory", "Storage", "Network", "Power", "Thermal", "Burn-in", "Platform", "Firmware",
];
const STATUSES: (TestPlanStatus | "all")[] = ["all", "active", "draft", "deprecated"];

function statusTone(s: TestPlanStatus) {
  return s === "active" ? "success" : s === "draft" ? "warning" : "neutral";
}

function fmtDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function PlansView({
  testPlans,
  validationRuns,
  engineers,
}: {
  testPlans: TestPlan[];
  validationRuns: ValidationRun[];
  engineers: Engineer[];
}) {
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const [scope, setScope] = useState<TestPlanScope | "all">("all");
  const [status, setStatus] = useState<TestPlanStatus | "all">("active");
  const [q, setQ] = useState("");

  // Per-plan rollup: how many runs, pass rate
  const runStats = useMemo(() => {
    const m = new Map<string, { runs: number; passed: number; lastRunISO?: string }>();
    for (const r of validationRuns) {
      if (!r.testPlanId) continue;
      const e = m.get(r.testPlanId) ?? { runs: 0, passed: 0 };
      e.runs++;
      if (r.result === "pass") e.passed++;
      if (!e.lastRunISO || r.startedISO > e.lastRunISO) e.lastRunISO = r.startedISO;
      m.set(r.testPlanId, e);
    }
    return m;
  }, [validationRuns]);

  const filtered = useMemo(() => {
    return testPlans.filter((p) => {
      if (scope !== "all" && p.scope !== scope) return false;
      if (status !== "all" && p.status !== status) return false;
      if (q) {
        const n = q.toLowerCase();
        if (
          !p.name.toLowerCase().includes(n) &&
          !p.id.toLowerCase().includes(n) &&
          !(p.description?.toLowerCase().includes(n))
        ) return false;
      }
      return true;
    });
  }, [scope, status, q, testPlans]);

  const kpi = useMemo(() => {
    const active = testPlans.filter((p) => p.status === "active");
    const totalRuns = Array.from(runStats.values()).reduce((s, e) => s + e.runs, 0);
    const totalPassed = Array.from(runStats.values()).reduce((s, e) => s + e.passed, 0);
    return {
      active: active.length,
      totalRuns,
      passRate: totalRuns > 0 ? Math.round((totalPassed / totalRuns) * 100) : 0,
      avgDurMin: active.length > 0 ? Math.round(active.reduce((s, p) => s + p.expectedDurationMin, 0) / active.length) : 0,
    };
  }, [runStats, testPlans]);

  return (
    <main className="page">
      <PageHead
        title="Test Plans"
        meta={
          <>
            <span className="mono">{testPlans.length} plans</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{kpi.active} active</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{kpi.totalRuns} runs executed</span>
          </>
        }
        actions={
          <button className="btn btn-primary">
            <Plus size={13} />
            New plan
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
        <KPI label="Active plans" value={kpi.active} foot="qualification programs" />
        <KPI label="Runs executed" value={kpi.totalRuns} foot="across all plans" />
        <KPI
          label="Pass rate"
          value={
            <span style={{ color: kpi.passRate >= 90 ? "var(--success)" : kpi.passRate >= 70 ? "var(--warning)" : "var(--danger)" }}>
              {kpi.passRate}%
            </span>
          }
          foot="all-time"
        />
        <KPI label="Avg duration" value={fmtDuration(kpi.avgDurMin)} foot="active plans" />
      </div>

      <Surface flush>
        <div className="toolbar">
          <span className="label-mono">
            <Filter size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Scope
          </span>
          {SCOPES.map((s) => (
            <button key={s} className={cn("filter-chip", scope === s && "active")} onClick={() => setScope(s)}>
              {s === "all" ? "All" : s}
            </button>
          ))}
          <div className="toolbar-sep" />
          <span className="label-mono">Status</span>
          {STATUSES.map((s) => (
            <button key={s} className={cn("filter-chip", status === s && "active")} onClick={() => setStatus(s)}>
              {s === "all" ? "All" : s}
            </button>
          ))}
          <div className="toolbar-sep" />
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, id, description…"
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
              <th>ID</th>
              <th>Plan</th>
              <th>Scope</th>
              <th>Version</th>
              <th>Steps</th>
              <th>Criteria</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Owner</th>
              <th style={{ textAlign: "right" }}>Runs</th>
              <th style={{ textAlign: "right" }}>Pass rate</th>
              <th>Last run</th>
            </tr>
          </thead>
          <Stagger as="tbody">
            {filtered.map((p) => {
              const owner = p.ownerEngineerId ? engineerById(p.ownerEngineerId) : undefined;
              const s = runStats.get(p.id) ?? { runs: 0, passed: 0, lastRunISO: undefined };
              const passRate = s.runs > 0 ? Math.round((s.passed / s.runs) * 100) : null;
              return (
                <StaggerItem as="tr" key={p.id}>
                  <td className="id-cell">
                    <Link href={`/plans/${p.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {p.id}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/plans/${p.id}`} style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}>
                      {p.name}
                    </Link>
                    {p.description && (
                      <div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 380 }}>
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td><Chip tone="outline">{p.scope}</Chip></td>
                  <td className="mono" style={{ color: "var(--text-2)" }}>{p.version}</td>
                  <td className="num">{p.steps.length}</td>
                  <td className="num">
                    <span style={{ color: p.acceptance.some((a) => a.severity === "must") ? "var(--text)" : "var(--text-3)" }}>
                      {p.acceptance.length}
                    </span>
                  </td>
                  <td className="mono" style={{ color: "var(--text-3)" }}>{fmtDuration(p.expectedDurationMin)}</td>
                  <td><Chip tone={statusTone(p.status)}>{p.status}</Chip></td>
                  <td>
                    {owner ? (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Avatar name={owner.name} size="sm" />
                        <span style={{ fontSize: 11.5 }}>{owner.initials}</span>
                      </div>
                    ) : (
                      <span className="mono" style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </td>
                  <td className="num">{s.runs}</td>
                  <td className="num">
                    {passRate === null ? (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    ) : (
                      <span style={{ color: passRate >= 90 ? "var(--success)" : passRate >= 70 ? "var(--warning)" : "var(--danger)" }}>
                        {passRate}%
                      </span>
                    )}
                  </td>
                  <td className="mono" style={{ color: "var(--text-3)" }}>
                    {s.lastRunISO ? <TimeAgo iso={s.lastRunISO} /> : "—"}
                  </td>
                </StaggerItem>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={12}>
                  <div className="empty">
                    <ClipboardList size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    No test plans match the current filters.
                  </div>
                </td>
              </tr>
            )}
          </Stagger>
        </table>
      </Surface>
    </main>
  );
}
