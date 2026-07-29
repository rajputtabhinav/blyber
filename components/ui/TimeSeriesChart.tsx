"use client";

import { useId, useMemo, useState } from "react";

interface TimeSeriesChartProps {
  values: number[];
  unit?: string;
  height?: number;
  stroke?: string;
  /** Threshold lines: dashed horizontal lines drawn at these y values */
  warningAt?: number;
  dangerAt?: number;
}

/**
 * Dense, technical time-series chart. Hand-rolled SVG to keep the
 * Grafana/Datadog feel without pulling in Recharts. 24h window assumed,
 * 15-minute granularity → 96 points.
 */
export function TimeSeriesChart({
  values,
  unit = "",
  height = 140,
  stroke = "var(--warning)",
  warningAt,
  dangerAt,
}: TimeSeriesChartProps) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<{ idx: number; x: number; y: number; v: number } | null>(null);

  const W = 800; // viewBox width — scales to container
  const H = height;
  const PAD_L = 32;
  const PAD_R = 8;
  const PAD_T = 8;
  const PAD_B = 18;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const { min, max, ticks, line, area } = useMemo(() => {
    const vMin = Math.min(...values);
    const vMax = Math.max(...values);
    // Round bounds to nicer steps
    const span = vMax - vMin || 1;
    const pad = span * 0.12;
    const lo = vMin - pad;
    const hi = vMax + pad;
    const stepY = plotH / (hi - lo);
    const stepX = plotW / (values.length - 1);

    const tickCount = 4;
    const tks: number[] = [];
    for (let i = 0; i <= tickCount; i++) {
      tks.push(lo + ((hi - lo) * i) / tickCount);
    }

    let l = "";
    values.forEach((v, i) => {
      const x = PAD_L + i * stepX;
      const y = PAD_T + (hi - v) * stepY;
      l += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2);
    });
    const a = l + ` L${PAD_L + plotW},${PAD_T + plotH} L${PAD_L},${PAD_T + plotH} Z`;

    return { min: lo, max: hi, ticks: tks, line: l, area: a };
  }, [values, plotH, plotW]);

  const stepX = plotW / (values.length - 1);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const vbX = (xPx / rect.width) * W;
    const idx = Math.max(
      0,
      Math.min(values.length - 1, Math.round((vbX - PAD_L) / stepX)),
    );
    const v = values[idx];
    const x = PAD_L + idx * stepX;
    const y = PAD_T + (max - v) * (plotH / (max - min));
    setHover({ idx, x, y, v });
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
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
            <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* horizontal grid + y-axis labels */}
        {ticks.map((t, i) => {
          const y = PAD_T + (max - t) * (plotH / (max - min));
          return (
            <g key={i}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={y}
                y2={y}
                stroke="rgba(230,237,243,0.07)"
                strokeWidth={1}
              />
              <text
                x={PAD_L - 6}
                y={y + 3}
                textAnchor="end"
                fill="var(--text-3)"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10,
                }}
              >
                {Math.round(t)}
              </text>
            </g>
          );
        })}

        {/* danger / warning bands */}
        {dangerAt !== undefined && dangerAt < max && (
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={PAD_T + (max - dangerAt) * (plotH / (max - min))}
            y2={PAD_T + (max - dangerAt) * (plotH / (max - min))}
            stroke="var(--danger)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.65}
          />
        )}
        {warningAt !== undefined && warningAt < max && (
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={PAD_T + (max - warningAt) * (plotH / (max - min))}
            y2={PAD_T + (max - warningAt) * (plotH / (max - min))}
            stroke="var(--warning)"
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />
        )}

        {/* area + line */}
        <path d={area} fill={`url(#grad-${id})`} />
        <path d={line} fill="none" stroke={stroke} strokeWidth={1.5} />

        {/* x-axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
          const x = PAD_L + plotW * p;
          const hoursAgo = Math.round((1 - p) * 24);
          return (
            <text
              key={i}
              x={x}
              y={H - 4}
              textAnchor="middle"
              fill="var(--text-3)"
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 10,
              }}
            >
              {hoursAgo === 0 ? "now" : `-${hoursAgo}h`}
            </text>
          );
        })}

        {/* hover crosshair */}
        {hover && (
          <g>
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PAD_T}
              y2={PAD_T + plotH}
              stroke="var(--text-3)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            <circle cx={hover.x} cy={hover.y} r={3} fill={stroke} />
          </g>
        )}
      </svg>

      {hover && (
        <div
          className="mono"
          style={{
            position: "absolute",
            top: 6,
            right: 12,
            fontSize: 11,
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            padding: "3px 6px",
            color: "var(--text)",
            pointerEvents: "none",
          }}
        >
          {hover.v.toFixed(1)}
          {unit}
          <span style={{ color: "var(--text-3)", marginLeft: 8 }}>
            -{Math.round((1 - hover.idx / (values.length - 1)) * 24 * 4) / 4}h
          </span>
        </div>
      )}
    </div>
  );
}
