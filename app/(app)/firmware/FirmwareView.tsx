"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Download,
  RotateCcw,
  Search,
  Send,
} from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import type { FirmwareEntry, FwCategory } from "@/lib/types";
import { Stagger, StaggerItem, PulseDot } from "@/components/ui/motion";
import { motion } from "framer-motion";
import { scheduleFirmwareDeployAction } from "@/lib/db-mutations";

const TABS: { value: FwCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "BIOS", label: "BIOS" },
  { value: "BMC", label: "BMC" },
  { value: "NIC", label: "NIC" },
  { value: "RAID", label: "RAID" },
  { value: "PSU", label: "PSU" },
  { value: "GPU", label: "GPU" },
  { value: "SSD", label: "SSD" },
];

export function FirmwareView({ firmware }: { firmware: FirmwareEntry[] }) {
  const [cat, setCat] = useState<FwCategory | "all">("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: firmware.length };
    for (const f of firmware) c[f.category] = (c[f.category] || 0) + 1;
    return c;
  }, [firmware]);

  const critical = firmware.filter((f) => f.critical);
  const filtered = useMemo(() => {
    return firmware.filter((f) => {
      if (cat !== "all" && f.category !== cat) return false;
      if (q) {
        const n = q.toLowerCase();
        if (!f.name.toLowerCase().includes(n) && !f.vendor.toLowerCase().includes(n)) {
          return false;
        }
      }
      return true;
    });
  }, [cat, q, firmware]);

  return (
    <main className="page">
      <PageHead
        title="Firmware Repository"
        meta={
          <>
            <span className="mono">{firmware.length} entries</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono" style={{ color: "var(--danger)" }}>
              {critical.length} critical
            </span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">12 vendors</span>
          </>
        }
        actions={
          <button className="btn">
            <Download size={13} />
            Sync vendor feeds
          </button>
        }
      />

      {critical.length > 0 && (
        <motion.div
          className="banner banner-danger"
          style={{ marginBottom: 10 }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.2, 0, 0.2, 1], delay: 0.06 }}
        >
          <PulseDot color="var(--danger)" size={8} />
          <AlertTriangle size={14} />
          <span>
            <strong>{critical.length} critical firmware update{critical.length !== 1 ? "s" : ""} pending</strong> —{" "}
            {critical.map((c) => c.name).slice(0, 3).join(", ")}
            {critical.length > 3 ? `, +${critical.length - 3} more` : ""}
          </span>
          <div className="banner-actions">
            <button className="btn">Review</button>
            <button className="btn btn-primary">Schedule deploy</button>
          </div>
        </motion.div>
      )}

      <Surface flush>
        <div className="toolbar">
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.value}
                className={cn("tab", cat === t.value && "active")}
                onClick={() => setCat(t.value)}
              >
                {t.label}
                <span className="tab-count">{counts[t.value] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="toolbar-sep" />
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, vendor..."
            />
          </div>
          <div className="toolbar-spacer" />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
            {filtered.length} shown
          </span>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Firmware</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Current</th>
              <th>Latest</th>
              <th>Released</th>
              <th style={{ textAlign: "right" }}>Servers</th>
              <th style={{ textAlign: "right" }}>Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <Stagger as="tbody">
            {filtered.map((f) => {
              const versionColor =
                f.state === "critical"
                  ? "var(--danger)"
                  : f.state === "behind"
                  ? "var(--warning)"
                  : "var(--success)";
              return (
                <StaggerItem as="tr" key={f.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {f.critical && (
                        <AlertTriangle size={11} style={{ color: "var(--danger)" }} />
                      )}
                      <span style={{ fontWeight: 500 }}>{f.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-2)" }}>{f.vendor}</td>
                  <td>
                    <Chip tone="outline">{f.category}</Chip>
                  </td>
                  <td className="mono" style={{ color: "var(--text-2)" }}>
                    {f.currentVersion}
                  </td>
                  <td className="mono" style={{ color: versionColor, fontWeight: 600 }}>
                    {f.latestVersion}
                  </td>
                  <td className="mono" style={{ color: "var(--text-3)" }}>
                    {new Date(f.releasedISO).toISOString().slice(0, 10)}
                  </td>
                  <td className="num">{f.appliesTo}</td>
                  <td className="num">{f.fileSizeMB} MB</td>
                  <td>
                    {f.state === "matching" ? (
                      <span style={{ color: "var(--text-3)", fontSize: 11 }} className="mono">
                        up to date
                      </span>
                    ) : f.state === "critical" ? (
                      <button
                        className="btn btn-primary"
                        style={{ padding: "3px 8px", fontSize: 11 }}
                        onClick={() => scheduleFirmwareDeployAction(f.id)}
                      >
                        <Send size={11} />
                        Deploy now
                      </button>
                    ) : (
                      <span style={{ display: "inline-flex", gap: 4 }}>
                        <button
                          className="btn"
                          style={{ padding: "3px 8px", fontSize: 11 }}
                          onClick={() => scheduleFirmwareDeployAction(f.id)}
                        >
                          <CalendarClock size={11} />
                          Schedule
                        </button>
                        <button className="btn btn-ghost" style={{ padding: "3px 6px", fontSize: 11 }}>
                          <RotateCcw size={11} />
                        </button>
                      </span>
                    )}
                  </td>
                </StaggerItem>
              );
            })}
          </Stagger>
        </table>
      </Surface>
    </main>
  );
}
