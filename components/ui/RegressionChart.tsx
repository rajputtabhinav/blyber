"use client";

import { useId, useMemo, useState } from "react";
import type { ValidationRun } from "@/lib/types";

interface Point {
  x: number; // timestamp ms
  y: number; // metric value
  run: ValidationRun;
  pass: boolean;
}

interface RegressionChartProps {
  runs: ValidationRun[];
  /** Metric key to plot (e.g., "nccl_allreduce_gbps"). */
  metric: string;
  unit?: string;
  /** Hard limit (acceptance threshold) — drawn as a dashed line. */
  limit?: number;
  comparator?: "lt" | "lte" | "gt" | "gte" | "eq";
  height?: number;
  /** Optional baseline value (median of the first N runs) used for
   * highlighting regressions. */
  baseline?: number;
  /** Allowed drift % from baseline. Default 2. */
  regressionPct?: number;
  title?: string;
}

/**
 * Plots one metric across a sequence of validation runs over time.
 * Highlights regressions (drop > regressionPct vs baseline). The line
 * is the metric trajectory; each run is a circle coloured by pass/fail
 * against the acceptance criterion.
 */
export function RegressionChart({
  runs,
  metric,
  unit,
  limit,
  comparator = "gte",
  height = 180,
  baseline,
  regressionPct = 2,
  title,
}: RegressionChartProps) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<{ idx: number; x: number; y: number; p: Point } | null>(null);

  // Build sorted points: runs with the metric, oldest → newest
  const points: Point[] = useMemo(() => {
    const out: Point[] = [];
    for (const r of runs) {
      const m = r.measurements?.find((mm) => mm.metric === metric);
      if (!m) continue;
      out.push({
        x: new Date(r.startedISO).getTime(),
        y: m.value,
        run: r,
        pass: m.pass !== false,
      });
    }
    return out.sort((a, b) => a.x - b.x);
  }, [runs, metric]);

  // Derived baseline (median of first 3) if not supplied
  const effectiveBaseline = useMemo(() => {
    if (baseline !== undefined) return baseline;
    if (points.length < 2) return undefined;
    const first = points.slice(0, Math.min(3, points.length)).map((p) => p.y).sort((a, b) => a - b);
    return first[Math.floor(first.length / 2)];
  }, [points, baseline]);

  // Regressions (post-baseline points that exceeded threshold).
  // Computed before any early return so hook order stays stable.
  const regressions = useMemo(() => {
    if (effectiveBaseline === undefined) return new Set<number>();
    const out = new Set<number>();
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (comparator === "gte" || comparator === "gt") {
        const dropPct = ((effectiveBaseline - p.y) / effectiveBaseline) * 100;
        if (dropPct > regressionPct) out.add(i);
      }
      if (comparator === "lte" || comparator === "lt") {
        const risePct = ((p.y - effectiveBaseline) / effectiveBaseline) * 100;
        if (risePct > regressionPct) out.add(i);
      }
    }
    return out;
  }, [points, effectiveBaseline, comparator, regressionPct]);

  // Plot geometry
  const W = 800;
  const H = height;
  const PAD_L = 44;
  const PAD_R = 12;
  const PAD_T = 12;
  const PAD_B = 26;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  if (points.length === 0) {
    return (
      <div
        className="empty"
        style={{
          padding: 18,
          fontSize: 12,
          color: "var(--text-3)",
          textAlign: "center",
          border: "1px solid var(--border)",
          borderRadius: 6,
        }}
      >
        No runs recorded with metric <span className="mono">{metric}</span> yet.
      </div>
    );
  }

  // Y-range with padding; include limit + baseline in range so they're always visible
  const ysAll = [
    ...points.map((p) => p.y),
    ...(limit !== undefined ? [limit] : []),
    ...(effectiveBaseline !== undefined ? [effectiveBaseline] : []),
  ];
  const yMinRaw = Math.min(...ysAll);
  const yMaxRaw = Math.max(...ysAll);
  const yPad = (yMaxRaw - yMinRaw) * 0.15 || Math.abs(yMaxRaw) * 0.05 || 1;
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;

  const xMin = points[0].x;
  const xMax = points[points.length - 1].x;
  const xSpan = xMax - xMin || 1;

  function px(p: Point) {
    const x = PAD_L + ((p.x - xMin) / xSpan) * plotW;
    const y = PAD_T + (1 - (p.y - yMin) / (yMax - yMin)) * plotH;
    return { x, y };
  }

  const pathD = points
    .map((p, i) => {
      const { x, y } = px(p);
      return (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
    })
    .join(" ");

  // Y ticks: 4 evenly-spaced
  const ticks: number[] = [];
  for (let i = 0; i <= 4; i++) ticks.push(yMin + ((yMax - yMin) * i) / 4);

  // Pass-threshold styling
  const limitY = limit !== undefined ? PAD_T + (1 - (limit - yMin) / (yMax - yMin)) * plotH : undefined;
  const baselineY = effectiveBaseline !== undefined ? PAD_T + (1 - (effectiveBaseline - yMin) / (yMax - yMin)) * plotH : undefined;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const vbX = (xPx / rect.width) * W;
    // Find closest point by x
    let bestIdx = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const { x } = px(p);
      const d = Math.abs(x - vbX);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    const p = points[bestIdx];
    const { x, y } = px(p);
    setHover({ idx: bestIdx, x, y, p });
  }

  function dateLabel(ms: number) {
    const d = new Date(ms);
    return `${String(d.getUTCFullYear()).slice(2)}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  }

  return (
    <div style={{ position: "relative" }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, fontSize: 12 }}>
          <span className="label-mono">Metric</span>
          <span className="mono" style={{ color: "var(--text)" }}>{metric}{unit ? ` (${unit})` : ""}</span>
          {effectiveBaseline !== undefined && (
            <>
              <span style={{ color: "var(--text-3)" }}>·</span>
              <span className="mono" style={{ color: "var(--text-3)" }}>
                baseline {effectiveBaseline.toFixed(1)}{unit ?? ""}
              </span>
            </>
          )}
          {limit !== undefined && (
            <>
              <span style={{ color: "var(--text-3)" }}>·</span>
              <span className="mono" style={{ color: "var(--text-3)" }}>
                limit {comparator} {limit}{unit ?? ""}
              </span>
            </>
          )}
          <span style={{ marginLeft: "auto", color: regressions.size > 0 ? "var(--danger)" : "var(--text-3)" }} className="mono">
            {regressions.size > 0 ? `⚠ ${regressions.size} regression${regressions.size !== 1 ? "s" : ""}` : "no regression"}
          </span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        preserveAspectRatio="none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-2)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Horizontal grid + y-axis labels */}
        {ticks.map((t, i) => {
          const y = PAD_T + (1 - (t - yMin) / (yMax - yMin)) * plotH;
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="rgba(230,237,243,0.07)" strokeWidth={1} />
              <text x={PAD_L - 6} y={y + 3} textAnchor="end" fill="var(--text-3)"
                style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10 }}>
                {t.toFixed(t > 10 ? 0 : 1)}
              </text>
            </g>
          );
        })}

        {/* Limit dashed line */}
        {limitY !== undefined && (
          <line x1={PAD_L} x2={W - PAD_R} y1={limitY} y2={limitY} stroke="var(--warning)" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.7} />
        )}
        {/* Baseline dotted line */}
        {baselineY !== undefined && (
          <line x1={PAD_L} x2={W - PAD_R} y1={baselineY} y2={baselineY} stroke="var(--info)" strokeWidth={1} strokeDasharray="2 4" opacity={0.6} />
        )}

        {/* Area under line */}
        <path d={`${pathD} L${PAD_L + plotW},${PAD_T + plotH} L${PAD_L},${PAD_T + plotH} Z`} fill={`url(#grad-${id})`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--accent-2)" strokeWidth={1.5} />

        {/* Points */}
        {points.map((p, i) => {
          const { x, y } = px(p);
          const isReg = regressions.has(i);
          const fill = isReg ? "var(--danger)" : p.pass ? "var(--success)" : "var(--warning)";
          return (
            <circle key={i} cx={x} cy={y} r={3.5} fill={fill} stroke="var(--bg)" strokeWidth={1} />
          );
        })}

        {/* X-axis date labels — first, middle, last */}
        {(() => {
          const xs = [0, 0.5, 1];
          return xs.map((p, i) => {
            const x = PAD_L + plotW * p;
            const ms = xMin + xSpan * p;
            return (
              <text key={i} x={x} y={H - 8} textAnchor="middle" fill="var(--text-3)"
                style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10 }}>
                {dateLabel(ms)}
              </text>
            );
          });
        })()}

        {/* Crosshair */}
        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={PAD_T} y2={PAD_T + plotH} stroke="var(--text-3)" strokeWidth={1} strokeDasharray="2 3" />
            <circle cx={hover.x} cy={hover.y} r={5} fill="none" stroke="var(--accent-2)" strokeWidth={1.5} />
          </g>
        )}
      </svg>

      {hover && (
        <div
          className="mono"
          style={{
            position: "absolute",
            top: 30,
            right: 16,
            fontSize: 11,
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "5px 8px",
            color: "var(--text)",
            pointerEvents: "none",
            minWidth: 140,
          }}
        >
          <div style={{ color: "var(--text-2)", marginBottom: 2 }}>{hover.p.run.id}</div>
          <div>
            <span style={{ color: regressions.has(hover.idx) ? "var(--danger)" : "var(--text)" }}>
              {hover.p.y.toFixed(2)}{unit ?? ""}
            </span>
            {effectiveBaseline !== undefined && (
              <span style={{ color: "var(--text-3)", marginLeft: 6 }}>
                {hover.p.y >= effectiveBaseline ? "+" : ""}
                {(((hover.p.y - effectiveBaseline) / effectiveBaseline) * 100).toFixed(1)}%
              </span>
            )}
          </div>
          <div style={{ color: "var(--text-3)", fontSize: 10, marginTop: 2 }}>
            {dateLabel(hover.p.x)}
          </div>
        </div>
      )}
    </div>
  );
}
