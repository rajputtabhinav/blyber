import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Power,
  RefreshCw,
  Server as ServerIcon,
  Terminal,
  Thermometer,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { KPI } from "@/components/ui/KPI";
import {
  getServer,
  listEngineers,
  listTicketsByServer,
  listRunsByServer,
  listRmaByServer,
  listFirmware,
  listInstancesByServer,
  listComponents,
  listPlatforms,
} from "@/lib/db-queries";
import { derivePlatformId } from "@/lib/data";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { ServerStatus } from "@/lib/types";
import { Sparkline } from "@/components/ui/Sparkline";
import { TimeSeriesChart } from "@/components/ui/TimeSeriesChart";

function statusTone(s: ServerStatus) {
  return s === "online"
    ? "success"
    : s === "validating"
    ? "info"
    : s === "fault"
    ? "danger"
    : s === "maintenance"
    ? "warning"
    : "neutral";
}

// Deterministic pseudo-random for stable per-server series
function seedSeries(seed: string, length: number, base: number, jitter: number): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    h = (h * 1664525 + 1013904223) >>> 0;
    const r = (h & 0xffff) / 0xffff;
    out.push(base + (r - 0.5) * 2 * jitter);
  }
  return out;
}

export default async function ServerDetailPage({ params }: { params: { id: string } }) {
  const server = await getServer(params.id);
  if (!server) notFound();

  const [engineers, relatedTickets, relatedRuns, relatedRMA, firmware, bom, catalog, allPlatforms] =
    await Promise.all([
      listEngineers(),
      listTicketsByServer(server.id),
      listRunsByServer(server.id),
      listRmaByServer(server.id),
      listFirmware(),
      listInstancesByServer(server.id),
      listComponents(),
      listPlatforms(),
    ]);
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const componentById = (id: string) => catalog.find((c) => c.id === id);
  const platformById = (id: string) => allPlatforms.find((p) => p.id === id);
  const instancesByServer = () => bom;

  const owner = engineerById(server.owner);
  const biosFw = firmware.find((f) =>
    server.vendor === "Dell"
      ? f.name.includes(server.model.split(" ").slice(-1)[0])
      : f.name.includes(server.vendor),
  );

  const thermSeries = seedSeries(server.id + ":therm", 96, server.thermalC, 4);
  const powerSeries = seedSeries(server.id + ":power", 96, server.powerW, 60);

  return (
    <main className="page">
      <div style={{ marginBottom: 8 }}>
        <Link href="/inventory" className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          <ArrowLeft size={12} />
          Back to inventory
        </Link>
      </div>

      <PageHead
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <ServerIcon size={16} style={{ color: "var(--text-2)" }} />
            <span className="mono" style={{ fontSize: 16 }}>{server.id}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span style={{ fontWeight: 600 }}>{server.hostname}</span>
            <Chip tone={statusTone(server.status)} mono>{server.status}</Chip>
          </div>
        }
        meta={
          <>
            <span>{server.vendor} {server.model} ({server.generation})</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{server.rack} · U{server.ruStart}–U{server.ruStart + server.ruHeight - 1}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span>owner</span>
            <Avatar name={owner?.name ?? "??"} size="sm" />
            <span>{owner?.name}</span>
          </>
        }
        actions={
          <>
            <button className="btn"><RefreshCw size={13} />Refresh</button>
            <button className="btn"><Terminal size={13} />Open SSH</button>
            <button className="btn btn-primary"><Wrench size={13} />Open ticket</button>
          </>
        }
      />

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <KPI
          label="Thermal"
          value={
            <span style={{ color: server.thermalC >= 85 ? "var(--danger)" : "var(--text)" }}>
              {server.thermalC}°C
            </span>
          }
          foot={<Sparkline values={thermSeries} stroke="var(--warning)" />}
        />
        <KPI
          label="Power"
          value={`${server.powerW} W`}
          foot={<Sparkline values={powerSeries} stroke="var(--info)" />}
        />
        <KPI label="Uptime" value={`${server.uptimeDays}d`} foot={<>last boot <TimeAgo iso={server.lastBootISO} /></>} />
        <KPI label="Open tickets" value={relatedTickets.filter((t) => t.status !== "resolved" && t.status !== "closed").length} foot={`${relatedTickets.length} lifetime`} />
        <KPI label="Validation runs" value={relatedRuns.length} foot={`${relatedRuns.filter((r) => r.result === "pass").length} pass / ${relatedRuns.filter((r) => r.result === "fail").length} fail`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 12 }}>
        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Surface
            title={
              <>
                <Thermometer size={13} style={{ color: "var(--warning)" }} />
                Thermal · last 24h
              </>
            }
            actions={
              <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                15-min granularity · {thermSeries.length} pts
              </span>
            }
          >
            <TimeSeriesChart
              values={thermSeries}
              unit="°C"
              warningAt={80}
              dangerAt={85}
              height={120}
            />
          </Surface>

          <Surface
            title={
              <>
                <Power size={13} style={{ color: "var(--info)" }} />
                Power draw · last 24h
              </>
            }
            actions={
              <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                psu1+psu2 combined
              </span>
            }
          >
            <TimeSeriesChart
              values={powerSeries}
              unit="W"
              height={120}
              stroke="var(--info)"
            />
          </Surface>

          <Surface flush title="Open tickets">
            {relatedTickets.length === 0 ? (
              <div className="empty">No tickets recorded.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedTickets.map((t) => (
                    <tr key={t.id}>
                      <td className="id-cell">
                        <Link href={`/tickets/${t.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {t.id}
                        </Link>
                      </td>
                      <td style={{ maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.title}
                      </td>
                      <td>
                        <Chip tone={t.severity === "critical" ? "danger" : t.severity === "high" ? "warning" : "neutral"} mono>
                          {t.severity}
                        </Chip>
                      </td>
                      <td><Chip tone="info">{t.status.replace("_", "-")}</Chip></td>
                      <td className="mono" style={{ color: "var(--text-3)" }}>
                        <TimeAgo iso={t.updatedISO} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Surface>

          <Surface flush title="Validation history">
            {relatedRuns.length === 0 ? (
              <div className="empty">No validation runs recorded.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Run</th>
                    <th>Type</th>
                    <th>Result</th>
                    <th style={{ textAlign: "right" }}>Duration</th>
                    <th>Engineer</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedRuns.map((r) => {
                    const eng = engineerById(r.engineerId);
                    return (
                      <tr key={r.id}>
                        <td className="id-cell">{r.id}</td>
                        <td><Chip tone="outline">{r.type}</Chip></td>
                        <td>
                          <Chip
                            tone={
                              r.result === "pass" ? "success" :
                              r.result === "fail" ? "danger" :
                              r.result === "partial" ? "warning" : "info"
                            }
                          >
                            {r.result}
                          </Chip>
                        </td>
                        <td className="num">{r.durationMin}m</td>
                        <td className="mono" style={{ color: "var(--text-2)" }}>{eng?.initials}</td>
                        <td className="mono" style={{ color: "var(--text-3)" }}><TimeAgo iso={r.startedISO} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Surface>
        </div>

        {/* SIDE */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* ---- BOM: serial-tracked instances installed in this chassis ---- */}
          <Surface
            flush
            title={
              <>
                Bill of Materials
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {(() => {
                    const inst = instancesByServer();
                    return `${inst.length} serial-tracked`;
                  })()}
                </span>
              </>
            }
            actions={
              <Link
                href={`/inventory/${server.id}#bom`}
                className="btn btn-ghost"
                style={{ padding: "2px 6px", fontSize: 11 }}
                title="Anchor for hand-off"
              >
                anchor
              </Link>
            }
          >
            {(() => {
              const inst = instancesByServer();
              // Group by component
              const groups = new Map<string, typeof inst>();
              for (const i of inst) {
                const arr = groups.get(i.componentId) ?? [];
                arr.push(i);
                groups.set(i.componentId, arr);
              }
              if (groups.size === 0) {
                return (
                  <div className="empty" style={{ padding: "12px 14px" }}>
                    No serial-tracked instances yet. (Hardware summary below is from the legacy free-text fields.)
                  </div>
                );
              }
              return (
                <div id="bom" style={{ padding: "4px 0" }}>
                  {Array.from(groups.entries()).map(([componentId, list]) => {
                    const c = componentById(componentId);
                    return (
                      <div
                        key={componentId}
                        style={{
                          padding: "8px 14px",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <Chip tone="outline">{c?.kind ?? "?"}</Chip>
                          <Link
                            href={`/components/${componentId}`}
                            style={{ flex: 1, color: "var(--text)", textDecoration: "none", fontWeight: 500, fontSize: 12 }}
                          >
                            {c?.name ?? componentId}
                          </Link>
                          <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>
                            ×{list.length}
                          </span>
                        </div>
                        {c?.partNumber && (
                          <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", marginBottom: 4 }}>
                            P/N {c.partNumber}
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {list.map((i) => (
                            <div
                              key={i.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "70px minmax(0, 1fr) auto",
                                gap: 8,
                                fontSize: 10.5,
                                fontFamily: "var(--font-mono)",
                                color: "var(--text-2)",
                              }}
                            >
                              <span style={{ color: "var(--text-3)" }}>{i.slot ?? "—"}</span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {i.serial}
                              </span>
                              <span
                                style={{
                                  color:
                                    i.state === "installed" ? "var(--success)" :
                                    i.state === "rma" ? "var(--danger)" :
                                    i.state === "in_stock" ? "var(--info)" : "var(--text-3)",
                                }}
                              >
                                {i.state.replace("_", " ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </Surface>

          {/* ---- Platform binding ---- */}
          {(() => {
            const platformId = server.platformId ?? derivePlatformId(server);
            const platform = platformId ? platformById(platformId) : undefined;
            if (!platform) return null;
            return (
              <Surface flush title="Platform">
                <div style={{ padding: "10px 14px" }}>
                  <Row k="ID" v={
                    <Link href={`/platforms/${platform.id}`} style={{ color: "var(--accent-2)", textDecoration: "none" }}>
                      {platform.id}
                    </Link>
                  } />
                  <Row k="Name" v={platform.name} />
                  <Row k="Generation" v={platform.generation} mono />
                  <Row k="Cooling" v={platform.cooling} mono />
                  <Row k="Form factor" v={platform.ruHeight === 0 ? "desktop" : `${platform.ruHeight}U`} mono />
                </div>
              </Surface>
            );
          })()}

          {/* ---- Legacy hardware summary (kept for fallback fields the BOM doesn't cover) ---- */}
          <Surface flush title="Hardware (summary)">
            <div style={{ padding: "10px 14px" }}>
              <Row k="Hostname" v={server.hostname} mono />
              <Row k="Serial" v={server.serial} mono />
              <Row k="Generation" v={server.generation} mono />
              <Row k="CPU" v={server.cpu} small Icon={Cpu} />
              <Row k="Sockets" v={`${server.cpuSockets}`} mono />
              <Row k="Memory" v={server.ramConfig} small Icon={MemoryStick} />
              <Row k="Storage" v={server.storage} small Icon={HardDrive} />
              <Row k="NIC" v={server.nic} small Icon={Network} />
              {server.gpu && <Row k="GPU" v={server.gpu} small />}
            </div>
          </Surface>

          <Surface flush title="Firmware">
            <div style={{ padding: "10px 14px" }}>
              <Row k="BIOS" v={server.biosVersion} mono />
              <Row k="BMC" v={server.bmcVersion} mono />
              {biosFw && (
                <Row
                  k="Latest"
                  v={
                    <span
                      className="mono"
                      style={{
                        color:
                          biosFw.state === "critical" ? "var(--danger)" :
                          biosFw.state === "behind" ? "var(--warning)" : "var(--success)",
                      }}
                    >
                      {biosFw.latestVersion}
                    </span>
                  }
                />
              )}
            </div>
          </Surface>

          <Surface flush title="RMA history">
            {relatedRMA.length === 0 ? (
              <div className="empty">No RMA records.</div>
            ) : (
              <div>
                {relatedRMA.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "8px 14px",
                      borderBottom: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="mono" style={{ fontWeight: 600 }}>{r.id}</span>
                      <Chip tone={r.status === "closed" ? "neutral" : "info"}>{r.status}</Chip>
                      <span className="mono" style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 10.5 }}>
                        {r.daysOpen}d
                      </span>
                    </div>
                    <div style={{ color: "var(--text-2)", marginTop: 3 }}>{r.componentName}</div>
                    <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>{r.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </Surface>

          <Surface flush title="Recent events">
            <div>
              {[
                { t: "2m", txt: "redfish poll: temp 64°C, fans nominal" },
                { t: "23m", txt: "ipmi sel: psu2 ok" },
                { t: "2h", txt: "validation run VR-3091 passed" },
                { t: "6h", txt: "BIOS scan: 2.18.1 (latest)" },
                { t: "1d", txt: "rebooted by eng-02 (BIOS flash)" },
                { t: "3d", txt: "rack repositioned U1 → U3" },
              ].map((e, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px minmax(0, 1fr)",
                    padding: "6px 14px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 11.5,
                  }}
                >
                  <span className="mono" style={{ color: "var(--text-3)" }}>{e.t}</span>
                  <span style={{ color: "var(--text-2)" }}>{e.txt}</span>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </main>
  );
}

function Row({
  k,
  v,
  mono,
  small,
  Icon,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
  small?: boolean;
  Icon?: LucideIcon;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "86px minmax(0, 1fr)",
        gap: 10,
        padding: "5px 0",
        fontSize: small ? 11.5 : 12,
        alignItems: "center",
      }}
    >
      <span
        className="mono"
        style={{ fontSize: 11, color: "var(--text-3)" }}
      >
        {Icon ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon size={11} />
            {k}
          </span>
        ) : (
          k
        )}
      </span>
      <span className={mono ? "mono" : ""} style={{ color: "var(--text)" }}>
        {v}
      </span>
    </div>
  );
}
