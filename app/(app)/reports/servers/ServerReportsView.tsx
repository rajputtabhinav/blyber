"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  Server as ServerIcon,
} from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { KPI } from "@/components/ui/KPI";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { cn } from "@/lib/cn";
import { downloadCSV, fileTimestamp } from "@/lib/exportCsv";
import type {
  Engineer,
  RmaItem,
  ServerNode,
  ServerStatus,
  Ticket,
  ValidationRun,
} from "@/lib/types";

const STATUS_OPTIONS: { value: ServerStatus | "all"; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "online", label: "Online" },
  { value: "validating", label: "Validating" },
  { value: "fault", label: "Fault" },
  { value: "maintenance", label: "Maintenance" },
  { value: "offline", label: "Offline" },
];

function statusTone(s: ServerStatus) {
  return s === "online" ? "success"
    : s === "validating" ? "info"
    : s === "fault" ? "danger"
    : s === "maintenance" ? "warning"
    : "neutral";
}

export function ServerReportsView({
  servers,
  validationRuns,
  tickets,
  rmaItems,
  engineers,
}: {
  servers: ServerNode[];
  validationRuns: ValidationRun[];
  tickets: Ticket[];
  rmaItems: RmaItem[];
  engineers: Engineer[];
}) {
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ServerStatus | "all">("all");

  /** Aggregate per-server metrics used in the index table + bulk CSV. */
  function buildSummary(s: ServerNode) {
    const runs = validationRuns.filter((r) => r.serverId === s.id);
    const passRuns = runs.filter((r) => r.result === "pass").length;
    const failRuns = runs.filter((r) => r.result === "fail").length;
    const tx = tickets.filter((t) => t.serverId === s.id);
    const openTx = tx.filter((t) => t.status !== "resolved" && t.status !== "closed");
    const rmas = rmaItems.filter((r) => r.serverId === s.id);
    const lastRun = runs.length > 0
      ? runs.slice().sort((a, b) => +new Date(b.startedISO) - +new Date(a.startedISO))[0]
      : undefined;
    const owner = engineerById(s.owner);
    return {
      runs: runs.length,
      passRuns,
      failRuns,
      passRate: runs.length > 0 ? Math.round((passRuns / runs.length) * 100) : null,
      tickets: tx.length,
      openTickets: openTx.length,
      rmas: rmas.length,
      lastReportISO: lastRun?.startedISO,
      ownerName: owner?.name ?? "",
      ownerInitials: owner?.initials ?? "",
    };
  }

  const rows = useMemo(() => {
    return servers
      .filter((s) => {
        if (status !== "all" && s.status !== status) return false;
        if (q) {
          const n = q.toLowerCase();
          if (
            !s.id.toLowerCase().includes(n) &&
            !s.hostname.toLowerCase().includes(n) &&
            !s.model.toLowerCase().includes(n) &&
            !s.serial.toLowerCase().includes(n)
          ) return false;
        }
        return true;
      })
      .map((s) => ({ server: s, summary: buildSummary(s) }));
    // buildSummary closes over validationRuns/tickets/rmaItems/engineers via
    // component scope; intentionally not in deps because the function identity
    // is stable per render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, servers, validationRuns, tickets, rmaItems, engineers]);

  const totals = useMemo(() => {
    const runs = rows.reduce((acc, r) => acc + r.summary.runs, 0);
    const openTickets = rows.reduce((acc, r) => acc + r.summary.openTickets, 0);
    const rmas = rows.reduce((acc, r) => acc + r.summary.rmas, 0);
    return { servers: rows.length, runs, openTickets, rmas };
  }, [rows]);

  /** Generate the bulk CSV (one row per server, all key columns). */
  function exportAllCsv() {
    const out = rows.map(({ server: s, summary }) => ({
      "Server ID": s.id,
      Hostname: s.hostname,
      Vendor: s.vendor,
      Model: s.model,
      Generation: s.generation,
      Serial: s.serial,
      CPU: s.cpu,
      "RAM (GB)": s.ramGB,
      "RAM config": s.ramConfig,
      Storage: s.storage,
      NIC: s.nic,
      GPU: s.gpu ?? "",
      Rack: s.rack,
      "RU start": s.ruStart,
      "RU height": s.ruHeight,
      Status: s.status,
      "Thermal (°C)": s.thermalC,
      "Power (W)": s.powerW,
      "BIOS version": s.biosVersion,
      "BMC version": s.bmcVersion,
      "Last boot (UTC)": s.lastBootISO,
      "Uptime (days)": s.uptimeDays,
      Owner: summary.ownerName,
      "Validation runs": summary.runs,
      "Pass count": summary.passRuns,
      "Fail count": summary.failRuns,
      "Pass rate (%)": summary.passRate ?? "",
      "Total tickets": summary.tickets,
      "Open tickets": summary.openTickets,
      "RMA records": summary.rmas,
      "Last report (UTC)": summary.lastReportISO ?? "",
      Notes: s.notes ?? "",
    }));
    downloadCSV(`blyber-servers-${fileTimestamp()}`, out);
  }

  /** Generate a validation-runs CSV across all visible servers. */
  function exportRunsCsv() {
    const out = validationRuns
      .filter((r) => rows.some((row) => row.server.id === r.serverId))
      .map((r) => ({
        "Run ID": r.id,
        "Server ID": r.serverId,
        Type: r.type,
        Result: r.result,
        "Started (UTC)": r.startedISO,
        "Duration (min)": r.durationMin,
        "Pass count": r.passCount,
        "Fail count": r.failCount,
        Engineer: engineerById(r.engineerId)?.name ?? r.engineerId,
        "Test plan": r.testPlanId ?? "",
        Campaign: r.campaignId ?? "",
        Notes: r.notes ?? "",
      }));
    downloadCSV(`blyber-validation-runs-${fileTimestamp()}`, out);
  }

  return (
    <main className="page">
      <div style={{ marginBottom: 8 }}>
        <Link href="/reports" className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          <ArrowLeft size={12} />
          Back to reports
        </Link>
      </div>

      <PageHead
        title="Server Reports"
        meta={
          <>
            <span className="mono">{totals.servers} servers</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{totals.runs} runs</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{totals.openTickets} open tickets</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{totals.rmas} RMAs</span>
          </>
        }
        actions={
          <>
            <button className="btn" onClick={exportRunsCsv} title="Download a CSV with every validation run">
              <FileSpreadsheet size={13} />
              All runs (CSV)
            </button>
            <button className="btn btn-primary" onClick={exportAllCsv} title="Download a CSV with one row per server">
              <Download size={13} />
              All servers (CSV)
            </button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
        <KPI label="Servers" value={totals.servers} foot="in the lab" />
        <KPI label="Validation runs" value={totals.runs} foot="all time" />
        <KPI label="Open tickets" value={<span style={{ color: totals.openTickets > 0 ? "var(--warning)" : "var(--text)" }}>{totals.openTickets}</span>} foot="across visible servers" />
        <KPI label="RMA records" value={totals.rmas} foot="lifetime" />
      </div>

      <Surface flush>
        <div className="toolbar">
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ID, hostname, model, serial…"
            />
          </div>
          <div className="toolbar-sep" />
          <span className="label-mono">
            <Filter size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Status
          </span>
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={cn("filter-chip", status === o.value && "active")}
              onClick={() => setStatus(o.value)}
            >
              {o.label}
            </button>
          ))}
          <div className="toolbar-spacer" />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
            {rows.length} shown
          </span>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hostname</th>
              <th>Model</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Runs</th>
              <th style={{ textAlign: "right" }}>Pass rate</th>
              <th style={{ textAlign: "right" }}>Open tx</th>
              <th style={{ textAlign: "right" }}>RMAs</th>
              <th>Last report</th>
              <th style={{ textAlign: "right" }}>Report</th>
            </tr>
          </thead>
          <Stagger as="tbody">
            {rows.map(({ server: s, summary }) => (
              <StaggerItem as="tr" key={s.id}>
                <td className="id-cell">
                  <Link href={`/reports/servers/${s.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {s.id}
                  </Link>
                </td>
                <td className="mono" style={{ fontSize: 11.5 }}>
                  <Link href={`/reports/servers/${s.id}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                    {s.hostname}
                  </Link>
                </td>
                <td style={{ color: "var(--text-2)", fontSize: 11.5 }}>
                  {s.vendor} {s.model}
                </td>
                <td><Chip tone={statusTone(s.status)}>{s.status}</Chip></td>
                <td className="num">{summary.runs}</td>
                <td className="num">
                  {summary.passRate === null ? (
                    <span style={{ color: "var(--text-3)" }}>—</span>
                  ) : (
                    <span style={{ color: summary.passRate >= 90 ? "var(--success)" : summary.passRate >= 70 ? "var(--warning)" : "var(--danger)" }}>
                      {summary.passRate}%
                    </span>
                  )}
                </td>
                <td className="num">
                  <span style={{ color: summary.openTickets > 0 ? "var(--warning)" : "var(--text-3)" }}>
                    {summary.openTickets}
                  </span>
                </td>
                <td className="num">
                  <span style={{ color: summary.rmas > 0 ? "var(--info)" : "var(--text-3)" }}>
                    {summary.rmas}
                  </span>
                </td>
                <td className="mono" style={{ color: "var(--text-3)" }}>
                  {summary.lastReportISO ? <TimeAgo iso={summary.lastReportISO} /> : "—"}
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link
                    href={`/reports/servers/${s.id}`}
                    className="btn"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    <FileText size={11} />
                    Open report
                  </Link>
                </td>
              </StaggerItem>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10}>
                  <div className="empty">
                    <ServerIcon size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    No servers match the current filters.
                  </div>
                </td>
              </tr>
            )}
          </Stagger>
        </table>
      </Surface>

      <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-3)" }}>
        Tip — open any server&apos;s report and press <span className="mono">⌘P</span> /{" "}
        <span className="mono">Ctrl+P</span> to save it as a PDF. The page is styled for
        printing so the sidebar, topbar, and action buttons are hidden in the output.
      </div>
    </main>
  );
}
