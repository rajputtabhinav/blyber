"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { BlyberWordmark } from "@/components/shell/BlyberWordmark";
import { downloadCSV, fileTimestamp } from "@/lib/exportCsv";
import type {
  ComponentInstance,
  Component as CatalogComponent,
  Engineer,
  Platform,
  RmaItem,
  ServerNode,
  Ticket,
  ValidationRun,
} from "@/lib/types";

export function ServerReportView({
  server,
  owner,
  platform,
  bom,
  runs,
  tx,
  rmas,
  catalog,
  engineers,
}: {
  server: ServerNode;
  owner?: Engineer;
  platform?: Platform;
  bom: ComponentInstance[];
  runs: ValidationRun[];
  tx: Ticket[];
  rmas: RmaItem[];
  catalog: CatalogComponent[];
  engineers: Engineer[];
}) {
  const router = useRouter();
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const componentById = (id: string) => catalog.find((c) => c.id === id);

  // "Generated" timestamps — defer to client-only to avoid hydration
  // mismatch (server-rendered timestamp differs from first client paint).
  const [generatedAtISO, setGeneratedAtISO] = useState<string | null>(null);
  const [generatedAtUTC, setGeneratedAtUTC] = useState<string | null>(null);
  useEffect(() => {
    const now = new Date();
    setGeneratedAtISO(now.toISOString());
    setGeneratedAtUTC(now.toUTCString());
  }, []);

  // ============================================================
  // CSV builders for this server
  // ============================================================
  function exportRunsCsv() {
    const out = runs.map((r) => ({
      "Run ID": r.id,
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
    downloadCSV(`${server.id}-runs-${fileTimestamp()}`, out);
  }

  function exportFullCsv() {
    // Single CSV: summary row first, then sections separated by blank rows.
    // Excel handles this fine.
    const lines: string[] = [];
    const push = (cells: (string | number)[]) =>
      lines.push(cells.map((c) => {
        const s = String(c ?? "");
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(","));

    push(["SERVER REPORT", server.id]);
    push(["Generated", new Date().toISOString()]);
    push([]);
    push(["Section", "Field", "Value"]);
    push(["Identity", "Server ID", server.id]);
    push(["Identity", "Hostname", server.hostname]);
    push(["Identity", "Vendor", server.vendor]);
    push(["Identity", "Model", server.model]);
    push(["Identity", "Generation", server.generation]);
    push(["Identity", "Serial", server.serial]);
    push(["Identity", "Platform", platform?.name ?? ""]);
    push(["Identity", "Rack", server.rack]);
    push(["Identity", "RU", `U${server.ruStart}-U${server.ruStart + server.ruHeight - 1}`]);
    push(["Identity", "Owner", owner?.name ?? ""]);

    push([]);
    push(["Hardware", "CPU", server.cpu]);
    push(["Hardware", "Sockets", server.cpuSockets]);
    push(["Hardware", "RAM (GB)", server.ramGB]);
    push(["Hardware", "RAM config", server.ramConfig]);
    push(["Hardware", "Storage", server.storage]);
    push(["Hardware", "NIC", server.nic]);
    push(["Hardware", "GPU", server.gpu ?? ""]);

    push([]);
    push(["Firmware", "BIOS version", server.biosVersion]);
    push(["Firmware", "BMC version", server.bmcVersion]);

    push([]);
    push(["Runtime", "Status", server.status]);
    push(["Runtime", "Thermal (°C)", server.thermalC]);
    push(["Runtime", "Power (W)", server.powerW]);
    push(["Runtime", "Uptime (days)", server.uptimeDays]);
    push(["Runtime", "Last boot (UTC)", server.lastBootISO]);

    push([]);
    push(["BOM", "Component ID", "Serial", "Slot", "State"]);
    for (const i of bom) {
      const c = componentById(i.componentId);
      push(["BOM", c?.name ?? i.componentId, i.serial, i.slot ?? "", i.state]);
    }

    push([]);
    push(["Validation runs", "Run ID", "Type", "Result", "Started (UTC)", "Duration (min)", "Engineer", "Notes"]);
    for (const r of runs) {
      push([
        "Validation runs",
        r.id,
        r.type,
        r.result,
        r.startedISO,
        r.durationMin,
        engineerById(r.engineerId)?.name ?? r.engineerId,
        r.notes ?? "",
      ]);
    }

    push([]);
    push(["Tickets", "Ticket ID", "Severity", "Status", "Title", "Opened (UTC)"]);
    for (const t of tx) {
      push(["Tickets", t.id, t.severity, t.status, t.title, t.createdISO]);
    }

    push([]);
    push(["RMA", "RMA ID", "Component", "Vendor", "Status", "Days open", "Reason"]);
    for (const r of rmas) {
      push(["RMA", r.id, r.componentName, r.vendor, r.status, r.daysOpen, r.reason]);
    }

    const csv = lines.join("\n");
    const filename = `${server.id}-report-${fileTimestamp()}.csv`;
    const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className="page report-page">
      {/* Toolbar — hidden when printing */}
      <div className="report-toolbar" style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => router.back()} className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          <ArrowLeft size={12} />
          Back
        </button>
        <Link href="/reports/servers" className="btn btn-ghost" style={{ fontSize: 11, padding: "3px 6px" }}>
          All server reports
        </Link>
        <div className="toolbar-spacer" style={{ flex: 1 }} />
        <button className="btn" onClick={exportRunsCsv}>
          <FileSpreadsheet size={13} />
          Runs CSV
        </button>
        <button className="btn" onClick={exportFullCsv}>
          <Download size={13} />
          Full CSV (Excel)
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={13} />
          Print / Save PDF
        </button>
      </div>

      {/* Report header — visible both on screen and when printing */}
      <div className="report-header">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <BlyberWordmark height={26} />
          <div style={{ height: 26, width: 1, background: "var(--border-strong)" }} />
          <div>
            <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }} className="mono">
              Server Report
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>
              {server.id} — {server.hostname}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
              Generated {generatedAtISO ? <TimeAgo iso={generatedAtISO} live={false} /> : "just now"}
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 2 }}>
              {generatedAtISO ? `${generatedAtISO.slice(0, 19).replace("T", " ")}Z` : ""}
            </div>
          </div>
        </div>
      </div>

      <PageHead
        title={
          <span style={{ fontSize: 16 }}>
            {server.vendor} {server.model}
            <span className="mono" style={{ color: "var(--text-3)", fontSize: 13, marginLeft: 8 }}>
              {server.generation}
            </span>
          </span>
        }
        meta={
          <>
            <Chip tone={
              server.status === "online" ? "success" :
              server.status === "validating" ? "info" :
              server.status === "fault" ? "danger" :
              server.status === "maintenance" ? "warning" : "neutral"
            }>{server.status}</Chip>
            <span className="mono">{server.rack} · U{server.ruStart}–U{server.ruStart + server.ruHeight - 1}</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span>owner</span>
            <Avatar name={owner?.name ?? "??"} size="sm" />
            <span>{owner?.name}</span>
          </>
        }
      />

      <div className="report-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 12 }}>
        {/* MAIN COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Surface title="Validation history">
            {runs.length === 0 ? (
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
                    <th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => {
                    const eng = engineerById(r.engineerId);
                    return (
                      <tr key={r.id}>
                        <td className="id-cell">{r.id}</td>
                        <td><Chip tone="outline">{r.type}</Chip></td>
                        <td>
                          <Chip tone={
                            r.result === "pass" ? "success" :
                            r.result === "fail" ? "danger" :
                            r.result === "partial" ? "warning" : "info"
                          }>{r.result}</Chip>
                        </td>
                        <td className="num">{r.durationMin >= 60 ? `${(r.durationMin / 60).toFixed(1)}h` : `${r.durationMin}m`}</td>
                        <td className="mono" style={{ color: "var(--text-2)" }}>{eng?.initials ?? "—"}</td>
                        <td className="mono" style={{ color: "var(--text-3)" }}>
                          <TimeAgo iso={r.startedISO} live={false} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Surface>

          <Surface title="Tickets">
            {tx.length === 0 ? (
              <div className="empty">No tickets recorded.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {tx.map((t) => (
                    <tr key={t.id}>
                      <td className="id-cell">{t.id}</td>
                      <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.title}
                      </td>
                      <td>
                        <Chip tone={
                          t.severity === "critical" ? "danger" :
                          t.severity === "high" ? "warning" :
                          t.severity === "medium" ? "info" : "neutral"
                        }>{t.severity}</Chip>
                      </td>
                      <td><Chip tone="outline">{t.status.replace("_", "-")}</Chip></td>
                      <td className="mono" style={{ color: "var(--text-3)" }}>
                        <TimeAgo iso={t.createdISO} live={false} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Surface>

          <Surface title="RMA history">
            {rmas.length === 0 ? (
              <div className="empty">No RMA records.</div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>RMA ID</th>
                    <th>Component</th>
                    <th>Vendor</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Days open</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {rmas.map((r) => (
                    <tr key={r.id}>
                      <td className="id-cell">{r.id}</td>
                      <td>{r.componentName}</td>
                      <td style={{ color: "var(--text-2)" }}>{r.vendor}</td>
                      <td><Chip tone="outline">{r.status}</Chip></td>
                      <td className="num">{r.daysOpen}</td>
                      <td style={{ color: "var(--text-3)", fontSize: 11.5, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Surface>
        </div>

        {/* SIDE COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Surface title="Identity">
            <div style={{ padding: "2px 0" }}>
              <Field k="ID" v={server.id} mono />
              <Field k="Hostname" v={server.hostname} mono />
              <Field k="Serial" v={server.serial} mono />
              <Field k="Vendor" v={server.vendor} />
              <Field k="Model" v={server.model} />
              <Field k="Generation" v={server.generation} mono />
              {platform && <Field k="Platform" v={platform.name} />}
              <Field k="Rack" v={server.rack} mono />
              <Field k="RU" v={`U${server.ruStart}–U${server.ruStart + server.ruHeight - 1} (${server.ruHeight}U)`} mono />
              <Field k="Owner" v={owner?.name ?? ""} />
            </div>
          </Surface>

          <Surface title="Hardware">
            <div style={{ padding: "2px 0" }}>
              <Field k="CPU" v={server.cpu} small />
              <Field k="Sockets" v={server.cpuSockets.toString()} mono />
              <Field k="Memory" v={server.ramConfig} small />
              <Field k="Storage" v={server.storage} small />
              <Field k="NIC" v={server.nic} small />
              {server.gpu && <Field k="GPU" v={server.gpu} small />}
            </div>
          </Surface>

          <Surface title="Firmware">
            <div style={{ padding: "2px 0" }}>
              <Field k="BIOS" v={server.biosVersion} mono />
              <Field k="BMC" v={server.bmcVersion} mono />
            </div>
          </Surface>

          <Surface title="Runtime">
            <div style={{ padding: "2px 0" }}>
              <Field k="Status" v={server.status} mono />
              <Field
                k="Thermal"
                v={`${server.thermalC} °C`}
                mono
                tone={server.thermalC >= 85 ? "danger" : server.thermalC >= 75 ? "warning" : undefined}
              />
              <Field k="Power" v={`${server.powerW} W`} mono />
              <Field k="Uptime" v={`${server.uptimeDays} d`} mono />
              <Field k="Last boot" v={server.lastBootISO.slice(0, 19).replace("T", " ") + "Z"} mono small />
            </div>
          </Surface>

          {bom.length > 0 && (
            <Surface title="Bill of Materials" flush>
              <div style={{ padding: "0 0 4px" }}>
                {bom.map((i) => {
                  const c = componentById(i.componentId);
                  return (
                    <div
                      key={i.id}
                      style={{
                        padding: "6px 14px",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 11.5,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Chip tone="outline" mono>{c?.kind ?? "?"}</Chip>
                        <span style={{ flex: 1, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c?.name ?? i.componentId}
                        </span>
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>
                        {i.slot ? `${i.slot} · ` : ""}{i.serial} · {i.state}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Surface>
          )}

          {server.notes && (
            <Surface title="Notes">
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.55 }}>
                {server.notes}
              </div>
            </Surface>
          )}
        </div>
      </div>

      {/* Footer — visible in print, used for page breaks */}
      <div className="report-footer">
        <div className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 18, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          Blyber server report · {server.id} · {server.hostname} · Generated {generatedAtUTC ?? "—"}
        </div>
      </div>
    </main>
  );
}

function Field({
  k,
  v,
  mono,
  small,
  tone,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
  small?: boolean;
  tone?: "danger" | "warning";
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px minmax(0, 1fr)",
        gap: 10,
        padding: "5px 14px",
        fontSize: small ? 11 : 12,
        alignItems: "center",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>{k}</span>
      <span
        className={mono ? "mono" : ""}
        style={{
          color:
            tone === "danger" ? "var(--danger)" :
            tone === "warning" ? "var(--warning)" :
            "var(--text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {v}
      </span>
    </div>
  );
}
