import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck, GitBranch, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { RegressionChart } from "@/components/ui/RegressionChart";
import {
  getCampaign,
  listQualifications,
  getComponent,
  getPlatform,
  listEngineers,
  listRuns,
  listServers,
  listTestPlans,
} from "@/lib/db-queries";
import type { CampaignStatus } from "@/lib/types";

function statusTone(s: CampaignStatus) {
  return s === "active" ? "info"
    : s === "passed" ? "success"
    : s === "failed" ? "danger"
    : s === "blocked" ? "danger"
    : s === "planning" ? "neutral"
    : s === "deferred" ? "warning"
    : "neutral";
}

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const c = await getCampaign(params.id);
  if (!c) notFound();

  const [comp, plat, engineers, allRuns, servers, qualifications, allPlans] = await Promise.all([
    getComponent(c.componentId),
    getPlatform(c.platformId),
    listEngineers(),
    listRuns(),
    listServers(),
    listQualifications(),
    listTestPlans(),
  ]);
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const serverById = (id: string) => servers.find((srv) => srv.id === id);
  const testPlanById = (id: string) => allPlans.find((p) => p.id === id);
  const owner = engineerById(c.ownerEngineerId);

  const runs = allRuns.filter((r) => c.runIds.includes(r.id) || r.campaignId === c.id);
  const passRuns = runs.filter((r) => r.result === "pass").length;
  const failRuns = runs.filter((r) => r.result === "fail").length;

  // Regression context: historical runs of any plan referenced by this campaign
  const planIds = c.testPlanIds ?? [];
  const historicalRuns = allRuns.filter((r) => r.testPlanId && planIds.includes(r.testPlanId));
  const headlinePlan = planIds.map((id) => testPlanById(id)).find((p) => p?.acceptance.some((a) => a.severity === "must"));
  const headlineMetric = headlinePlan?.acceptance.find((a) => a.severity === "must");

  // Derived qualifications produced by this campaign
  const producedQuals = qualifications.filter((qq) => qq.campaignId === c.id);

  const isBlocked = c.status === "blocked";
  const isComplete = c.status === "passed" || c.status === "failed";

  return (
    <main className="page">
      <div style={{ marginBottom: 8 }}>
        <Link href="/qualifications" className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          <ArrowLeft size={12} />
          Back to qualifications
        </Link>
      </div>

      <PageHead
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <ShieldCheck size={16} style={{ color: "var(--text-2)" }} />
            <span className="mono" style={{ color: "var(--text-2)", fontSize: 14 }}>
              {c.id}
            </span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</span>
            <Chip tone={statusTone(c.status)} mono>{c.status}</Chip>
          </div>
        }
        meta={
          <>
            <Avatar name={owner?.name ?? "?"} size="sm" />
            <span>{owner?.name}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">opened <TimeAgo iso={c.createdISO} /></span>
            {c.targetCompletionISO && (
              <>
                <span style={{ color: "var(--text-3)" }}>·</span>
                <span className="mono">due <TimeAgo iso={c.targetCompletionISO} /></span>
              </>
            )}
          </>
        }
        actions={
          <>
            {!isComplete && (
              <>
                <button className="btn">
                  <AlertTriangle size={13} />
                  Mark blocked
                </button>
                <button className="btn btn-primary">
                  <CheckCircle2 size={13} />
                  Sign off
                </button>
              </>
            )}
          </>
        }
      />

      {isBlocked && c.notes && (
        <div className="banner banner-danger" style={{ marginBottom: 12 }}>
          <AlertTriangle size={14} />
          <span><strong>Blocked.</strong> {c.notes}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 12 }}>
        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Surface
            title={
              <>
                <FileText size={13} />
                Scope
              </>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12 }}>
              <div>
                <div className="label-mono" style={{ marginBottom: 4 }}>Component under test</div>
                <Link href={`/components/${c.componentId}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                  <Chip tone="outline" className="mr-2">{comp?.kind}</Chip>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{comp?.name ?? c.componentId}</span>
                </Link>
                {comp?.version && (
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-2)", marginTop: 2 }}>
                    version {comp.version}
                  </div>
                )}
                {comp?.partNumber && (
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                    P/N {comp.partNumber}
                  </div>
                )}
              </div>
              <div>
                <div className="label-mono" style={{ marginBottom: 4 }}>Target platform</div>
                <Link href={`/platforms/${c.platformId}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{plat?.name ?? c.platformId}</span>
                </Link>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                  {plat?.vendor} · {plat?.generation}
                </div>
                {plat?.cooling && (
                  <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                    {plat.cooling}-cooled · {plat.ruHeight === 0 ? "desktop" : `${plat.ruHeight}U`}
                  </div>
                )}
              </div>
            </div>
            {c.notes && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
                {c.notes}
              </div>
            )}
          </Surface>

          <Surface
            title={
              <>
                <CheckCircle2 size={13} />
                Test plan
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {c.testPlans.length} steps
                </span>
              </>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {c.testPlans.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px minmax(0, 1fr) auto",
                    gap: 8,
                    padding: "6px 0",
                    borderBottom: i === c.testPlans.length - 1 ? "none" : "1px solid var(--border)",
                    fontSize: 12,
                    alignItems: "center",
                  }}
                >
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ color: "var(--text)" }}>{step}</span>
                  <Chip tone={isComplete && c.status === "passed" ? "success" : i < runs.length ? "info" : "neutral"}>
                    {isComplete && c.status === "passed" ? "passed" : i < runs.length ? "done" : "queued"}
                  </Chip>
                </div>
              ))}
            </div>
          </Surface>

          {headlineMetric && historicalRuns.length >= 2 && (
            <Surface
              title={
                <>
                  <TrendingUp size={13} style={{ color: "var(--accent-2)" }} />
                  Regression trend
                  <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                    {headlineMetric.metric} · across {historicalRuns.length} historical runs
                  </span>
                </>
              }
              actions={
                <Link
                  href={`/plans/${headlinePlan?.id}`}
                  className="btn btn-ghost"
                  style={{ padding: "2px 6px", fontSize: 11 }}
                >
                  open plan
                </Link>
              }
            >
              <RegressionChart
                runs={historicalRuns}
                metric={headlineMetric.metric}
                unit={headlineMetric.unit}
                limit={headlineMetric.limit}
                comparator={headlineMetric.comparator}
                regressionPct={2}
              />
            </Surface>
          )}

          <Surface
            flush
            title={
              <>
                <GitBranch size={13} />
                Supporting runs
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {runs.length} runs · {passRuns} pass · {failRuns} fail
                </span>
              </>
            }
          >
            {runs.length === 0 ? (
              <div className="empty">No runs attached yet.</div>
            ) : (
              <>
              {runs.length >= 2 && (
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-3)" }}>
                  <Link
                    href={`/reports/compare?ids=${runs.slice(0, Math.min(4, runs.length)).map((r) => r.id).join(",")}`}
                    className="btn btn-ghost"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    <GitBranch size={11} />
                    Compare {Math.min(4, runs.length)} runs side-by-side
                  </Link>
                </div>
              )}
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Run</th>
                    <th>Type</th>
                    <th>Server</th>
                    <th>Result</th>
                    <th>Measurements</th>
                    <th>Engineer</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    const eng = engineerById(r.engineerId);
                    const srv = serverById(r.serverId);
                    const passMs = (r.measurements ?? []).filter((m) => m.pass !== false).length;
                    const failMs = (r.measurements ?? []).filter((m) => m.pass === false).length;
                    return (
                      <tr key={r.id}>
                        <td className="id-cell">{r.id}</td>
                        <td><Chip tone="outline">{r.type}</Chip></td>
                        <td className="mono" style={{ color: "var(--text-2)" }}>
                          {srv ? (
                            <Link href={`/inventory/${srv.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                              {srv.id}
                            </Link>
                          ) : r.serverId}
                        </td>
                        <td>
                          <Chip tone={r.result === "pass" ? "success" : r.result === "fail" ? "danger" : r.result === "partial" ? "warning" : "info"}>
                            {r.result}
                          </Chip>
                        </td>
                        <td className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                          {r.measurements && r.measurements.length > 0
                            ? <><span style={{ color: "var(--success)" }}>{passMs}</span> / <span style={{ color: failMs > 0 ? "var(--danger)" : "var(--text-3)" }}>{failMs}</span></>
                            : "—"}
                        </td>
                        <td><Avatar name={eng?.name ?? "?"} size="sm" /></td>
                        <td className="mono" style={{ color: "var(--text-3)" }}><TimeAgo iso={r.startedISO} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </>
            )}
          </Surface>

          {producedQuals.length > 0 && (
            <Surface
              flush
              title={
                <>
                  <ShieldCheck size={13} style={{ color: "var(--success)" }} />
                  Qualifications produced
                </>
              }
            >
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>State</th>
                    <th>Signed off</th>
                    <th>Limitations</th>
                  </tr>
                </thead>
                <tbody>
                  {producedQuals.map((qq) => {
                    const signedBy = qq.signedOffByEngineerId ? engineerById(qq.signedOffByEngineerId) : undefined;
                    return (
                      <tr key={qq.id}>
                        <td className="id-cell">{qq.id}</td>
                        <td><Chip tone={qq.state === "qualified" ? "success" : qq.state === "limited" ? "warning" : "info"}>{qq.state}</Chip></td>
                        <td className="mono" style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                          {signedBy?.initials ?? "—"}
                          {qq.signedOffISO && <span style={{ marginLeft: 6 }}><TimeAgo iso={qq.signedOffISO} /></span>}
                        </td>
                        <td style={{ color: "var(--text-3)", fontSize: 11.5 }}>{qq.limitations ?? "—"}</td>
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
            <div className="side-panel-title">Properties</div>
            <div className="side-panel-row"><span className="k">Status</span><span className="v"><Chip tone={statusTone(c.status)}>{c.status}</Chip></span></div>
            <div className="side-panel-row">
              <span className="k">Owner</span>
              <span className="v">
                <Avatar name={owner?.name ?? "?"} size="sm" />
                <span>{owner?.name}</span>
              </span>
            </div>
            <div className="side-panel-row"><span className="k">Created</span><TimeAgo iso={c.createdISO} className="v mono" /></div>
            {c.targetCompletionISO && (
              <div className="side-panel-row"><span className="k">Due</span><TimeAgo iso={c.targetCompletionISO} className="v mono" /></div>
            )}
            {c.completedISO && (
              <div className="side-panel-row"><span className="k">Completed</span><TimeAgo iso={c.completedISO} className="v mono" /></div>
            )}
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Progress</div>
            <div className="side-panel-row"><span className="k">Test steps</span><span className="v mono">{c.testPlans.length}</span></div>
            <div className="side-panel-row"><span className="k">Runs total</span><span className="v mono">{runs.length}</span></div>
            <div className="side-panel-row"><span className="k">Pass</span><span className="v mono" style={{ color: "var(--success)" }}>{passRuns}</span></div>
            <div className="side-panel-row"><span className="k">Fail</span><span className="v mono" style={{ color: failRuns > 0 ? "var(--danger)" : "var(--text)" }}>{failRuns}</span></div>
            <div className="side-panel-row"><span className="k">Qualifications</span><span className="v mono">{producedQuals.length}</span></div>
          </div>

          {c.resultSummary && (
            <div className="side-panel-section">
              <div className="side-panel-title">Result summary</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
                {c.resultSummary}
              </div>
            </div>
          )}

          <div className="side-panel-section">
            <div className="side-panel-title">Related</div>
            <Link href={`/components/${c.componentId}`} style={{ display: "block", fontSize: 12, color: "var(--accent-2)", textDecoration: "none", padding: "3px 0" }}>
              ↗ {comp?.name}
            </Link>
            <Link href={`/platforms/${c.platformId}`} style={{ display: "block", fontSize: 12, color: "var(--accent-2)", textDecoration: "none", padding: "3px 0" }}>
              ↗ {plat?.name}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
