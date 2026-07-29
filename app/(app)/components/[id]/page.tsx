import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, GitCompareArrows, Server as ServerIcon, ShieldCheck } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { TimeAgo } from "@/components/ui/TimeAgo";
import {
  getComponent,
  listQualificationsByComponent,
  listInstancesByComponent,
  listPlatforms,
  listRuns,
  listEngineers,
  listServers,
} from "@/lib/db-queries";
import type { QualificationState } from "@/lib/types";

function qualTone(s: QualificationState) {
  return s === "qualified" ? "success"
    : s === "limited" ? "warning"
    : s === "unsupported" ? "danger"
    : s === "pending" ? "info"
    : "neutral";
}

export default async function ComponentDetailPage({ params }: { params: { id: string } }) {
  const c = await getComponent(params.id);
  if (!c) notFound();

  const [quals, instances, allPlatforms, allRuns, engineers, servers] = await Promise.all([
    listQualificationsByComponent(c.id),
    listInstancesByComponent(c.id),
    listPlatforms(),
    listRuns(),
    listEngineers(),
    listServers(),
  ]);
  const platformById = (id: string) => allPlatforms.find((p) => p.id === id);
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const serverById = (id: string) => servers.find((srv) => srv.id === id);

  const installed = instances.filter((i) => i.state === "installed");
  const rma = instances.filter((i) => i.state === "rma");
  const stock = instances.filter((i) => i.state === "in_stock");

  // Runs that mention this component in manifest
  const runs = allRuns.filter(
    (r) => r.componentManifest?.some((m) => m.componentId === c.id),
  );

  return (
    <main className="page">
      <div style={{ marginBottom: 8 }}>
        <Link href="/components" className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          <ArrowLeft size={12} />
          Back to catalog
        </Link>
      </div>

      <PageHead
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Chip tone="outline">{c.kind}</Chip>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</span>
            {c.version && (
              <span className="mono" style={{ color: "var(--text-2)", fontSize: 13 }}>
                {c.version}
              </span>
            )}
          </div>
        }
        meta={
          <>
            <span>{c.vendor}</span>
            {c.partNumber && (
              <>
                <span style={{ color: "var(--text-3)" }}>·</span>
                <span className="mono">{c.partNumber}</span>
              </>
            )}
            {c.tdpW && (
              <>
                <span style={{ color: "var(--text-3)" }}>·</span>
                <span className="mono">{c.tdpW} W TDP</span>
              </>
            )}
            {c.releasedISO && (
              <>
                <span style={{ color: "var(--text-3)" }}>·</span>
                <span>released <TimeAgo iso={c.releasedISO} /></span>
              </>
            )}
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 12 }}>
        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Surface
            flush
            title={
              <>
                <GitCompareArrows size={13} />
                Qualifications
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {quals.length} platforms
                </span>
              </>
            }
          >
            {quals.length === 0 ? (
              <div className="empty">No qualifications recorded.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>State</th>
                    <th>Signed off</th>
                    <th>Runs</th>
                    <th>Limitations</th>
                  </tr>
                </thead>
                <tbody>
                  {quals.map((qq) => {
                    const platform = platformById(qq.platformId);
                    const signedBy = qq.signedOffByEngineerId
                      ? engineerById(qq.signedOffByEngineerId)
                      : undefined;
                    return (
                      <tr key={qq.id}>
                        <td>
                          <Link href={`/platforms/${qq.platformId}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                            <span style={{ fontWeight: 500 }}>{platform?.name ?? qq.platformId}</span>
                            {platform?.family && (
                              <span className="mono" style={{ marginLeft: 6, color: "var(--text-3)", fontSize: 10.5 }}>
                                {platform.vendor}
                              </span>
                            )}
                          </Link>
                        </td>
                        <td>
                          <Chip tone={qualTone(qq.state)}>{qq.state}</Chip>
                        </td>
                        <td>
                          {signedBy ? (
                            <span style={{ fontSize: 11.5 }}>
                              {signedBy.initials}
                              {qq.signedOffISO && (
                                <span className="mono" style={{ marginLeft: 6, color: "var(--text-3)", fontSize: 10.5 }}>
                                  <TimeAgo iso={qq.signedOffISO} />
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="mono" style={{ color: "var(--text-3)" }}>—</span>
                          )}
                        </td>
                        <td className="num">{qq.supportingRunIds.length}</td>
                        <td style={{ color: "var(--text-3)", fontSize: 11.5, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis" }}>
                          {qq.limitations ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Surface>

          <Surface
            flush
            title={
              <>
                <ShieldCheck size={13} />
                Validation runs that exercised this component
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {runs.length} runs
                </span>
              </>
            }
          >
            {runs.length === 0 ? (
              <div className="empty">No runs recorded with manifest including this component.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Run</th>
                    <th>Type</th>
                    <th>Server</th>
                    <th>Platform</th>
                    <th>Result</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    const platform = r.platformId ? platformById(r.platformId) : undefined;
                    return (
                      <tr key={r.id}>
                        <td className="id-cell">
                          <Link href={`/qualifications`} style={{ color: "inherit", textDecoration: "none" }}>
                            {r.id}
                          </Link>
                        </td>
                        <td><Chip tone="outline">{r.type}</Chip></td>
                        <td className="mono" style={{ color: "var(--text-2)" }}>{r.serverId}</td>
                        <td style={{ fontSize: 11.5, color: "var(--text-2)" }}>{platform?.name ?? "—"}</td>
                        <td>
                          <Chip tone={r.result === "pass" ? "success" : r.result === "fail" ? "danger" : r.result === "partial" ? "warning" : "info"}>
                            {r.result}
                          </Chip>
                        </td>
                        <td className="mono" style={{ color: "var(--text-3)" }}>
                          <TimeAgo iso={r.startedISO} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Surface>

          {instances.length > 0 && (
            <Surface
              flush
              title={
                <>
                  <ServerIcon size={13} />
                  Physical instances in the lab
                  <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                    {installed.length} installed · {stock.length} in stock · {rma.length} in RMA
                  </span>
                </>
              }
            >
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Serial</th>
                    <th>State</th>
                    <th>Location</th>
                    <th>Slot</th>
                    <th>Received</th>
                    <th>Installed</th>
                  </tr>
                </thead>
                <tbody>
                  {instances.map((i) => {
                    const server = i.currentServerId ? serverById(i.currentServerId) : undefined;
                    return (
                      <tr key={i.id}>
                        <td className="mono" style={{ fontSize: 11 }}>{i.serial}</td>
                        <td>
                          <Chip tone={
                            i.state === "installed" ? "success" :
                            i.state === "in_stock" ? "info" :
                            i.state === "rma" ? "danger" : "neutral"
                          }>
                            {i.state.replace("_", " ")}
                          </Chip>
                        </td>
                        <td className="mono" style={{ color: "var(--text-2)", fontSize: 11.5 }}>
                          {server ? (
                            <Link href={`/inventory/${server.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                              {server.id}
                            </Link>
                          ) : "—"}
                        </td>
                        <td className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>{i.slot ?? "—"}</td>
                        <td className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                          <TimeAgo iso={i.receivedISO} />
                        </td>
                        <td className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                          {i.installedAtISO ? <TimeAgo iso={i.installedAtISO} /> : "—"}
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
            <div className="side-panel-title">Identity</div>
            <div className="side-panel-row"><span className="k">ID</span><span className="v mono">{c.id}</span></div>
            <div className="side-panel-row"><span className="k">Kind</span><span className="v mono">{c.kind}</span></div>
            <div className="side-panel-row"><span className="k">Vendor</span><span className="v">{c.vendor}</span></div>
            <div className="side-panel-row"><span className="k">Name</span><span className="v">{c.name}</span></div>
            {c.shortName && c.shortName !== c.name && (
              <div className="side-panel-row"><span className="k">Short</span><span className="v mono">{c.shortName}</span></div>
            )}
            {c.partNumber && (
              <div className="side-panel-row"><span className="k">P/N</span><span className="v mono">{c.partNumber}</span></div>
            )}
            {c.version && (
              <div className="side-panel-row"><span className="k">Version</span><span className="v mono">{c.version}</span></div>
            )}
            {c.tdpW && (
              <div className="side-panel-row"><span className="k">TDP</span><span className="v mono">{c.tdpW} W</span></div>
            )}
            {c.releasedISO && (
              <div className="side-panel-row">
                <span className="k">Released</span>
                <TimeAgo iso={c.releasedISO} className="v mono" />
              </div>
            )}
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Qualification rollup</div>
            <div className="side-panel-row"><span className="k">Total</span><span className="v mono">{quals.length}</span></div>
            <div className="side-panel-row"><span className="k">Qualified</span><span className="v mono" style={{ color: "var(--success)" }}>{quals.filter((qq) => qq.state === "qualified").length}</span></div>
            <div className="side-panel-row"><span className="k">Limited</span><span className="v mono" style={{ color: "var(--warning)" }}>{quals.filter((qq) => qq.state === "limited").length}</span></div>
            <div className="side-panel-row"><span className="k">Pending</span><span className="v mono" style={{ color: "var(--info)" }}>{quals.filter((qq) => qq.state === "pending").length}</span></div>
            <div className="side-panel-row"><span className="k">Unsupported</span><span className="v mono" style={{ color: "var(--danger)" }}>{quals.filter((qq) => qq.state === "unsupported").length}</span></div>
          </div>

          {c.notes && (
            <div className="side-panel-section">
              <div className="side-panel-title">Notes</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
                {c.notes}
              </div>
            </div>
          )}

          <div className="side-panel-section">
            <div className="side-panel-title">Cross-links</div>
            <Link href="/compatibility" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent-2)", textDecoration: "none", padding: "4px 0" }}>
              <ExternalLink size={11} />
              View in compatibility matrix
            </Link>
            <Link href="/qualifications" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent-2)", textDecoration: "none", padding: "4px 0" }}>
              <ExternalLink size={11} />
              Open qualification campaigns
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
