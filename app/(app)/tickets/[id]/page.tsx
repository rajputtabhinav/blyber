import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Cpu,
  ExternalLink,
  FileText,
  GitCommit,
  MessageSquare,
  Paperclip,
  Power,
  ShieldCheck,
  Terminal,
  TimerReset,
  UserPlus,
  Users,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip, SevDot } from "@/components/ui/Chip";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import {
  getTicket,
  listTickets,
  listTimelineForTicket,
  listChecklistForTicket,
  getServer,
  listInstancesByServer,
  listEngineers,
  listComponents,
} from "@/lib/db-queries";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { TimelineEntry, ChecklistItem, Ticket } from "@/lib/types";
import { FadeIn, Stagger, StaggerItem, PulseDot } from "@/components/ui/motion";

const KIND_ICON: Record<TimelineEntry["kind"], LucideIcon> = {
  create: AlertTriangle,
  assign: UserPlus,
  comment: MessageSquare,
  log: Terminal,
  validation: ShieldCheck,
  flash: Cpu,
  status: GitCommit,
  resolve: CheckCircle2,
};

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await getTicket(params.id);
  if (!ticket) notFound();

  const [server, engineers, allTickets, persistedTimeline, persistedChecklist] = await Promise.all([
    getServer(ticket.serverId),
    listEngineers(),
    listTickets(),
    listTimelineForTicket(ticket.id),
    listChecklistForTicket(ticket.id),
  ]);
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const ticketById = (id: string) => allTickets.find((t) => t.id === id);

  // DB has timeline + checklist for BLY-1247; fall back for the rest.
  const timeline = persistedTimeline.length > 0 ? persistedTimeline : buildFallbackTimeline(ticket, engineerById);
  const checklist = persistedChecklist.length > 0 ? persistedChecklist : buildFallbackChecklist(ticket);

  const assignee = engineerById(ticket.assigneeId);
  const reporter = engineerById(ticket.reporterId);
  const watchers = (ticket.watchers ?? []).map(engineerById).filter(Boolean);
  const related = (ticket.relatedIds ?? []).map(ticketById).filter(Boolean) as Ticket[];

  // BOM snapshot — fetched, used inline lower in the file
  const bom = await listInstancesByServer(ticket.serverId);
  const catalog = await listComponents();
  const componentById = (id: string) => catalog.find((c) => c.id === id);
  const instancesByServer = () => bom;

  return (
    <main className="page">
      <div style={{ marginBottom: 8 }}>
        <Link
          href="/tickets"
          className="btn btn-ghost"
          style={{ fontSize: 11, padding: "3px 6px" }}
        >
          <ArrowLeft size={12} />
          Back to tickets
        </Link>
      </div>

      <PageHead
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {ticket.severity === "critical" ? (
              <PulseDot color="var(--danger)" size={8} />
            ) : (
              <SevDot severity={ticket.severity} />
            )}
            <Chip
              tone={
                ticket.severity === "critical"
                  ? "danger"
                  : ticket.severity === "high"
                  ? "warning"
                  : ticket.severity === "medium"
                  ? "info"
                  : "neutral"
              }
              mono
            >
              {ticket.severity}
            </Chip>
            <span className="mono" style={{ color: "var(--text-2)", fontSize: 14 }}>
              {ticket.id}
            </span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em" }}>
              {ticket.title}
            </span>
          </div>
        }
        meta={
          <>
            <span className="mono">{ticket.serverId}</span>
            <ChevronRight size={11} style={{ color: "var(--text-3)" }} />
            <span className="mono">{ticket.rack}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span>reported by</span>
            <Avatar name={reporter?.name ?? "??"} size="sm" />
            <span>{reporter?.name}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <TimeAgo iso={ticket.createdISO} prefix="opened " className="mono" />
            <span style={{ color: "var(--text-3)" }}>·</span>
            <Chip
              tone={
                ticket.slaState === "err"
                  ? "danger"
                  : ticket.slaState === "warn"
                  ? "warning"
                  : "neutral"
              }
              mono
            >
              <TimeAgo iso={ticket.slaDueISO} prefix="SLA " />
            </Chip>
          </>
        }
        actions={
          <>
            <button className="btn">
              <UserPlus size={13} />
              Assign
            </button>
            <button className="btn">
              <TimerReset size={13} />
              Defer SLA
            </button>
            <button className="btn btn-primary">
              <CheckCircle2 size={13} />
              Resolve
            </button>
          </>
        }
      />

      {/* Split view: 65% / 35% */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.85fr) minmax(0, 1fr)", gap: 12 }}>
        {/* MAIN ===================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ticket.description && (
            <Surface
              title={
                <>
                  <FileText size={13} />
                  Description
                </>
              }
            >
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55 }}>
                {ticket.description}
              </p>
            </Surface>
          )}

          <Surface
            flush
            title={
              <>
                <GitCommit size={13} />
                Activity timeline
                <span
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: 11, fontWeight: 400, marginLeft: 8 }}
                >
                  {timeline.length} events
                </span>
              </>
            }
            actions={
              <button className="btn btn-ghost" style={{ padding: "2px 6px", fontSize: 11 }}>
                <MessageSquare size={12} />
                Comment
              </button>
            }
          >
            <div style={{ padding: "12px 14px" }}>
              <Stagger className="timeline">
                {timeline.map((e) => {
                  const actor = engineerById(e.actorId);
                  const Icon = KIND_ICON[e.kind];
                  return (
                    <StaggerItem key={e.id} className="timeline-item">
                      <div className={`timeline-dot dot-${e.kind}`}>
                        <Icon size={8} />
                      </div>
                      <div className="timeline-header">
                        <Avatar name={actor?.name ?? "??"} size="sm" />
                        <span className="timeline-actor">{actor?.name}</span>
                        <span className="timeline-action">{e.text}</span>
                        <TimeAgo iso={e.atISO} className="timeline-time" />
                      </div>
                      {e.detail && (
                        <div
                          className={e.kind === "log" ? "timeline-log" : "timeline-body"}
                        >
                          {e.detail}
                        </div>
                      )}
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>
          </Surface>

          <Surface
            flush
            title={
              <>
                <CheckCircle2 size={13} />
                Troubleshooting checklist
                <span
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: 11, fontWeight: 400, marginLeft: 8 }}
                >
                  {checklist.filter((c) => c.done).length} / {checklist.length}
                </span>
              </>
            }
            actions={
              <button className="btn btn-ghost" style={{ padding: "2px 6px", fontSize: 11 }}>
                <Plus size={12} />
                Add step
              </button>
            }
          >
            <div style={{ padding: "8px 14px" }}>
              <div className="checklist">
                {checklist.map((c) => {
                  const by = c.by ? engineerById(c.by) : null;
                  return (
                    <div key={c.id} className="checklist-item">
                      <div className={"checklist-box " + (c.done ? "done" : "")}>
                        {c.done && <CheckCircle2 size={10} strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span className={"checklist-text " + (c.done ? "done" : "")}>
                          {c.text}
                        </span>
                        {by && c.atISO && (
                          <div className="checklist-meta" style={{ marginTop: 3 }}>
                            <Avatar name={by.name} size="sm" />
                            <span>{by.name}</span>
                            <span>·</span>
                            <TimeAgo iso={c.atISO} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Surface>
        </div>

        {/* SIDE PANEL ============================== */}
        <div style={{ alignSelf: "start", position: "sticky", top: 60 }}>
        <FadeIn delay={0.08} className="side-panel">
          <div className="side-panel-section">
            <div className="side-panel-title">Properties</div>
            <div className="side-panel-row">
              <span className="k">Assignee</span>
              <span className="v">
                <Avatar name={assignee?.name ?? "??"} size="sm" />
                <span>{assignee?.name}</span>
              </span>
            </div>
            <div className="side-panel-row">
              <span className="k">Reporter</span>
              <span className="v">
                <Avatar name={reporter?.name ?? "??"} size="sm" />
                <span>{reporter?.name}</span>
              </span>
            </div>
            <div className="side-panel-row">
              <span className="k">Priority</span>
              <span className="v">
                <Chip
                  tone={
                    ticket.severity === "critical"
                      ? "danger"
                      : ticket.severity === "high"
                      ? "warning"
                      : ticket.severity === "medium"
                      ? "info"
                      : "neutral"
                  }
                >
                  {ticket.severity}
                </Chip>
              </span>
            </div>
            <div className="side-panel-row">
              <span className="k">Status</span>
              <span className="v">
                <Chip tone={ticket.status === "blocked" ? "danger" : ticket.status === "resolved" ? "success" : "warning"}>
                  {ticket.status.replace("_", "-")}
                </Chip>
              </span>
            </div>
            <div className="side-panel-row">
              <span className="k">Server</span>
              <span className="v mono">
                <Link href="/inventory" style={{ color: "var(--accent-2)", textDecoration: "none" }}>
                  {ticket.serverId}
                </Link>
              </span>
            </div>
            <div className="side-panel-row">
              <span className="k">Rack</span>
              <span className="v mono">{ticket.rack}</span>
            </div>
            <div className="side-panel-row">
              <span className="k">SLA</span>
              <TimeAgo iso={ticket.slaDueISO} className="v mono" />
            </div>
            <div className="side-panel-row">
              <span className="k">Tags</span>
              <span className="v" style={{ flexWrap: "wrap", gap: 4 }}>
                {ticket.tags.map((t) => (
                  <Chip key={t} tone="outline" mono>
                    {t}
                  </Chip>
                ))}
              </span>
            </div>
          </div>

          {server && (
            <div className="side-panel-section">
              <div className="side-panel-title">Server snapshot</div>
              <div className="side-panel-row"><span className="k">Hostname</span><span className="v mono">{server.hostname}</span></div>
              <div className="side-panel-row"><span className="k">Model</span><span className="v">{server.vendor} {server.model}</span></div>
              <div className="side-panel-row"><span className="k">BIOS</span><span className="v mono">{server.biosVersion}</span></div>
              <div className="side-panel-row"><span className="k">BMC</span><span className="v mono">{server.bmcVersion}</span></div>
              <div className="side-panel-row">
                <span className="k">Thermal</span>
                <span className="v mono" style={{ color: server.thermalC >= 85 ? "var(--danger)" : "var(--text)" }}>
                  {server.thermalC}°C
                </span>
              </div>
              <div className="side-panel-row"><span className="k">Power</span><span className="v mono">{server.powerW} W</span></div>
            </div>
          )}

          {server && (() => {
            const inst = instancesByServer();
            if (inst.length === 0) return null;
            // Group by component for the snapshot
            const groups = new Map<string, typeof inst>();
            for (const i of inst) {
              const arr = groups.get(i.componentId) ?? [];
              arr.push(i);
              groups.set(i.componentId, arr);
            }
            return (
              <div className="side-panel-section">
                <div className="side-panel-title">BOM snapshot at open-time</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Array.from(groups.entries()).map(([cid, list]) => {
                    const c = componentById(cid);
                    return (
                      <div key={cid} style={{ fontSize: 11.5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Chip tone="outline" mono>{c?.kind ?? "?"}</Chip>
                          <Link href={`/components/${cid}`} style={{ flex: 1, color: "var(--text)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c?.shortName ?? c?.name ?? cid}
                          </Link>
                          <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>×{list.length}</span>
                        </div>
                        <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1, marginLeft: 4 }}>
                          {list.slice(0, 2).map((i) => i.serial).join(", ")}
                          {list.length > 2 ? ` +${list.length - 2}` : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-3)" }}>
                  Snapshotted at ticket open. Use this manifest to reproduce in lab.
                </div>
              </div>
            );
          })()}

          {related.length > 0 && (
            <div className="side-panel-section">
              <div className="side-panel-title">Related tickets</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/tickets/${r.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "4px 0",
                      textDecoration: "none",
                      color: "var(--text)",
                    }}
                  >
                    <SevDot severity={r.severity} />
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-2)" }}>
                      {r.id}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="side-panel-section">
            <div className="side-panel-title">Compatibility notes</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
              {ticket.id === "BLY-1247" ? (
                <>
                  HPE DL380 Gen10 fan controller — confirmed susceptible to{" "}
                  <span className="mono">HPESBHF04421</span>. Affected SKUs: 875937-001 (Gold), 875939-001 (Silver). Patch shipped in iLO 5 2.81.
                </>
              ) : (
                "No compatibility advisories matched for this ticket scope."
              )}
            </div>
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Firmware history</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5 }}>
              {[
                { c: "iLO 5", from: "2.78", to: "2.81", t: "2h" },
                { c: "BIOS U30", from: "—", to: "2.08", t: "—" },
                { c: "ConnectX-6 Dx", from: "—", to: "22.36.1010", t: "—" },
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Power size={11} style={{ color: "var(--text-3)" }} />
                  <span style={{ flex: 1 }}>{f.c}</span>
                  <span className="mono" style={{ color: "var(--text-3)" }}>
                    {f.from}
                  </span>
                  <span style={{ color: "var(--text-3)" }}>→</span>
                  <span className="mono">{f.to}</span>
                  <span className="mono" style={{ color: "var(--text-3)", width: 22, textAlign: "right" }}>
                    {f.t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Attachments</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { name: "ilo5-event-log-20260517.txt", size: "42 KB" },
                { name: "fan-tachometer-wear.jpg", size: "1.4 MB" },
                { name: "VR-3092-burn-in-report.pdf", size: "318 KB" },
              ].map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 0",
                    fontSize: 11.5,
                  }}
                >
                  <Paperclip size={11} style={{ color: "var(--text-3)" }} />
                  <span className="mono" style={{ flex: 1, color: "var(--text)" }}>
                    {a.name}
                  </span>
                  <span className="mono" style={{ color: "var(--text-3)" }}>
                    {a.size}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="side-panel-section">
            <div className="side-panel-title">Watchers</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AvatarStack names={watchers.map((w) => w!.name)} max={5} size="sm" />
              <button className="btn btn-ghost" style={{ padding: "2px 6px", fontSize: 11 }}>
                <Users size={11} />
                Add
              </button>
              <a
                href="#"
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "var(--text-3)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <ExternalLink size={10} />
                copy link
              </a>
            </div>
          </div>
        </FadeIn>
        </div>
      </div>
    </main>
  );
}

function buildFallbackTimeline(
  t: Ticket,
  lookupEngineer: (id: string) => { name: string } | undefined,
): TimelineEntry[] {
  return [
    {
      id: `${t.id}-tl-1`,
      ticketId: t.id,
      kind: "create",
      actorId: t.reporterId,
      atISO: t.createdISO,
      text: "opened ticket",
    },
    {
      id: `${t.id}-tl-2`,
      ticketId: t.id,
      kind: "assign",
      actorId: t.reporterId,
      atISO: t.createdISO,
      text: `assigned to ${lookupEngineer(t.assigneeId)?.name ?? "engineer"}`,
    },
    {
      id: `${t.id}-tl-3`,
      ticketId: t.id,
      kind: "comment",
      actorId: t.assigneeId,
      atISO: t.updatedISO,
      text: "added comment",
      detail: "Triage started — collecting initial diagnostics from BMC and system event log.",
    },
    {
      id: `${t.id}-tl-4`,
      ticketId: t.id,
      kind: "status",
      actorId: t.assigneeId,
      atISO: t.updatedISO,
      text: `moved status open → ${t.status.replace("_", " ")}`,
    },
  ];
}

function buildFallbackChecklist(t: Ticket): ChecklistItem[] {
  return [
    { id: `${t.id}-c-1`, ticketId: t.id, text: "Collect initial BMC/iLO event log", done: true, by: t.assigneeId, atISO: t.updatedISO },
    { id: `${t.id}-c-2`, ticketId: t.id, text: "Reproduce in lab", done: false },
    { id: `${t.id}-c-3`, ticketId: t.id, text: "Verify firmware version against fleet baseline", done: false },
    { id: `${t.id}-c-4`, ticketId: t.id, text: "Document root cause in KB", done: false },
  ];
}
