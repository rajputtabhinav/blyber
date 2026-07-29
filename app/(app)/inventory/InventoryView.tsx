"use client";

import { useMemo, useState } from "react";
import { Search, Filter, Download, Plus, ChevronDown } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { Engineer, ServerStatus, ServerNode } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const STATUS_OPTIONS: { value: ServerStatus | "all"; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "online", label: "Online" },
  { value: "validating", label: "Validating" },
  { value: "fault", label: "Fault" },
  { value: "maintenance", label: "Maintenance" },
  { value: "offline", label: "Offline" },
];

function StatusChip({ status }: { status: ServerStatus }) {
  const map: Record<ServerStatus, { tone: "success" | "info" | "danger" | "warning" | "neutral"; label: string; color: string }> = {
    online: { tone: "success", label: "online", color: "var(--success)" },
    validating: { tone: "info", label: "validating", color: "var(--info)" },
    fault: { tone: "danger", label: "fault", color: "var(--danger)" },
    maintenance: { tone: "warning", label: "maintenance", color: "var(--warning)" },
    offline: { tone: "neutral", label: "offline", color: "var(--text-3)" },
  };
  const m = map[status];
  return (
    <Chip tone={m.tone} dot dotColor={m.color}>
      {m.label}
    </Chip>
  );
}

