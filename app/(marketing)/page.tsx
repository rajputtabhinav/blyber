import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Server,
  FlaskConical,
  ShieldCheck,
  Cpu,
  Activity,
  Database,
  Eye,
  Layers,
  Workflow,
  Cable,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  listServers,
  listTickets,
  listRuns,
  listQualifications,
  listAuditLog,
} from "@/lib/db-queries";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Live numbers — pulled from the demo org so the page has a heartbeat.
  // If the DB isn't seeded yet, every number is zero (still honest).
  let servers = 0;
  let activeTickets = 0;
  let runsThisWeek = 0;
  let passRate: number | null = null;
  let qualified = 0;
  let audit: Awaited<ReturnType<typeof listAuditLog>> = [];

  try {
    const [s, t, r, q, a] = await Promise.all([
      listServers(),
      listTickets(),
      listRuns(),
      listQualifications(),
      listAuditLog(8),
    ]);
    servers = s.length;
    activeTickets = t.filter((x) => x.status !== "resolved" && x.status !== "closed").length;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const recent = r.filter((x) => +new Date(x.startedISO) >= weekAgo);
    runsThisWeek = recent.length;
    if (recent.length > 0) {
      const passes = recent.filter((x) => x.result === "pass").length;
      passRate = Math.round((passes / recent.length) * 100);
    }
    qualified = q.filter((x) => x.state === "qualified").length;
    audit = a;
  } catch {
    // DB not ready — render with zeros.
  }

  return (
    <main className="mkt-main">
      {/* ============================================================ */}
      {/* HERO (2-column: headline left, subtitle + CTAs right)         */}
      {/* ============================================================ */}
      <section className="mkt-hero">
        <div className="mkt-hero-left">
          <div className="mkt-hero-eyebrow">
            <span className="mkt-hero-pill">Internal · Lab build</span>
          </div>
          <h1 className="mkt-hero-h1">
            Mission control for{" "}
            <span className="mkt-hero-accent">infrastructure engineers.</span>
          </h1>
        </div>
        <div className="mkt-hero-right">
          <p className="mkt-hero-sub">
            Blyber is the single workbench for the lab — servers, racks,
            components, tickets, qualifications, validation runs, and the
            audit trail underneath all of it. No spreadsheets. No tribal
            knowledge.
          </p>
          <div className="mkt-hero-ctas">
            <Link href="/dashboard" className="mkt-btn mkt-btn-primary">
              Open Dashboard
              <ArrowRight size={15} />
            </Link>
            <a href="#modules" className="mkt-btn mkt-btn-ghost">
              Discover modules
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip — live counts from the DB */}
      <section className="mkt-stats-strip">
        <div className="mkt-stat">
          <div className="mkt-stat-value">{servers}</div>
          <div className="mkt-stat-label">Servers tracked</div>
        </div>
        <div className="mkt-stat">
          <div className="mkt-stat-value">{activeTickets}</div>
          <div className="mkt-stat-label">Active tickets</div>
        </div>
        <div className="mkt-stat">
          <div className="mkt-stat-value">{runsThisWeek}</div>
          <div className="mkt-stat-label">Runs this week</div>
        </div>
        <div className="mkt-stat">
          <div className="mkt-stat-value">
            {passRate === null ? "—" : `${passRate}%`}
          </div>
          <div className="mkt-stat-label">Pass rate (7d)</div>
        </div>
        <div className="mkt-stat">
          <div className="mkt-stat-value">{qualified}</div>
          <div className="mkt-stat-label">Qualified pairings</div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* INTRO PARAGRAPH                                              */}
      {/* ============================================================ */}
      <section className="mkt-intro">
        <p>
          Blyber transforms the lab&apos;s scattered state — every server, every
          ticket, every validation run — into a single auditable graph.
          Engineers ship qualifications faster, RMAs close on time, and
          leadership gets honest numbers instead of stale weekly slides.
        </p>
      </section>

      {/* ============================================================ */}
      {/* THREE PILLAR CARDS                                            */}
      {/* ============================================================ */}
      <section id="modules" className="mkt-pillars-wrap">
        <div className="mkt-pillars">
          <PillarCard
            tone="teal"
            icon={<Server size={20} />}
            kicker="Hardware"
            title="Inventory"
            body="Every server, rack, and component instance — serial-tracked, owner-tagged, telemetry-aware. Power, thermal, BIOS/BMC versions roll up live."
            href="/inventory"
          />
          <PillarCard
            tone="amber"
            icon={<FlaskConical size={20} />}
            kicker="Validation"
            title="Test plans + runs"
            body="Author test plans, attach acceptance metrics, capture run artifacts. Pass/fail aggregates feed straight back into qualification campaigns."
            href="/reports"
          />
          <PillarCard
            tone="violet"
            icon={<ShieldCheck size={20} />}
            kicker="Qualifications"
            title="Sign-off ledger"
            body="A signed-off compatibility matrix across components × platforms. Limitations recorded, supporting runs linked, expiry tracked."
            href="/qualifications"
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* CAPABILITY BLOCKS                                             */}
      {/* ============================================================ */}
      <section id="capabilities" className="mkt-capabilities-wrap">
        <div className="mkt-capabilities-inner">
          <h2 className="mkt-section-h2">
            An infrastructure platform built for the lab
          </h2>
          <p className="mkt-section-sub">
            Every page is server-rendered against Postgres. Every mutation
            is audited. Every read is org-scoped, ready for multi-tenancy.
          </p>

          <div className="mkt-capabilities">
            <Capability
              icon={<Activity size={28} />}
              title="Real-time telemetry"
              body="Server status, thermal, power, and uptime stream into the inventory grid. Critical thresholds drive the alerts feed."
            />
            <Capability
              icon={<Eye size={28} />}
              title="Audit-everything"
              body="Every server-side mutation writes a structured audit row — actor, before, after, IP, user-agent. Admins see the full history at /admin/audit."
            />
            <Capability
              icon={<Layers size={28} />}
              title="25 platforms supported"
              body="Tyrone, Dell, HPE, Lenovo, Supermicro, and Cisco generations modeled out of the box. Add custom platforms via the catalog."
            />
            <Capability
              icon={<Database size={28} />}
              title="Open data model"
              body="Plain Postgres, plain Drizzle. 20 tables, fully indexed. No proprietary storage — export, dump, or query with any tool that speaks SQL."
            />
            <Capability
              icon={<Cable size={28} />}
              title="Multi-tenant ready"
              body="org_id is on every row, plus a users / organizations / org_members triple ready for SSO. Plug in any auth provider and the schema is set."
            />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WORKFLOW DIAGRAM                                              */}
      {/* ============================================================ */}
      <section id="workflow" className="mkt-workflow-wrap">
        <h2 className="mkt-section-h2">
          The Blyber workflow, end to end
        </h2>
        <p className="mkt-section-sub">
          Hardware arrives → it gets tested → results sign off into the
          qualification ledger → leadership reads it as a report. One graph,
          four stages.
        </p>

        <div className="mkt-workflow">
          <WorkflowStep
            n={1}
            title="Track"
            icon={<Server size={18} />}
            body="Serial-receive every component. Bind it to a server, slot, owner."
          />
          <WorkflowStep
            n={2}
            title="Validate"
            icon={<FlaskConical size={18} />}
            body="Run a test plan against the server. Capture pass/fail, metrics, artifacts."
          />
          <WorkflowStep
            n={3}
            title="Qualify"
            icon={<ShieldCheck size={18} />}
            body="Sign off on the component × platform pairing. Record limitations + expiry."
          />
          <WorkflowStep
            n={4}
            title="Report"
            icon={<Workflow size={18} />}
            body="Roll up to compatibility matrix, server reports, and the audit log."
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* LIVE ACTIVITY FROM AUDIT LOG                                  */}
      {/* ============================================================ */}
      {audit.length > 0 && (
        <section className="mkt-activity-wrap">
          <div className="mkt-activity-inner">
            <h2 className="mkt-section-h2 mkt-section-h2--sm">
              Recent activity in the lab
            </h2>
            <p className="mkt-section-sub mkt-section-sub--sm">
              Pulled live from the audit log. Every line is something an
              engineer did in Blyber.
            </p>
            <div className="mkt-activity">
              {audit.slice(0, 6).map((row) => (
                <div key={row.id} className="mkt-activity-row">
                  <div className="mkt-activity-icon">
                    {row.action.includes("resolve") || row.action.includes("complete") ? (
                      <CheckCircle2 size={14} style={{ color: "#00b894" }} />
                    ) : row.action.includes("close") || row.action.includes("fail") ? (
                      <AlertCircle size={14} style={{ color: "#b7791f" }} />
                    ) : (
                      <Activity size={14} style={{ color: "#666666" }} />
                    )}
                  </div>
                  <div className="mkt-activity-text">
                    <span className="mkt-activity-action mono">{row.action}</span>
                    <span className="mkt-activity-entity">
                      on {row.entityType}{" "}
                      <span className="mono">{row.entityId}</span>
                    </span>
                  </div>
                  <div className="mkt-activity-when mono">
                    {new Date(row.atISO).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* VENDOR SUPPORT STRIP                                          */}
      {/* ============================================================ */}
      <section id="vendors" className="mkt-vendors-wrap">
        <h2 className="mkt-section-h2 mkt-section-h2--sm">
          Vendors modeled out of the box
        </h2>
        <p className="mkt-section-sub mkt-section-sub--sm">
          Server lines, platform generations, BIOS/BMC families. Add your own
          via the components catalog.
        </p>
        <div className="mkt-vendors">
          {[
            "Tyrone",
            "Dell",
            "HPE",
            "Lenovo",
            "Supermicro",
            "Cisco",
            "Netweb",
            "NVIDIA",
            "Intel",
            "AMD",
            "Mellanox",
            "Broadcom",
          ].map((v) => (
            <div key={v} className="mkt-vendor-tile mono">
              {v}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA                                                     */}
      {/* ============================================================ */}
      <section className="mkt-final-cta">
        <div className="mkt-final-cta-inner">
          <Cpu size={28} className="mkt-final-cta-icon" />
          <h2>Ready to open the lab?</h2>
          <p>
            The dashboard is live with {servers} servers, {activeTickets}{" "}
            open tickets, and {runsThisWeek} runs in the last seven days.
          </p>
          <Link href="/dashboard" className="mkt-btn mkt-btn-primary">
            Open Dashboard
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
    </main>
  );
}

// ============================================================
// Small in-file components
// ============================================================

function PillarCard({
  tone,
  icon,
  kicker,
  title,
  body,
  href,
}: {
  tone: "teal" | "amber" | "violet";
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link href={href} className={`mkt-pillar mkt-pillar--${tone}`}>
      <div className="mkt-pillar-icon">{icon}</div>
      <div className="mkt-pillar-kicker">{kicker}</div>
      <div className="mkt-pillar-title">{title}</div>
      <p className="mkt-pillar-body">{body}</p>
      <span className="mkt-pillar-link">
        Discover <ArrowRight size={12} />
      </span>
    </Link>
  );
}

function Capability({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="mkt-capability">
      <div className="mkt-capability-icon">{icon}</div>
      <div className="mkt-capability-text">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

function WorkflowStep({
  n,
  title,
  icon,
  body,
}: {
  n: number;
  title: string;
  icon: React.ReactNode;
  body: string;
}) {
  return (
    <div className="mkt-wf-step">
      <div className="mkt-wf-step-head">
        <span className="mkt-wf-step-n mono">{String(n).padStart(2, "0")}</span>
        <span className="mkt-wf-step-icon">{icon}</span>
        <span className="mkt-wf-step-title">{title}</span>
      </div>
      <p className="mkt-wf-step-body">{body}</p>
    </div>
  );
}
