import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CircleAlert,
  Cpu,
  GitBranch,
  Server as ServerIcon,
  Thermometer,
} from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip, SevDot } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { KPI } from "@/components/ui/KPI";
import { FadeIn, Stagger, StaggerItem, PulseDot } from "@/components/ui/motion";
import { Sparkline } from "@/components/ui/Sparkline";
import { LiveTicker } from "@/components/shell/LiveTicker";
import { TimeAgo } from "@/components/ui/TimeAgo";

// Deterministic 7-day series for each KPI
function series(seed: string, len: number, base: number, jitter: number, drift = 0): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const r = (h & 0xffff) / 0xffff;
    out.push(base + (r - 0.5) * 2 * jitter + (drift * i) / len);
  }
  return out;
}
import {
  listEngineers,
  listRacks,
  listServers,
  listTickets,
  listFirmware,
} from "@/lib/db-queries";

export default async function DashboardPage() {
  const [engineers, racks, servers, tickets, firmware] = await Promise.all([
    listEngineers(),
    listRacks(),
    listServers(),
    listTickets(),
    listFirmware(),
  ]);
  const engineerById = (id: string) => engineers.find((e) => e.id === id);

  const activeTickets = tickets.filter(
    (t) => t.status !== "resolved" && t.status !== "closed",
  ).length;
  const criticalAlerts = tickets.filter((t) => t.severity === "critical").length;
  const onlineServers = servers.filter(
    (s) => s.status === "online" || s.status === "validating",
  ).length;
  const totalRU = racks.reduce((sum, r) => sum + r.height, 0);
  const usedRU = Math.round(
    racks.reduce((s, r) => s + (r.utilizationPct / 100) * r.height, 0),
  );
  const utilPct = totalRU > 0 ? Math.round((usedRU / totalRU) * 100) : 0;
  const criticalFw = firmware.filter((f) => f.state === "critical").length;
  return (
    <main className="page">
      <FadeIn>
        <PageHead
          title="Dashboard"
          meta={
            <>
              <span className="mono">14 active</span>
              <span style={{ color: "var(--text-3)" }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <PulseDot color="var(--danger)" size={6} />
                <span className="mono" style={{ color: "var(--danger)" }}>
                  2 critical
                </span>
              </span>
              <span style={{ color: "var(--text-3)" }}>·</span>
              <span className="mono">Last sync 2m ago</span>
            </>
          }
          actions={
            <>
              <Link href="/tickets" className="btn btn-ghost">
                Tickets
              </Link>
              <Link href="/reports" className="btn">
                Validation runs
              </Link>
            </>
          }
        />
      </FadeIn>

      {/* Row 1 — KPIs */}
      <Stagger
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <StaggerItem>
          <KPI
            label="Active Tickets"
            value={activeTickets}
            delta={{ dir: "up", value: "+3" }}
            foot={<Sparkline values={series("at", 24, 12, 3, 2)} stroke="var(--accent-2)" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KPI
            label="Critical Alerts"
            value={
              <span style={{ color: "var(--danger)" }}>{criticalAlerts}</span>
            }
            delta={{ dir: "up", value: "+1" }}
            foot={<Sparkline values={series("ca", 24, 1.4, 0.8, 0.6)} stroke="var(--danger)" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KPI
            label="Servers Online"
            value={`${onlineServers}/${servers.length}`}
            delta={{ dir: "flat", value: "0" }}
            foot={<Sparkline values={series("on", 24, 20, 1)} stroke="var(--success)" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KPI
            label="Rack Utilization"
            value={`${utilPct}%`}
            delta={{ dir: "up", value: "+4" }}
            foot={<Sparkline values={series("ru", 24, utilPct, 6, 3)} stroke="var(--info)" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KPI
            label="MTTR (7d)"
            value="3.4h"
            delta={{ dir: "down", value: "-0.6h" }}
            foot={<Sparkline values={series("mt", 24, 3.6, 0.7, -0.4)} stroke="var(--teal)" />}
          />
        </StaggerItem>
        <StaggerItem>
          <KPI
            label="Validation Pass"
            value="86%"
            delta={{ dir: "up", value: "+2.1" }}
            foot={<Sparkline values={series("vp", 24, 84, 5, 3)} stroke="var(--success)" />}
          />
        </StaggerItem>
      </Stagger>

      {/* Row 2 — Alerts + Activity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <Surface
          flush
          title={
            <>
              <CircleAlert size={14} style={{ color: "var(--danger)" }} />
              Critical alerts feed
            </>
          }
          actions={
            <Link href="/tickets?sev=critical" className="btn btn-ghost" style={{ padding: "3px 8px" }}>
              View all <ArrowUpRight size={12} />
            </Link>
          }
        >
          <Stagger>
            {tickets
              .filter((t) => t.severity === "critical" || t.slaState === "err")
              .slice(0, 7)
              .map((t) => (
                <StaggerItem key={t.id}>
                  <Link
                    href={`/tickets/${t.id}`}
                    className="alert-row"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {t.severity === "critical" ? (
                      <PulseDot color="var(--danger)" size={8} />
                    ) : (
                      <SevDot severity={t.severity} />
                    )}
                    <span className="src">{t.id}</span>
                    <span className="msg">{t.title}</span>
                    <TimeAgo iso={t.updatedISO} className="t" />
                  </Link>
                </StaggerItem>
              ))}
          </Stagger>
        </Surface>

        <LiveTicker />
      </div>

      {/* Row 3 — Racks + Engineer workload + Compat warnings + Inventory shortages */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr)",
          gap: 10,
        }}
      >
        <Surface
          flush
          title={
            <>
              <ServerIcon size={14} style={{ color: "var(--text-2)" }} />
              Rack overview
            </>
          }
          actions={
            <Link href="/racks" className="btn btn-ghost" style={{ padding: "3px 8px" }}>
              View all <ArrowUpRight size={12} />
            </Link>
          }
        >
          <Stagger style={{ padding: 10, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            {racks.slice(0, 6).map((r) => {
              const tone =
                r.utilizationPct > 85 ? "crit" : r.utilizationPct > 70 ? "warn" : "ok";
              return (
                <StaggerItem key={r.id} style={{ minWidth: 0 }}>
                <Link
                  href="/racks"
                  style={{
                    display: "block",
                    padding: 10,
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.025)",
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>
                      {r.id}
                    </span>
                    <span style={{ marginLeft: "auto" }} className="mono">
                      {r.utilizationPct}%
                    </span>
                  </div>
                  <div className="bar" style={{ marginTop: 6 }}>
                    <div
                      className={"bar-fill " + tone}
                      style={{ width: `${r.utilizationPct}%` }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10.5,
                      color: "var(--text-3)",
                    }}
                    className="mono"
                  >
                    <span>{r.powerUsedKW.toFixed(1)} / {r.powerTotalKW.toFixed(1)} kW</span>
                    <span>↓{r.intakeC}° / ↑{r.exhaustC}°</span>
                  </div>
                </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Surface>

        <Surface
          flush
          title={
            <>
              <GitBranch size={14} style={{ color: "var(--text-2)" }} />
              Engineer workload
            </>
          }
          actions={
            <Link href="/engineers" className="btn btn-ghost" style={{ padding: "3px 8px" }}>
              Open <ArrowUpRight size={12} />
            </Link>
          }
        >
          <div>
            {engineers
              .slice()
              .sort((a, b) => b.workload - a.workload)
              .slice(0, 7)
              .map((e) => {
                const tone = e.workload > 80 ? "crit" : e.workload > 60 ? "warn" : "ok";
                return (
                  <div
                    key={e.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "22px minmax(0, 1fr) 60px 36px",
                      gap: 8,
                      alignItems: "center",
                      padding: "7px 12px",
                      borderBottom: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  >
                    <Avatar name={e.name} size="sm" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: "var(--text)" }}>{e.name}</div>
                      <div style={{ fontSize: 10.5, color: "var(--text-3)" }} className="mono">
                        {e.team} · {e.activeTickets} open
                      </div>
                    </div>
                    <div className="bar">
                      <div className={"bar-fill " + tone} style={{ width: `${e.workload}%` }} />
                    </div>
                    <span className="mono" style={{ textAlign: "right", fontSize: 11.5, color: "var(--text-2)" }}>
                      {e.workload}%
                    </span>
                  </div>
                );
              })}
          </div>
        </Surface>

        <Surface
          flush
          title={
            <>
              <Cpu size={14} style={{ color: "var(--text-2)" }} />
              Compatibility + firmware
            </>
          }
        >
          <div style={{ padding: 12 }}>
            <div className="banner banner-danger" style={{ marginBottom: 10 }}>
              <AlertTriangle size={14} />
              <span>
                {criticalFw} firmware update
                {criticalFw !== 1 ? "s" : ""} marked critical
              </span>
            </div>

            <div className="label-mono" style={{ marginBottom: 6 }}>
              Top compatibility gaps
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { name: "MI300X × Lenovo SR650 V3", state: "untested" as const },
                { name: "ConnectX-7 × Supermicro X12", state: "pending" as const },
                { name: "PM1743 E3.S × Cisco C240 M7", state: "pending" as const },
                { name: "PERC H965i × HPE / Lenovo", state: "crit" as const },
                { name: "DDR4-3200 × R760 16G", state: "crit" as const },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                  }}
                >
                  <span style={{ flex: 1, color: "var(--text)" }}>{c.name}</span>
                  <Chip tone={c.state === "crit" ? "danger" : c.state === "pending" ? "info" : "neutral"}>
                    {c.state}
                  </Chip>
                </div>
              ))}
            </div>

            <div className="label-mono" style={{ marginTop: 14, marginBottom: 6 }}>
              Inventory shortages
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Thermometer size={12} style={{ color: "var(--warning)" }} />
                <span style={{ flex: 1 }}>32GB DDR5-4800 RDIMM</span>
                <span className="mono" style={{ color: "var(--warning)" }}>
                  6 / 24
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Thermometer size={12} style={{ color: "var(--warning)" }} />
                <span style={{ flex: 1 }}>HPE Gen10 fan tray (875937-001)</span>
                <span className="mono" style={{ color: "var(--warning)" }}>
                  2 / 8
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Thermometer size={12} style={{ color: "var(--text-3)" }} />
                <span style={{ flex: 1 }}>QSFP-DD 400G transceivers</span>
                <span className="mono" style={{ color: "var(--text-2)" }}>
                  11 / 20
                </span>
              </div>
            </div>
          </div>
        </Surface>
      </div>

      <div style={{ marginTop: 18, fontSize: 11, color: "var(--text-3)", display: "flex", gap: 14 }}>
        <span className="mono">build 2026.05.18-r3</span>
        <span style={{ color: "var(--border-strong)" }}>·</span>
        <span className="mono">connected — 24 nodes</span>
        <span style={{ color: "var(--border-strong)" }}>·</span>
        <span className="mono" style={{ color: "var(--success)" }}>
          stream healthy
        </span>
        <span style={{ marginLeft: "auto" }} className="mono">
          {engineerById("eng-01")?.name} · IST 14:08
        </span>
      </div>
    </main>
  );
}
