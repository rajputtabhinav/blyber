"use client";

import { useMemo, useState } from "react";
import { Filter, Plus, Power, Thermometer, Flame, Activity } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import type { Engineer, Rack, ServerNode } from "@/lib/types";
import { Stagger, StaggerItem } from "@/components/ui/motion";

type ViewMode = "status" | "thermal" | "power";

function thermalToColor(c: number): string {
  // 30 → cool blue, 60 → green, 75 → amber, 85 → red, 90+ → magenta
  if (c < 35) return "rgba(59,130,246,0.45)";
  if (c < 55) return "rgba(34,197,94,0.40)";
  if (c < 70) return "rgba(34,197,94,0.55)";
  if (c < 78) return "rgba(245,158,11,0.55)";
  if (c < 86) return "rgba(245,158,11,0.75)";
  if (c < 92) return "rgba(239,68,68,0.7)";
  return "rgba(236,72,153,0.75)";
}
function powerToColor(w: number, capW: number): string {
  const pct = w / capW;
  if (pct < 0.2) return "rgba(59,130,246,0.4)";
  if (pct < 0.4) return "rgba(34,197,94,0.5)";
  if (pct < 0.65) return "rgba(245,158,11,0.55)";
  if (pct < 0.85) return "rgba(245,158,11,0.75)";
  return "rgba(239,68,68,0.75)";
}

function stateForServer(s: ServerNode): "ok" | "warn" | "crit" | "off" {
  if (s.status === "offline" || s.status === "maintenance") return "off";
  if (s.status === "fault") return "crit";
  if (s.thermalC >= 80) return "warn";
  return "ok";
}

export function RacksView({
  racks,
  servers,
  engineers,
}: {
  racks: Rack[];
  servers: ServerNode[];
  engineers: Engineer[];
}) {
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const [site, setSite] = useState<string>("all");
  const [selectedRack, setSelectedRack] = useState<Rack | null>(racks[0] ?? null);
  const [hovered, setHovered] = useState<ServerNode | null>(null);
  const [view, setView] = useState<ViewMode>("status");

  const sites = useMemo(() => Array.from(new Set(racks.map((r) => r.site))), [racks]);
  const visible = useMemo(
    () => racks.filter((r) => site === "all" || r.site === site),
    [site, racks],
  );

  return (
    <main className="page">
      <PageHead
        title="Rack Layout"
        meta={
          <>
            <span className="mono">{visible.length} of {racks.length} racks</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">3 sites</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">62% avg util</span>
          </>
        }
        actions={
          <>
            <button className="btn">
              <Filter size={13} />
              Site filter
            </button>
            <button className="btn btn-primary">
              <Plus size={13} />
              New rack
            </button>
          </>
        }
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
        <span className="label-mono">View</span>
        <button
          className={cn("filter-chip", view === "status" && "active")}
          onClick={() => setView("status")}
        >
          <Activity size={11} style={{ marginRight: 4 }} />
          Status
        </button>
        <button
          className={cn("filter-chip", view === "thermal" && "active")}
          onClick={() => setView("thermal")}
        >
          <Flame size={11} style={{ marginRight: 4 }} />
          Thermal
        </button>
        <button
          className={cn("filter-chip", view === "power" && "active")}
          onClick={() => setView("power")}
        >
          <Power size={11} style={{ marginRight: 4 }} />
          Power
        </button>
        <div style={{ width: 1, height: 18, background: "var(--border)", margin: "0 6px" }} />
        <span className="label-mono">Site</span>
        <button
          className={cn("filter-chip", site === "all" && "active")}
          onClick={() => setSite("all")}
        >
          All
        </button>
        {sites.map((s) => (
          <button
            key={s}
            className={cn("filter-chip", site === s && "active")}
            onClick={() => setSite(s)}
          >
            {s}
          </button>
        ))}
        <div className="toolbar-spacer" />
        <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--text-3)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="legend-dot" style={{ background: "var(--success)" }} />
            ok
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="legend-dot" style={{ background: "var(--warning)" }} />
            warn
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="legend-dot" style={{ background: "var(--danger)" }} />
            fault
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="legend-dot" style={{ background: "var(--text-3)" }} />
            off / maint
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 12 }}>
        <Stagger
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
            alignItems: "start",
          }}
        >
          {visible.map((r) => (
            <StaggerItem key={r.id} style={{ minWidth: 0 }}>
              <RackCard
                rack={r}
                onSelect={() => setSelectedRack(r)}
                selected={selectedRack?.id === r.id}
                onHoverServer={setHovered}
                view={view}
                servers={servers}
              />
            </StaggerItem>
          ))}
        </Stagger>

        {selectedRack && (
        <div className="side-panel" style={{ position: "sticky", top: 60, alignSelf: "start" }}>
          <div className="surface-head">
            <span className="mono" style={{ fontWeight: 600 }}>
              {selectedRack.id}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }} className="mono">
              {selectedRack.site}
            </span>
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Capacity</div>
            <div className="side-panel-row">
              <span className="k">Utilization</span>
              <span className="v mono">{selectedRack.utilizationPct}%</span>
            </div>
            <div className="side-panel-row">
              <span className="k">RU used</span>
              <span className="v mono">
                {Math.round((selectedRack.utilizationPct / 100) * selectedRack.height)} / {selectedRack.height}
              </span>
            </div>
            <div className="side-panel-row">
              <span className="k">Zone</span>
              <span className="v mono">{selectedRack.zone}</span>
            </div>
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Power</div>
            <div className="side-panel-row">
              <span className="k">Used</span>
              <span className="v mono">{selectedRack.powerUsedKW.toFixed(1)} kW</span>
            </div>
            <div className="side-panel-row">
              <span className="k">Capacity</span>
              <span className="v mono">{selectedRack.powerTotalKW.toFixed(1)} kW</span>
            </div>
            <div className="side-panel-row">
              <span className="k">Headroom</span>
              <span
                className="v mono"
                style={{
                  color:
                    selectedRack.powerTotalKW - selectedRack.powerUsedKW < 2
                      ? "var(--danger)"
                      : "var(--text)",
                }}
              >
                {(selectedRack.powerTotalKW - selectedRack.powerUsedKW).toFixed(1)} kW
              </span>
            </div>
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Thermal</div>
            <div className="side-panel-row">
              <span className="k">Intake</span>
              <span className="v mono">{selectedRack.intakeC}°C</span>
            </div>
            <div className="side-panel-row">
              <span className="k">Exhaust</span>
              <span className="v mono">{selectedRack.exhaustC}°C</span>
            </div>
            <div className="side-panel-row">
              <span className="k">ΔT</span>
              <span className="v mono">{selectedRack.exhaustC - selectedRack.intakeC}°C</span>
            </div>
          </div>

          {hovered ? (
            <div className="side-panel-section">
              <div className="side-panel-title">Hovered — {hovered.id}</div>
              <div className="side-panel-row">
                <span className="k">Hostname</span>
                <span className="v mono">{hovered.hostname}</span>
              </div>
              <div className="side-panel-row">
                <span className="k">Model</span>
                <span className="v">{hovered.vendor} {hovered.model}</span>
              </div>
              <div className="side-panel-row">
                <span className="k">RU</span>
                <span className="v mono">
                  U{hovered.ruStart}–U{hovered.ruStart + hovered.ruHeight - 1}
                </span>
              </div>
              <div className="side-panel-row">
                <span className="k">Therm</span>
                <span className="v mono" style={{ color: hovered.thermalC >= 85 ? "var(--danger)" : "var(--text)" }}>
                  {hovered.thermalC}°C
                </span>
              </div>
              <div className="side-panel-row">
                <span className="k">Power</span>
                <span className="v mono">{hovered.powerW} W</span>
              </div>
              <div className="side-panel-row">
                <span className="k">Owner</span>
                <span className="v mono">{engineerById(hovered.owner)?.initials}</span>
              </div>
            </div>
          ) : (
            <div className="side-panel-section">
              <div className="side-panel-title">Hover a slot</div>
              <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                Hover any populated slot to see its server details. Click for full inventory record.
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </main>
  );
}

