import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardList, GitBranch, Play, ShieldCheck } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { KPI } from "@/components/ui/KPI";
import { RegressionChart } from "@/components/ui/RegressionChart";
import {
  getTestPlan,
  listRunsByPlan,
  listEngineers,
  listServers,
  listCampaigns,
} from "@/lib/db-queries";
import type { MetricSpec, TestPlanStatus } from "@/lib/types";

function statusTone(s: TestPlanStatus) {
  return s === "active" ? "success" : s === "draft" ? "warning" : "neutral";
}

function fmtDuration(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function comparatorLabel(c: MetricSpec["comparator"]): string {
  return c === "lt" ? "<" : c === "lte" ? "≤" : c === "gt" ? ">" : c === "gte" ? "≥" : "=";
}

export default async function PlanDetailPage({ params }: { params: { id: string } }) {
  const plan = await getTestPlan(params.id);
  if (!plan) notFound();

  const [runs, engineers, allServers, allCampaigns] = await Promise.all([
    listRunsByPlan(plan.id),
    listEngineers(),
    listServers(),
    listCampaigns(),
  ]);
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const serverById = (id: string) => allServers.find((s) => s.id === id);

  const owner = plan.ownerEngineerId ? engineerById(plan.ownerEngineerId) : undefined;
  const passRuns = runs.filter((r) => r.result === "pass").length;
  const failRuns = runs.filter((r) => r.result === "fail").length;
  const partialRuns = runs.filter((r) => r.result === "partial").length;
  const runningRuns = runs.filter((r) => r.result === "running").length;
  const passRate = runs.length > 0 ? Math.round((passRuns / runs.length) * 100) : 0;

  // Campaigns that reference this plan
  const linkedCampaigns = allCampaigns.filter((c) => c.testPlanIds?.includes(plan.id));

  // Default "headline" metric for the regression chart: first acceptance with severity must
  const headline = plan.acceptance.find((a) => a.severity === "must") ?? plan.acceptance[0];

  return (
    <main className="page">
      <div style={{ marginBottom: 8 }}>
        <Link href="/plans" className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          <ArrowLeft size={12} />
          Back to plans
        </Link>
      </div>

      <PageHead
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <ClipboardList size={16} style={{ color: "var(--text-2)" }} />
            <span className="mono" style={{ color: "var(--text-2)", fontSize: 13 }}>{plan.id}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{plan.name}</span>
            <span className="mono" style={{ color: "var(--text-2)", fontSize: 12 }}>v{plan.version}</span>
            <Chip tone={statusTone(plan.status)} mono>{plan.status}</Chip>
            <Chip tone="outline">{plan.scope}</Chip>
          </div>
        }
        meta={
          <>
            {plan.description && <span style={{ color: "var(--text-2)" }}>{plan.description}</span>}
          </>
        }
        actions={
          <>
            <button className="btn"><Play size={13} />Run on chassis…</button>
            <button className="btn btn-primary"><CheckCircle2 size={13} />Promote to v{(parseFloat(plan.version) + 0.1).toFixed(1)}</button>
          </>
        }
      />

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
        <KPI label="Steps" value={plan.steps.length} foot="ordered" />
        <KPI label="Acceptance criteria" value={plan.acceptance.length} foot={`${plan.acceptance.filter((a) => a.severity === "must").length} must · ${plan.acceptance.filter((a) => a.severity === "should").length} should`} />
        <KPI label="Expected duration" value={fmtDuration(plan.expectedDurationMin)} foot="per run" />
        <KPI label="Runs executed" value={runs.length} foot={`${runningRuns} running`} />
        <KPI
          label="Pass rate"
          value={runs.length === 0 ? "—" :
            <span style={{ color: passRate >= 90 ? "var(--success)" : passRate >= 70 ? "var(--warning)" : "var(--danger)" }}>
              {passRate}%
            </span>
          }
          foot={`${passRuns} pass · ${failRuns} fail · ${partialRuns} partial`}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 12 }}>
        {/* MAIN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Headline regression chart */}
          {headline && runs.length > 0 && (
            <Surface
              title={
                <>
                  <GitBranch size={13} />
                  Performance trend: <span className="mono" style={{ fontWeight: 400, marginLeft: 4 }}>{headline.metric}</span>
                </>
              }
            >
              <RegressionChart
                runs={runs}
                metric={headline.metric}
                unit={headline.unit}
                limit={headline.limit}
                comparator={headline.comparator}
                regressionPct={2}
              />
            </Surface>
          )}

          {/* Steps */}
          <Surface
            title={
              <>
                <ClipboardList size={13} />
                Test steps
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {plan.steps.length} ordered
                </span>
              </>
            }
          >
            {plan.steps.length === 0 ? (
              <div className="empty">No steps defined.</div>
            ) : (
              <div>
                {plan.steps.map((step, i) => (
                  <div
                    key={step.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px minmax(0, 1fr) auto",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: i === plan.steps.length - 1 ? "none" : "1px solid var(--border)",
                      alignItems: "start",
                    }}
                  >
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontWeight: 500, color: "var(--text)", fontSize: 13 }}>{step.name}</span>
                        {step.blockingOnFail && <Chip tone="danger">blocking</Chip>}
                        {step.retryable && <Chip tone="neutral">retryable</Chip>}
                      </div>
                      {step.description && (
                        <div style={{ fontSize: 11.5, color: "var(--text-2)", marginBottom: 4 }}>
                          {step.description}
                        </div>
                      )}
                      {step.command && (
                        <div
                          className="mono"
                          style={{
                            fontSize: 11,
                            color: "var(--text-2)",
                            background: "var(--bg-2)",
                            border: "1px solid var(--border)",
                            borderRadius: 4,
                            padding: "4px 8px",
                            overflowX: "auto",
                            whiteSpace: "nowrap",
                          }}
                        >
                          $ {step.command}
                        </div>
                      )}
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                      {fmtDuration(step.expectedDurationMin)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Surface>

          {/* Acceptance criteria */}
          <Surface
            flush
            title={
              <>
                <ShieldCheck size={13} />
                Acceptance criteria
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {plan.acceptance.length}
                </span>
              </>
            }
          >
            {plan.acceptance.length === 0 ? (
              <div className="empty">No acceptance criteria defined.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Comparator</th>
                    <th>Limit</th>
                    <th>Severity</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.acceptance.map((a) => (
                    <tr key={a.metric}>
                      <td className="mono" style={{ fontSize: 11.5 }}>{a.metric}</td>
                      <td className="mono" style={{ color: "var(--text-2)" }}>{comparatorLabel(a.comparator)}</td>
                      <td className="mono">{a.limit}{a.unit ? ` ${a.unit}` : ""}</td>
                      <td><Chip tone={a.severity === "must" ? "danger" : "warning"}>{a.severity}</Chip></td>
                      <td style={{ color: "var(--text-3)", fontSize: 11.5, maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {a.description ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Surface>

          {/* Runs that used this plan */}
          <Surface
            flush
            title={
              <>
                <GitBranch size={13} />
                Runs executing this plan
                <span className="mono" style={{ marginLeft: 8, color: "var(--text-3)", fontSize: 11, fontWeight: 400 }}>
                  {runs.length}
                </span>
              </>
            }
          >
            {runs.length === 0 ? (
              <div className="empty">No runs have executed this plan yet.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Run</th>
                    <th>Server</th>
                    <th>Campaign</th>
                    <th>Result</th>
                    <th>Engineer</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {runs
                    .slice()
                    .sort((a, b) => +new Date(b.startedISO) - +new Date(a.startedISO))
                    .map((r) => {
                      const eng = engineerById(r.engineerId);
                      const srv = serverById(r.serverId);
                      return (
                        <tr key={r.id}>
                          <td className="id-cell">{r.id}</td>
                          <td className="mono" style={{ color: "var(--text-2)" }}>
                            {srv ? <Link href={`/inventory/${srv.id}`} style={{ color: "inherit", textDecoration: "none" }}>{srv.id}</Link> : r.serverId}
                          </td>
                          <td className="mono" style={{ color: "var(--text-2)", fontSize: 11.5 }}>
                            {r.campaignId ? (
                              <Link href={`/qualifications/${r.campaignId}`} style={{ color: "inherit", textDecoration: "none" }}>
                                {r.campaignId}
                              </Link>
                            ) : "—"}
                          </td>
                          <td>
                            <Chip tone={r.result === "pass" ? "success" : r.result === "fail" ? "danger" : r.result === "partial" ? "warning" : "info"}>
                              {r.result}
                            </Chip>
                          </td>
                          <td><Avatar name={eng?.name ?? "?"} size="sm" /></td>
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
        <div className="side-panel" style={{ alignSelf: "start", position: "sticky", top: 60 }}>
          <div className="side-panel-section">
            <div className="side-panel-title">Plan</div>
            <div className="side-panel-row"><span className="k">ID</span><span className="v mono">{plan.id}</span></div>
            <div className="side-panel-row"><span className="k">Name</span><span className="v">{plan.name}</span></div>
            <div className="side-panel-row"><span className="k">Version</span><span className="v mono">{plan.version}</span></div>
            <div className="side-panel-row"><span className="k">Status</span><span className="v"><Chip tone={statusTone(plan.status)}>{plan.status}</Chip></span></div>
            <div className="side-panel-row"><span className="k">Scope</span><span className="v"><Chip tone="outline">{plan.scope}</Chip></span></div>
            <div className="side-panel-row"><span className="k">Updated</span><TimeAgo iso={plan.updatedISO} className="v mono" /></div>
            {owner && (
              <div className="side-panel-row">
                <span className="k">Owner</span>
                <span className="v">
                  <Avatar name={owner.name} size="sm" />
                  <span>{owner.name}</span>
                </span>
              </div>
            )}
          </div>

          {plan.appliesToKinds && plan.appliesToKinds.length > 0 && (
            <div className="side-panel-section">
              <div className="side-panel-title">Applies to</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {plan.appliesToKinds.map((k) => (
                  <Chip key={k} tone="outline">{k}</Chip>
                ))}
              </div>
            </div>
          )}

          {(plan.requiredEquipment || plan.requiredSkill) && (
            <div className="side-panel-section">
              <div className="side-panel-title">Requirements</div>
              {plan.requiredSkill && (
                <div className="side-panel-row"><span className="k">Skill</span><span className="v mono" style={{ fontSize: 11 }}>{plan.requiredSkill}</span></div>
              )}
              {plan.requiredEquipment && plan.requiredEquipment.length > 0 && (
                <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--text-2)" }}>
                  {plan.requiredEquipment.map((eq, i) => (
                    <div key={i}>· {eq}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {linkedCampaigns.length > 0 && (
            <div className="side-panel-section">
              <div className="side-panel-title">Used by campaigns</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {linkedCampaigns.map((c) => (
                  <Link
                    key={c.id}
                    href={`/qualifications/${c.id}`}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0", fontSize: 12, color: "var(--text)", textDecoration: "none" }}
                  >
                    <span className="mono" style={{ color: "var(--text-3)" }}>{c.id}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
