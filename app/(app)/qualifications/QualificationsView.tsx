"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, ShieldCheck, GitCompareArrows } from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { KPI } from "@/components/ui/KPI";
import type {
  CampaignStatus,
  Component,
  Engineer,
  Platform,
  Qualification,
  QualificationCampaign,
  QualificationState,
} from "@/lib/types";
import { cn } from "@/lib/cn";
import { Stagger, StaggerItem } from "@/components/ui/motion";

type Tab = "campaigns" | "qualifications";

function statusTone(s: CampaignStatus) {
  return s === "active" ? "info"
    : s === "passed" ? "success"
    : s === "failed" ? "danger"
    : s === "blocked" ? "danger"
    : s === "planning" ? "neutral"
    : s === "deferred" ? "warning"
    : "neutral";
}
function qualTone(s: QualificationState) {
  return s === "qualified" ? "success"
    : s === "limited" ? "warning"
    : s === "unsupported" ? "danger"
    : s === "pending" ? "info"
    : "neutral";
}

const CAMPAIGN_STATUSES: (CampaignStatus | "all")[] = ["all", "active", "planning", "blocked", "passed", "failed", "deferred"];
const QUAL_STATES: (QualificationState | "all")[] = ["all", "qualified", "limited", "pending", "unsupported", "untested"];