function RackCard({
  rack,
  onSelect,
  selected,
  onHoverServer,
  view,
  servers,
}: {
  rack: Rack;
  onSelect: () => void;
  selected: boolean;
  onHoverServer: (s: ServerNode | null) => void;
  view: ViewMode;
  servers: ServerNode[];
}) {
  const rackServers = servers.filter((s) => s.rack === rack.id);

  // Build a map of RU number -> server (the bottom RU of the server)
  const ruMap = new Map<number, ServerNode>();
  for (const s of rackServers) {
    for (let i = 0; i < s.ruHeight; i++) ruMap.set(s.ruStart + i, s);
  }

  const ruList = Array.from({ length: rack.height }, (_, i) => i + 1);
  const tone = rack.utilizationPct > 85 ? "crit" : rack.utilizationPct > 70 ? "warn" : "ok";

  return (
    <div
      className="rack-card"
      onClick={onSelect}
      style={{ outline: selected ? "1px solid var(--accent)" : undefined }}
    >
      <div className="rack-head">
        <span className="rack-id">{rack.id}</span>
        <span className="rack-util mono">{rack.utilizationPct}%</span>
      </div>

      <div className="rack-body">
        {ruList.map((ru) => {
          const sv = ruMap.get(ru);
          if (!sv) {
            return (
              <div key={ru} className="rack-slot empty">
                <span className="ru-no">{ru}</span>
                <span className="ru-name">—</span>
                <span className="ru-temp"></span>
              </div>
            );
          }
          const isBottom = sv.ruStart === ru;
          const state = stateForServer(sv);
          const overlayColor =
            view === "thermal" && sv.status !== "offline" && sv.status !== "maintenance"
              ? thermalToColor(sv.thermalC)
              : view === "power"
              ? powerToColor(sv.powerW, 2400)
              : undefined;
          return (
            <div
              key={ru}
              className={`rack-slot occupied state-${state}`}
              style={overlayColor ? { background: overlayColor } : undefined}
              onMouseEnter={() => onHoverServer(sv)}
              onMouseLeave={() => onHoverServer(null)}
              title={`${sv.id} · ${sv.hostname}`}
            >
              <span className="ru-no">{ru}</span>
              <span className="ru-name">{isBottom ? sv.hostname : ""}</span>
              <span className="ru-temp">
                {isBottom && sv.status !== "offline" && sv.status !== "maintenance" ? `${sv.thermalC}°` : ""}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rack-foot">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Power size={11} style={{ color: "var(--text-3)" }} />
          {rack.powerUsedKW.toFixed(1)}/{rack.powerTotalKW.toFixed(1)}
          <span className="label">kW</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Thermometer size={11} style={{ color: "var(--text-3)" }} />
          {rack.intakeC}°/{rack.exhaustC}°
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Chip tone={tone === "crit" ? "danger" : tone === "warn" ? "warning" : "success"}>
            {tone === "crit" ? "high" : tone === "warn" ? "warm" : "ok"}
          </Chip>
        </span>
      </div>
    </div>
  );
}