export function InventoryView({
  servers,
  engineers,
}: {
  servers: ServerNode[];
  engineers: Engineer[];
}) {
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ServerStatus | "all">("all");
  const [vendor, setVendor] = useState<string>("all");
  const [selected, setSelected] = useState<ServerNode | null>(servers[0] ?? null);

  const vendors = useMemo(
    () => Array.from(new Set(servers.map((s) => s.vendor))),
    [servers],
  );

  const filtered = useMemo(() => {
    return servers.filter((s) => {
      if (status !== "all" && s.status !== status) return false;
      if (vendor !== "all" && s.vendor !== vendor) return false;
      if (q) {
        const needle = q.toLowerCase();
        if (
          !s.id.toLowerCase().includes(needle) &&
          !s.hostname.toLowerCase().includes(needle) &&
          !s.model.toLowerCase().includes(needle) &&
          !s.serial.toLowerCase().includes(needle) &&
          !s.cpu.toLowerCase().includes(needle)
        )
          return false;
      }
      return true;
    });
  }, [q, status, vendor, servers]);

  return (
    <main className="page">
      <PageHead
        title="Server Inventory"
        meta={
          <>
            <span className="mono">{filtered.length} of {servers.length} servers</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">10 racks · 4 vendors</span>
          </>
        }
        actions={
          <>
            <button className="btn">
              <Download size={13} />
              Export CSV
            </button>
            <button className="btn btn-primary">
              <Plus size={13} />
              Register server
            </button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: selected ? "minmax(0, 1fr) 380px" : "minmax(0, 1fr)", gap: 10 }}>
        <Surface flush>
          <div className="toolbar">
            <div className="toolbar-search">
              <Search size={13} className="toolbar-search-icon" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search ID, hostname, model, CPU..."
              />
            </div>
            <div className="toolbar-sep" />
            <Select<ServerStatus | "all">
              value={status}
              onChange={setStatus}
              ariaLabel="Filter by status"
              options={STATUS_OPTIONS}
            />
            <Select<string>
              value={vendor}
              onChange={setVendor}
              ariaLabel="Filter by vendor"
              options={[
                { value: "all", label: "All vendors" },
                ...vendors.map((v) => ({ value: v, label: v })),
              ]}
            />
            <button className="btn">
              <Filter size={13} />
              Rack filter
            </button>
            <div className="toolbar-spacer" />
            <span style={{ fontSize: 11, color: "var(--text-3)" }} className="mono">
              sorted by ID
            </span>
            <ChevronDown size={12} style={{ color: "var(--text-3)" }} />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hostname / Model</th>
                  <th>Gen</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Rack / RU</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Therm</th>
                  <th>Last boot</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const owner = engineerById(s.owner);
                  const therm = s.thermalC;
                  const thermColor =
                    therm >= 85 ? "var(--danger)" :
                    therm >= 75 ? "var(--warning)" :
                    therm > 30 ? "var(--text)" :
                    "var(--text-3)";
                  return (
                    <tr
                      key={s.id}
                      className={cn(selected?.id === s.id && "selected")}
                      onClick={() => setSelected(s)}
                      onDoubleClick={() => router.push(`/inventory/${s.id}`)}
                      title="Double-click to open detail"
                    >
                      <td className="id-cell">{s.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }} className="mono">
                          {s.hostname}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                          {s.vendor} {s.model}
                        </div>
                      </td>
                      <td className="mono" style={{ color: "var(--text-2)" }}>
                        {s.generation}
                      </td>
                      <td>
                        <span style={{ fontSize: 11.5 }}>
                          {s.cpu.replace(/\(.*\)/, "").trim()}
                        </span>
                        <div className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                          {s.cpu.match(/\(.*\)/)?.[0]?.replace(/[()]/g, "")}
                        </div>
                      </td>
                      <td className="mono">{s.ramGB} GB</td>
                      <td className="mono" style={{ color: "var(--text-2)" }}>
                        {s.rack}
                        <span style={{ color: "var(--text-3)" }}>
                          {" "}· U{s.ruStart}–U{s.ruStart + s.ruHeight - 1}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Avatar name={owner?.name ?? "??"} size="sm" />
                          <span style={{ fontSize: 11.5 }}>{owner?.initials}</span>
                        </div>
                      </td>
                      <td>
                        <StatusChip status={s.status} />
                      </td>
                      <td className="mono" style={{ textAlign: "right", color: thermColor }}>
                        {s.status === "offline" || s.status === "maintenance" ? "—" : `${s.thermalC}°C`}
                      </td>
                      <td className="mono" style={{ color: "var(--text-3)" }}>
                        <TimeAgo iso={s.lastBootISO} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Surface>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.16, ease: [0.2, 0, 0.2, 1] }}
            >
              <ServerSidePanel server={selected} onClose={() => setSelected(null)} engineers={engineers} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ServerSidePanel({
  server,
  onClose,
  engineers,
}: {
  server: ServerNode;
  onClose: () => void;
  engineers: Engineer[];
}) {
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const owner = engineerById(server.owner);
  return (
    <div className="side-panel" style={{ position: "sticky", top: 60, alignSelf: "start" }}>
      <div className="surface-head">
        <span className="mono" style={{ fontWeight: 600, fontSize: 12 }}>
          {server.id}
        </span>
        <span className="chip chip-neutral" style={{ marginLeft: 4 }}>
          {server.vendor}
        </span>
        <Link
          href={`/inventory/${server.id}`}
          className="btn btn-ghost"
          style={{ marginLeft: "auto", padding: "2px 6px", fontSize: 11 }}
        >
          <ExternalLink size={11} />
          Open
        </Link>
        <button
          className="btn btn-ghost"
          style={{ padding: "2px 6px", fontSize: 11 }}
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="side-panel-section">
        <div className="side-panel-title">Hardware</div>
        <div className="side-panel-row"><span className="k">Hostname</span><span className="v mono">{server.hostname}</span></div>
        <div className="side-panel-row"><span className="k">Model</span><span className="v">{server.model}</span></div>
        <div className="side-panel-row"><span className="k">Generation</span><span className="v mono">{server.generation}</span></div>
        <div className="side-panel-row"><span className="k">Serial</span><span className="v mono">{server.serial}</span></div>
        <div className="side-panel-row"><span className="k">CPU</span><span className="v" style={{ fontSize: 11.5 }}>{server.cpu}</span></div>
        <div className="side-panel-row"><span className="k">Memory</span><span className="v">{server.ramConfig}</span></div>
        <div className="side-panel-row"><span className="k">Storage</span><span className="v" style={{ fontSize: 11.5 }}>{server.storage}</span></div>
        <div className="side-panel-row"><span className="k">NIC</span><span className="v" style={{ fontSize: 11.5 }}>{server.nic}</span></div>
        {server.gpu && (
          <div className="side-panel-row"><span className="k">GPU</span><span className="v" style={{ fontSize: 11.5 }}>{server.gpu}</span></div>
        )}
      </div>

      <div className="side-panel-section">
        <div className="side-panel-title">Location & Owner</div>
        <div className="side-panel-row"><span className="k">Rack</span><span className="v mono">{server.rack}</span></div>
        <div className="side-panel-row"><span className="k">RU</span><span className="v mono">U{server.ruStart}–U{server.ruStart + server.ruHeight - 1} ({server.ruHeight}U)</span></div>
        <div className="side-panel-row">
          <span className="k">Owner</span>
          <span className="v">
            <Avatar name={owner?.name ?? "??"} size="sm" />
            <span>{owner?.name}</span>
          </span>
        </div>
        <div className="side-panel-row"><span className="k">Team</span><span className="v mono">{owner?.team}</span></div>
      </div>

      <div className="side-panel-section">
        <div className="side-panel-title">Runtime</div>
        <div className="side-panel-row"><span className="k">Status</span><span className="v"><StatusChip status={server.status} /></span></div>
        <div className="side-panel-row"><span className="k">Thermal</span><span className="v mono">{server.thermalC}°C</span></div>
        <div className="side-panel-row"><span className="k">Power</span><span className="v mono">{server.powerW} W</span></div>
        <div className="side-panel-row"><span className="k">Uptime</span><span className="v mono">{server.uptimeDays}d</span></div>
        <div className="side-panel-row"><span className="k">Last boot</span><span className="v mono">{new Date(server.lastBootISO).toUTCString().slice(5, 22)}</span></div>
      </div>

      <div className="side-panel-section">
        <div className="side-panel-title">Firmware</div>
        <div className="side-panel-row"><span className="k">BIOS</span><span className="v mono">{server.biosVersion}</span></div>
        <div className="side-panel-row"><span className="k">BMC</span><span className="v mono">{server.bmcVersion}</span></div>
      </div>

      <div className="side-panel-section">
        <div className="side-panel-title">Recent events</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { t: "2h", txt: "ipmi sensor poll — all OK" },
            { t: "6h", txt: "validation run VR-3091 PASS" },
            { t: "1d", txt: "BIOS update queued" },
            { t: "3d", txt: "power cycled by eng-02" },
            { t: "5d", txt: "rack repositioned U1 → U3" },
          ].map((e, i) => (
            <div key={i} style={{ display: "flex", fontSize: 11.5, gap: 8 }}>
              <span className="mono" style={{ color: "var(--text-3)", width: 28 }}>
                {e.t}
              </span>
              <span style={{ color: "var(--text-2)", flex: 1 }}>{e.txt}</span>
            </div>
          ))}
        </div>
      </div>

      {server.notes && (
        <div className="side-panel-section">
          <div className="side-panel-title">Notes</div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
            {server.notes}
          </div>
        </div>
      )}
    </div>
  );
}
