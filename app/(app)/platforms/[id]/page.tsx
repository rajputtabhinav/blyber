import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Cpu, Droplet, Server as ServerIcon, ShieldCheck } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { KPI } from "@/components/ui/KPI";
import { TimeAgo } from "@/components/ui/TimeAgo";
import {
  getPlatform,
  listQualificationsByPlatform,
  listServers,
  listCampaigns,
  listComponents,
  listEngineers,
} from "@/lib/db-queries";
import { derivePlatformId } from "@/lib/data";
import type { QualificationState } from "@/lib/types";

function qualTone(s: QualificationState) {
  return s === "qualified" ? "success"
    : s === "limited" ? "warning"
    : s === "unsupported" ? "danger"
    : s === "pending" ? "info"
    : "neutral";
}

export default async function PlatformDetailPage({ params }: { params: { id: string } }) {
  const p = await getPlatform(params.id);
  if (!p) notFound();

  const [quals, allServers, allCampaigns, catalog, engineers] = await Promise.all([
    listQualificationsByPlatform(p.id),
    listServers(),
    listCampaigns(),
    listComponents(),
    listEngineers(),
  ]);
  const componentById = (id: string) => catalog.find((c) => c.id === id);
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const chassis = allServers.filter((s) => derivePlatformId(s) === p.id);
  const platformCampaigns = allCampaigns.filter((c) => c.platformId === p.id);

  // Group qualifications by component kind
  const qualsByKind: Record<string, typeof quals> = {};
  for (const q of quals) {
    const c = componentById(q.componentId);
    if (!c) continue;
    (qualsByKind[c.kind] ??= []).push(q);
  }

  return (
    <main className="page">
      <div style={{ marginBottom: 8 }}>
        <Link href="/platforms" className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          <ArrowLeft size={12} />
          Back to platforms
        </Link>
      </div>

      <PageHead
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Cpu size={16} style={{ color: "var(--text-2)" }} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</span>
            {p.family && (
              <Chip tone="teal">{p.family}</Chip>
            )}
            {p.cooling === "liquid" && (
              <Chip tone="info" mono>
                <Droplet size={11} style={{ marginRight: 3 }} />
                liquid-cooled
              </Chip>
            )}
          </div>
        }
        meta={
          <>
            <span>{p.vendor}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{p.generation}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{p.ruHeight === 0 ? "desktop" : `${p.ruHeight}U`}</span>
          </>
        }
      />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
        <KPI label="Chassis in lab" value={chassis.length} foot={chassis.length === 0 ? "none yet" : "in inventory"} />
        <KPI
          label="Qualified components"
          value={<span style={{ color: "var(--success)" }}>{quals.filter((q) => q.state === "qualified").length}</span>}
          foot={`of ${quals.length} tracked`}
        />
        <KPI
          label="Limited / pending"
          value={
            <>
              <span style={{ color: "var(--warning)" }}>{quals.filter((q) => q.state === "limited").length}</span>
              <span style={{ color: "var(--text-3)", margin: "0 4px" }}>/</span>
              <span style={{ color: "var(--info)" }}>{quals.filter((q) => q.state === "pending").length}</span>
            </>
          }
          foot="limited / pending"
        />
        <KPI label="Active campaigns" value={platformCampaigns.filter((c) => c.status === "active").length} foot={`${platformCampaigns.length} total`} />
        <KPI label="Max draw" value={p.maxPsuW ? `${(p.maxPsuW / 1000).toFixed(1)} kW` : "—"} foot="PSU budget" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 12 }}>
        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Surface
            flush
            title={
              <>
                <ShieldCheck size={13} />
                Qualified components
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  grouped by kind
                </span>
              </>
            }
          >
            {Object.keys(qualsByKind).length === 0 ? (
              <div className="empty">No qualifications recorded for this platform yet.</div>
            ) : (
              <div>
                {Object.entries(qualsByKind).map(([kind, list]) => (
                  <div key={kind} style={{ borderBottom: "1px solid var(--border)" }}>
                    <div
                      style={{
                        padding: "6px 12px",
                        background: "rgba(255,255,255,0.012)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span className="label-mono" style={{ color: "var(--text-2)" }}>
                        {kind}
                      </span>
                      <span className="mono" style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 11 }}>
                        {list.length}
                      </span>
                    </div>
                    {list.map((qq) => {
                      const c = componentById(qq.componentId);
                      return (
                        <div
                          key={qq.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1fr) 90px 90px",
                            gap: 10,
                            padding: "7px 12px",
                            borderTop: "1px solid var(--border)",
                            fontSize: 12,
                            alignItems: "center",
                          }}
                          className="hover-row"
                        >
                          <Link href={`/components/${qq.componentId}`} style={{ color: "var(--text)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c?.name ?? qq.componentId}
                            {c?.version && (
                              <span className="mono" style={{ marginLeft: 6, color: "var(--text-3)", fontSize: 10.5 }}>
                                {c.version}
                              </span>
                            )}
                          </Link>
                          <Chip tone={qualTone(qq.state)}>{qq.state}</Chip>
                          <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5, textAlign: "right" }}>
                            {qq.signedOffISO ? <TimeAgo iso={qq.signedOffISO} /> : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </Surface>

          {chassis.length > 0 && (
            <Surface
              flush
              title={
                <>
                  <ServerIcon size={13} />
                  Lab chassis on this platform
                  <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                    {chassis.length} units
                  </span>
                </>
              }
            >
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hostname</th>
                    <th>Rack</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Therm</th>
                    <th>Last boot</th>
                  </tr>
                </thead>
                <tbody>
                  {chassis.map((s) => (
                    <tr key={s.id}>
                      <td className="id-cell">
                        <Link href={`/inventory/${s.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {s.id}
                        </Link>
                      </td>
                      <td className="mono" style={{ fontSize: 11.5 }}>{s.hostname}</td>
                      <td className="mono" style={{ color: "var(--text-2)" }}>{s.rack}</td>
                      <td>
                        <Chip tone={
                          s.status === "online" ? "success" :
                          s.status === "validating" ? "info" :
                          s.status === "fault" ? "danger" :
                          s.status === "maintenance" ? "warning" : "neutral"
                        }>
                          {s.status}
                        </Chip>
                      </td>
                      <td className="num">{s.thermalC ? `${s.thermalC}°C` : "—"}</td>
                      <td className="mono" style={{ color: "var(--text-3)" }}>
                        <TimeAgo iso={s.lastBootISO} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Surface>
          )}

          {platformCampaigns.length > 0 && (
            <Surface
              flush
              title={
                <>
                  <ShieldCheck size={13} />
                  Campaigns
                  <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                    {platformCampaigns.length}
                  </span>
                </>
              }
            >
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {platformCampaigns.map((c) => {
                    const owner = engineerById(c.ownerEngineerId);
                    return (
                      <tr key={c.id}>
                        <td className="id-cell">
                          <Link href={`/qualifications/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                            {c.id}
                          </Link>
                        </td>
                        <td>{c.name}</td>
                        <td>
                          <Chip tone={
                            c.status === "active" ? "info" :
                            c.status === "passed" ? "success" :
                            c.status === "failed" ? "danger" :
                            c.status === "blocked" ? "danger" :
                            c.status === "planning" ? "neutral" : "neutral"
                          }>
                            {c.status}
                          </Chip>
                        </td>
                        <td style={{ fontSize: 11.5 }}>{owner?.initials}</td>
                        <td className="mono" style={{ color: "var(--text-3)" }}>
                          {c.targetCompletionISO ? <TimeAgo iso={c.targetCompletionISO} /> : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Surface>
          )}
        </div>

        {/* SIDE */}
        <div className="side-panel" style={{ alignSelf: "start", position: "sticky", top: 60 }}>
          <div className="side-panel-section">
            <div className="side-panel-title">Specs</div>
            <div className="side-panel-row"><span className="k">ID</span><span className="v mono">{p.id}</span></div>
            <div className="side-panel-row"><span className="k">Vendor</span><span className="v">{p.vendor}</span></div>
            {p.family && <div className="side-panel-row"><span className="k">Family</span><span className="v">{p.family}</span></div>}
            <div className="side-panel-row"><span className="k">Generation</span><span className="v mono">{p.generation}</span></div>
            <div className="side-panel-row"><span className="k">Form factor</span><span className="v mono">{p.ruHeight === 0 ? "desktop" : `${p.ruHeight}U`}</span></div>
            <div className="side-panel-row"><span className="k">Cooling</span><span className="v mono">{p.cooling}</span></div>
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Capacity</div>
            <div className="side-panel-row"><span className="k">Sockets</span><span className="v mono">{p.socketCount}</span></div>
            <div className="side-panel-row"><span className="k">DIMM slots</span><span className="v mono">{p.maxDimms}</span></div>
            <div className="side-panel-row"><span className="k">GPU slots</span><span className="v mono">{p.maxGpus}</span></div>
            {p.maxPsuW && (
              <div className="side-panel-row"><span className="k">PSU budget</span><span className="v mono">{p.maxPsuW} W</span></div>
            )}
            {p.defaultBiosFamily && (
              <div className="side-panel-row"><span className="k">BIOS family</span><span className="v mono" style={{ fontSize: 11 }}>{p.defaultBiosFamily}</span></div>
            )}
          </div>

          {p.notes && (
            <div className="side-panel-section">
              <div className="side-panel-title">Notes</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
                {p.notes}
              </div>
            </div>
          )}

          <div className="side-panel-section">
            <div className="side-panel-title">Quick links</div>
            <Link href={`/compatibility?platform=${p.id}`} style={{ display: "block", fontSize: 12, color: "var(--accent-2)", textDecoration: "none", padding: "3px 0" }}>
              ↗ Compatibility matrix slice
            </Link>
            <Link href="/qualifications" style={{ display: "block", fontSize: 12, color: "var(--accent-2)", textDecoration: "none", padding: "3px 0" }}>
              ↗ Open campaigns
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