export function QualificationsView({
  campaigns,
  qualifications,
  catalog,
  platforms,
  engineers,
}: {
  campaigns: QualificationCampaign[];
  qualifications: Qualification[];
  catalog: Component[];
  platforms: Platform[];
  engineers: Engineer[];
}) {
  const componentById = (id: string) => catalog.find((c) => c.id === id);
  const platformById = (id: string) => platforms.find((p) => p.id === id);
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus | "all">("all");
  const [qualState, setQualState] = useState<QualificationState | "all">("all");
  const [q, setQ] = useState("");

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (campaignStatus !== "all" && c.status !== campaignStatus) return false;
      if (q) {
        const n = q.toLowerCase();
        if (!c.name.toLowerCase().includes(n) && !c.id.toLowerCase().includes(n)) return false;
      }
      return true;
    });
  }, [campaignStatus, q, campaigns]);

  const filteredQualifications = useMemo(() => {
    return qualifications.filter((qq) => {
      if (qualState !== "all" && qq.state !== qualState) return false;
      if (q) {
        const n = q.toLowerCase();
        const c = catalog.find((x) => x.id === qq.componentId);
        const p = platforms.find((x) => x.id === qq.platformId);
        if (
          !qq.id.toLowerCase().includes(n) &&
          !(c?.name.toLowerCase().includes(n)) &&
          !(p?.name.toLowerCase().includes(n))
        ) return false;
      }
      return true;
    });
  }, [qualState, q, qualifications, catalog, platforms]);

  const campaignKpi = useMemo(() => ({
    active: campaigns.filter((c) => c.status === "active").length,
    planning: campaigns.filter((c) => c.status === "planning").length,
    blocked: campaigns.filter((c) => c.status === "blocked").length,
    passed: campaigns.filter((c) => c.status === "passed").length,
  }), [campaigns]);

  const qualKpi = useMemo(() => ({
    qualified: qualifications.filter((q) => q.state === "qualified").length,
    limited: qualifications.filter((q) => q.state === "limited").length,
    pending: qualifications.filter((q) => q.state === "pending").length,
    total: qualifications.length,
  }), [qualifications]);

  return (
    <main className="page">
      <PageHead
        title="Qualifications"
        meta={
          <>
            <span className="mono">{campaigns.length} campaigns</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{qualifications.length} qualification records</span>
          </>
        }
        actions={
          <button className="btn btn-primary">
            <Plus size={13} />
            Open campaign
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
        <KPI label="Active campaigns" value={<span style={{ color: "var(--info)" }}>{campaignKpi.active}</span>} foot={`${campaignKpi.planning} planning`} />
        <KPI label="Blocked" value={<span style={{ color: "var(--danger)" }}>{campaignKpi.blocked}</span>} foot="needs unblocker" />
        <KPI label="Qualified (total)" value={<span style={{ color: "var(--success)" }}>{qualKpi.qualified}</span>} foot={`of ${qualKpi.total} tracked`} />
        <KPI label="Limited / pending" value={
          <>
            <span style={{ color: "var(--warning)" }}>{qualKpi.limited}</span>
            <span style={{ color: "var(--text-3)", margin: "0 4px" }}>/</span>
            <span style={{ color: "var(--info)" }}>{qualKpi.pending}</span>
          </>
        } foot="watch list" />
      </div>

      <Surface flush>
        <div className="toolbar">
          <div className="tabs">
            <button className={cn("tab", tab === "campaigns" && "active")} onClick={() => setTab("campaigns")}>
              <ShieldCheck size={12} />
              Campaigns
              <span className="tab-count">{campaigns.length}</span>
            </button>
            <button className={cn("tab", tab === "qualifications" && "active")} onClick={() => setTab("qualifications")}>
              <GitCompareArrows size={12} />
              Qualifications
              <span className="tab-count">{qualifications.length}</span>
            </button>
          </div>
          <div className="toolbar-sep" />

          {tab === "campaigns" ? (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {CAMPAIGN_STATUSES.map((s) => (
                <button key={s} className={cn("filter-chip", campaignStatus === s && "active")} onClick={() => setCampaignStatus(s)}>
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {QUAL_STATES.map((s) => (
                <button key={s} className={cn("filter-chip", qualState === s && "active")} onClick={() => setQualState(s)}>
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          )}

          <div className="toolbar-sep" />
          <div className="toolbar-search">
            <Search size={13} className="toolbar-search-icon" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ID, component, platform..."
            />
          </div>
          <div className="toolbar-spacer" />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
            {tab === "campaigns" ? filteredCampaigns.length : filteredQualifications.length} shown
          </span>
        </div>

        {tab === "campaigns" ? (
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Component → Platform</th>
                <th>Status</th>
                <th>Owner</th>
                <th style={{ textAlign: "right" }}>Runs</th>
                <th>Target</th>
              </tr>
            </thead>
            <Stagger as="tbody">
              {filteredCampaigns.map((c) => {
                const comp = componentById(c.componentId);
                const plat = platformById(c.platformId);
                const owner = engineerById(c.ownerEngineerId);
                return (
                  <StaggerItem as="tr" key={c.id}>
                    <td className="id-cell">
                      <Link href={`/qualifications/${c.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {c.id}
                      </Link>
                    </td>
                    <td>
                      <Link href={`/qualifications/${c.id}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                        {c.name}
                      </Link>
                    </td>
                    <td style={{ fontSize: 11.5, color: "var(--text-2)" }}>
                      {comp?.shortName ?? comp?.name ?? c.componentId}
                      <span style={{ color: "var(--text-3)", margin: "0 6px" }}>→</span>
                      {plat?.name ?? c.platformId}
                    </td>
                    <td>
                      <Chip tone={statusTone(c.status)}>{c.status}</Chip>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Avatar name={owner?.name ?? "?"} size="sm" />
                        <span style={{ fontSize: 11.5 }}>{owner?.initials}</span>
                      </div>
                    </td>
                    <td className="num">{c.runIds.length}</td>
                    <td className="mono" style={{ color: "var(--text-3)" }}>
                      {c.targetCompletionISO ? <TimeAgo iso={c.targetCompletionISO} /> : "—"}
                    </td>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </table>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Component</th>
                <th>Platform</th>
                <th>State</th>
                <th>Signed off</th>
                <th>Limitations</th>
                <th style={{ textAlign: "right" }}>Runs</th>
              </tr>
            </thead>
            <Stagger as="tbody">
              {filteredQualifications.map((qq) => {
                const comp = componentById(qq.componentId);
                const plat = platformById(qq.platformId);
                const signedBy = qq.signedOffByEngineerId ? engineerById(qq.signedOffByEngineerId) : undefined;
                return (
                  <StaggerItem as="tr" key={qq.id}>
                    <td className="id-cell">{qq.id}</td>
                    <td>
                      <Link href={`/components/${qq.componentId}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                        {comp?.name ?? qq.componentId}
                      </Link>
                      {comp?.version && (
                        <span className="mono" style={{ marginLeft: 6, color: "var(--text-3)", fontSize: 10.5 }}>
                          {comp.version}
                        </span>
                      )}
                    </td>
                    <td>
                      <Link href={`/platforms/${qq.platformId}`} style={{ color: "var(--text-2)", textDecoration: "none", fontSize: 11.5 }}>
                        {plat?.name ?? qq.platformId}
                      </Link>
                    </td>
                    <td><Chip tone={qualTone(qq.state)}>{qq.state}</Chip></td>
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
                    <td style={{ color: "var(--text-3)", fontSize: 11.5, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {qq.limitations ?? "—"}
                    </td>
                    <td className="num">{qq.supportingRunIds.length}</td>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </table>
        )}
      </Surface>
    </main>
  );
}
