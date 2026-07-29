"use client";

import { useMemo, Fragment } from "react";
import Link from "next/link";
import { ArrowLeft, GitBranch, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type {
  Component,
  Engineer,
  Platform,
  TestPlan,
  ValidationRun,
} from "@/lib/types";

interface RunSlice {
  run: ValidationRun;
}

function fmtNumber(v: number, unit?: string): string {
  const s = Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2);
  return unit ? `${s} ${unit}` : s;
}

function pct(a: number, b: number): number {
  if (b === 0) return 0;
  return ((a - b) / b) * 100;
}

export function CompareView({
  runs,
  ids,
  engineers,
  catalog,
  platforms,
  testPlans,
}: {
  runs: ValidationRun[];
  ids: string[];
  engineers: Engineer[];
  catalog: Component[];
  platforms: Platform[];
  testPlans: TestPlan[];
}) {
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const componentById = (id: string) => catalog.find((c) => c.id === id);
  const platformById = (id: string) => platforms.find((p) => p.id === id);
  const testPlanById = (id: string) => testPlans.find((p) => p.id === id);

  // Collect every metric that appears in any run
  const allMetrics = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const r of runs) {
      for (const m of r.measurements ?? []) {
        if (!seen.has(m.metric)) {
          seen.add(m.metric);
          ordered.push(m.metric);
        }
      }
    }
    return ordered;
  }, [runs]);

  // Build a "BOM diff" set: every distinct componentId across all manifests,
  // tagged with which runs include it.
  const bomDiff = useMemo(() => {
    type Row = { componentId: string; presence: (RunSlice & { count?: number; instanceSerial?: string })[] };
    const map = new Map<string, Row>();
    for (const r of runs) {
      for (const m of r.componentManifest ?? []) {
        const key = m.componentId;
        const row = map.get(key) ?? { componentId: key, presence: [] };
        row.presence.push({ run: r, count: m.count, instanceSerial: m.instanceId });
        map.set(key, row);
      }
    }
    return Array.from(map.values());
  }, [runs]);

  if (ids.length === 0) {
    return (
      <main className="page">
        <PageHead title="Run comparison" />
        <Surface>
          <div className="empty">
            No runs selected. Append <span className="mono">?ids=VR-3091,VR-3093</span> to compare.
          </div>
        </Surface>
      </main>
    );
  }

  if (runs.length === 0) {
    return (
      <main className="page">
        <PageHead title="Run comparison" />
        <Surface>
          <div className="empty">None of those run IDs matched.</div>
        </Surface>
      </main>
    );
  }

  return (
    <main className="page">
      <div style={{ marginBottom: 8 }}>
        <Link href="/reports" className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          <ArrowLeft size={12} />
          Back to reports
        </Link>
      </div>

      <PageHead
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GitBranch size={16} />
            <span style={{ fontWeight: 600 }}>Run comparison</span>
            <span className="mono" style={{ color: "var(--text-3)", fontSize: 13 }}>
              {runs.length} runs
            </span>
          </div>
        }
        meta={
          <span className="mono" style={{ color: "var(--text-3)" }}>
            {runs.map((r) => r.id).join(" · ")}
          </span>
        }
      />

      {/* HEADER: run identity strip ============================ */}
      <Surface flush>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `200px repeat(${runs.length}, minmax(0, 1fr))`,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Hcell isLabel>Run</Hcell>
          {runs.map((r) => (
            <Hcell key={r.id}>
              <div className="mono" style={{ fontWeight: 600, color: "var(--text)" }}>{r.id}</div>
              <Chip tone="outline" className="mt-1">{r.type}</Chip>
            </Hcell>
          ))}
          <Hcell isLabel>Plan</Hcell>
          {runs.map((r) => {
            const plan = r.testPlanId ? testPlanById(r.testPlanId) : undefined;
            return (
              <Hcell key={r.id}>
                {plan ? (
                  <Link href={`/plans/${plan.id}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                    <div style={{ fontSize: 12 }}>{plan.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>v{plan.version}</div>
                  </Link>
                ) : (
                  <span className="mono" style={{ color: "var(--text-3)" }}>—</span>
                )}
              </Hcell>
            );
          })}
          <Hcell isLabel>Result</Hcell>
          {runs.map((r) => (
            <Hcell key={r.id}>
              <Chip tone={r.result === "pass" ? "success" : r.result === "fail" ? "danger" : r.result === "partial" ? "warning" : "info"}>
                {r.result}
              </Chip>
            </Hcell>
          ))}
          <Hcell isLabel>Server / Platform</Hcell>
          {runs.map((r) => {
            const plat = r.platformId ? platformById(r.platformId) : undefined;
            return (
              <Hcell key={r.id}>
                <Link href={`/inventory/${r.serverId}`} className="mono" style={{ fontSize: 11.5, color: "var(--text-2)", textDecoration: "none" }}>
                  {r.serverId}
                </Link>
                <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>{plat?.name ?? "—"}</div>
              </Hcell>
            );
          })}
          <Hcell isLabel>Engineer</Hcell>
          {runs.map((r) => {
            const e = engineerById(r.engineerId);
            return (
              <Hcell key={r.id}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Avatar name={e?.name ?? "?"} size="sm" />
                  <span style={{ fontSize: 11.5 }}>{e?.initials}</span>
                </div>
              </Hcell>
            );
          })}
          <Hcell isLabel>When</Hcell>
          {runs.map((r) => (
            <Hcell key={r.id}>
              <TimeAgo iso={r.startedISO} className="mono" />
            </Hcell>
          ))}
        </div>
      </Surface>

      {/* MEASUREMENTS DIFF ================================ */}
      <Surface flush title={<>Measurements</>}  className="mt-3">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `200px repeat(${runs.length}, minmax(0, 1fr))`,
          }}
        >
          <Hcell isLabel isHeader>Metric</Hcell>
          {runs.map((r) => (
            <Hcell key={r.id} isHeader>
              <span className="mono" style={{ color: "var(--text-2)" }}>{r.id}</span>
            </Hcell>
          ))}

          {allMetrics.map((metric) => {
            const cells = runs.map((r) => {
              const m = r.measurements?.find((mm) => mm.metric === metric);
              return m;
            });
            const reference = cells[0]; // first run is the reference
            return (
              <Fragment key={metric}>
                <Hcell isLabel className="mono" style={{ fontSize: 11.5 }}>
                  {metric}
                </Hcell>
                {cells.map((m, i) => {
                  if (!m) {
                    return <Hcell key={i}><span className="mono" style={{ color: "var(--text-3)" }}>—</span></Hcell>;
                  }
                  const valueText = fmtNumber(m.value, m.unit);
                  let deltaText: React.ReactNode = null;
                  let deltaColor = "var(--text-3)";
                  let DeltaIcon: typeof Minus | null = null;
                  if (reference && i > 0 && reference.value !== undefined) {
                    const d = pct(m.value, reference.value);
                    const absD = Math.abs(d);
                    if (absD >= 0.05) {
                      if (d > 0) { DeltaIcon = ArrowUpRight; }
                      else       { DeltaIcon = ArrowDownRight; }
                    } else {
                      DeltaIcon = Minus;
                    }
                    // For metrics where bigger is better (gte / gt), a drop is bad.
                    // For metrics where smaller is better (lte / lt), a rise is bad.
                    const cmp = m.comparator ?? "gte";
                    const isRegression =
                      ((cmp === "gte" || cmp === "gt") && d < -1) ||
                      ((cmp === "lte" || cmp === "lt") && d > 1);
                    const isImprovement =
                      ((cmp === "gte" || cmp === "gt") && d > 1) ||
                      ((cmp === "lte" || cmp === "lt") && d < -1);
                    deltaColor = isRegression ? "var(--danger)" : isImprovement ? "var(--success)" : "var(--text-3)";
                    deltaText = `${d > 0 ? "+" : ""}${d.toFixed(1)}%`;
                  }
                  return (
                    <Hcell key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          className="mono"
                          style={{
                            fontSize: 12,
                            color: m.pass === false ? "var(--danger)" : "var(--text)",
                            fontWeight: m.pass === false ? 600 : 400,
                          }}
                        >
                          {valueText}
                        </span>
                        {DeltaIcon && (
                          <span style={{ color: deltaColor, display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11 }} className="mono">
                            <DeltaIcon size={11} />
                            {deltaText}
                          </span>
                        )}
                        {m.pass === false && (
                          <Chip tone="danger" className="ml-1">FAIL</Chip>
                        )}
                      </div>
                    </Hcell>
                  );
                })}
              </Fragment>
            );
          })}
          {allMetrics.length === 0 && (
            <div style={{ gridColumn: `1 / span ${runs.length + 1}` }} className="empty">
              No structured measurements recorded on these runs.
            </div>
          )}
        </div>
      </Surface>

      {/* BOM / MANIFEST DIFF ============================== */}
      <Surface flush title="Manifest diff" className="mt-3">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `200px repeat(${runs.length}, minmax(0, 1fr))`,
          }}
        >
          <Hcell isLabel isHeader>Component</Hcell>
          {runs.map((r) => (
            <Hcell key={r.id} isHeader>
              <span className="mono" style={{ color: "var(--text-2)" }}>{r.id}</span>
            </Hcell>
          ))}

          {bomDiff.map((row) => {
            const c = componentById(row.componentId);
            return (
              <Fragment key={row.componentId}>
                <Hcell isLabel>
                  <Link href={`/components/${row.componentId}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 }}>
                      <Chip tone="outline">{c?.kind ?? "?"}</Chip>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c?.shortName ?? c?.name ?? row.componentId}
                      </span>
                    </div>
                    {c?.version && (
                      <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                        {c.version}
                      </div>
                    )}
                  </Link>
                </Hcell>
                {runs.map((r) => {
                  const inRun = row.presence.find((p) => p.run.id === r.id);
                  if (!inRun) {
                    return (
                      <Hcell key={r.id}>
                        <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>—</span>
                      </Hcell>
                    );
                  }
                  return (
                    <Hcell key={r.id}>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--success)" }}>
                        ✓{inRun.count && inRun.count > 1 ? ` ×${inRun.count}` : ""}
                      </span>
                      {inRun.instanceSerial && (
                        <div className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                          {inRun.instanceSerial}
                        </div>
                      )}
                    </Hcell>
                  );
                })}
              </Fragment>
            );
          })}
          {bomDiff.length === 0 && (
            <div style={{ gridColumn: `1 / span ${runs.length + 1}` }} className="empty">
              No component manifests recorded on these runs.
            </div>
          )}
        </div>
      </Surface>
    </main>
  );
}

function Hcell({
  children,
  isLabel,
  isHeader,
  className,
  style,
}: {
  children: React.ReactNode;
  isLabel?: boolean;
  isHeader?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        padding: "8px 12px",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        fontSize: 12,
        background: isHeader
          ? "rgba(255,255,255,0.012)"
          : isLabel
          ? "rgba(255,255,255,0.008)"
          : "transparent",
        color: isLabel ? "var(--text-3)" : "var(--text)",
        fontFamily: isLabel && !isHeader ? "var(--font-mono), monospace" : undefined,
        fontWeight: isHeader ? 500 : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

