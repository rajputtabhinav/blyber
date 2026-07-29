"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Server,
  Ticket as TicketIcon,
  BookOpen,
  Users,
  GalleryHorizontalEnd,
  Cpu,
  GitCompareArrows,
  FlaskConical,
  PackageOpen,
  LayoutDashboard,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  Hash,
  Boxes,
  Layers,
  ShieldCheck,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type {
  ServerNode,
  Ticket,
  KBArticle,
  Engineer,
  Rack,
  Component,
  Platform,
  QualificationCampaign,
  TestPlan,
} from "@/lib/types";

interface CmdItem {
  id: string;
  label: string;
  kind:
    | "route"
    | "server"
    | "ticket"
    | "kb"
    | "engineer"
    | "rack"
    | "component"
    | "platform"
    | "campaign"
    | "plan"
    | "action";
  href?: string;
  sub?: string;
  Icon: LucideIcon;
}

const ROUTE_ITEMS: CmdItem[] = [
  { id: "r:dashboard", label: "Dashboard", href: "/", kind: "route", Icon: LayoutDashboard, sub: "Overview" },
  { id: "r:tickets", label: "Tickets", href: "/tickets", kind: "route", Icon: TicketIcon, sub: "Operations" },
  { id: "r:rma", label: "RMA Tracking", href: "/rma", kind: "route", Icon: PackageOpen, sub: "Operations" },
  { id: "r:engineers", label: "Engineers", href: "/engineers", kind: "route", Icon: Users, sub: "Operations" },
  { id: "r:inventory", label: "Server Inventory", href: "/inventory", kind: "route", Icon: Server, sub: "Hardware" },
  { id: "r:racks", label: "Rack Layout", href: "/racks", kind: "route", Icon: GalleryHorizontalEnd, sub: "Hardware" },
  { id: "r:components", label: "Components", href: "/components", kind: "route", Icon: Boxes, sub: "Hardware" },
  { id: "r:platforms", label: "Platforms", href: "/platforms", kind: "route", Icon: Layers, sub: "Hardware" },
  { id: "r:firmware", label: "Firmware Repository", href: "/firmware", kind: "route", Icon: Cpu, sub: "Hardware" },
  { id: "r:plans", label: "Test Plans", href: "/plans", kind: "route", Icon: ClipboardList, sub: "Validation" },
  { id: "r:qualifications", label: "Qualifications", href: "/qualifications", kind: "route", Icon: ShieldCheck, sub: "Validation" },
  { id: "r:compatibility", label: "Compatibility Matrix", href: "/compatibility", kind: "route", Icon: GitCompareArrows, sub: "Validation" },
  { id: "r:reports", label: "Reports & Validation", href: "/reports", kind: "route", Icon: FlaskConical, sub: "Validation" },
  { id: "r:server-reports", label: "Server Reports (PDF / Excel)", href: "/reports/servers", kind: "route", Icon: FlaskConical, sub: "Validation" },
  { id: "r:kb", label: "Knowledge Base", href: "/kb", kind: "route", Icon: BookOpen, sub: "Validation" },
];

function score(q: string, label: string, sub?: string): number {
  if (!q) return 0;
  const Q = q.toLowerCase();
  const L = label.toLowerCase();
  if (L === Q) return 1000;
  if (L.startsWith(Q)) return 500;
  if (L.includes(Q)) return 200;
  if (sub && sub.toLowerCase().includes(Q)) return 50;
  return 0;
}

interface CommandPaletteProps {
  servers: ServerNode[];
  tickets: Ticket[];
  kbArticles: KBArticle[];
  engineers: Engineer[];
  racks: Rack[];
  catalog: Component[];
  platforms: Platform[];
  campaigns: QualificationCampaign[];
  testPlans: TestPlan[];
}

export function CommandPalette({
  servers,
  tickets,
  kbArticles,
  engineers,
  racks,
  catalog,
  platforms,
  campaigns,
  testPlans,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Global hotkey
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      // forward-slash to focus when nothing else is focused
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (!open && !inField && e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      // Defer to ensure modal mounted
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo<CmdItem[]>(() => {
    const all: CmdItem[] = [
      ...ROUTE_ITEMS,
      ...tickets.map<CmdItem>((t) => ({
        id: `t:${t.id}`,
        label: `${t.id} — ${t.title}`,
        href: `/tickets/${t.id}`,
        kind: "ticket",
        sub: `${t.serverId} · ${t.severity}`,
        Icon: TicketIcon,
      })),
      ...servers.map<CmdItem>((s) => ({
        id: `s:${s.id}`,
        label: `${s.id} — ${s.hostname}`,
        href: `/inventory/${s.id}`,
        kind: "server",
        sub: `${s.vendor} ${s.model} · ${s.rack}`,
        Icon: Server,
      })),
      ...kbArticles.map<CmdItem>((a) => ({
        id: `k:${a.id}`,
        label: `${a.id} — ${a.title}`,
        href: `/kb`,
        kind: "kb",
        sub: a.category,
        Icon: BookOpen,
      })),
      ...engineers.map<CmdItem>((e) => ({
        id: `e:${e.id}`,
        label: e.name,
        href: `/engineers`,
        kind: "engineer",
        sub: `${e.team} · ${e.activeTickets} open`,
        Icon: Users,
      })),
      ...racks.map<CmdItem>((r) => ({
        id: `rk:${r.id}`,
        label: r.id,
        href: `/racks`,
        kind: "rack",
        sub: r.site,
        Icon: GalleryHorizontalEnd,
      })),
      ...catalog.map<CmdItem>((c) => ({
        id: `c:${c.id}`,
        label: `${c.name}${c.version ? ` ${c.version}` : ""}`,
        href: `/components/${c.id}`,
        kind: "component",
        sub: `${c.kind} · ${c.vendor}`,
        Icon: Boxes,
      })),
      ...platforms.map<CmdItem>((p) => ({
        id: `p:${p.id}`,
        label: p.name,
        href: `/platforms/${p.id}`,
        kind: "platform",
        sub: `${p.vendor} · ${p.generation}`,
        Icon: Layers,
      })),
      ...campaigns.map<CmdItem>((c) => ({
        id: `qc:${c.id}`,
        label: `${c.id} — ${c.name}`,
        href: `/qualifications/${c.id}`,
        kind: "campaign",
        sub: c.status,
        Icon: ShieldCheck,
      })),
      ...testPlans.map<CmdItem>((p) => ({
        id: `tp:${p.id}`,
        label: `${p.name} v${p.version}`,
        href: `/plans/${p.id}`,
        kind: "plan",
        sub: `${p.scope} · ${p.status}`,
        Icon: ClipboardList,
      })),
    ];

    if (!q.trim()) {
      // Show all routes + a sample of entities
      return [...ROUTE_ITEMS, ...all.filter((i) => i.kind !== "route").slice(0, 24)];
    }

    return all
      .map((i) => ({ i, s: score(q, i.label, i.sub) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((x) => x.i);
  }, [q, servers, tickets, kbArticles, engineers, racks, catalog, platforms, campaigns, testPlans]);

  // Clamp active when items change
  useEffect(() => {
    if (active >= items.length) setActive(Math.max(0, items.length - 1));
  }, [items, active]);

  // Scroll active into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLDivElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  function go(it: CmdItem) {
    if (it.href) router.push(it.href);
    setOpen(false);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = items[active];
      if (it) go(it);
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Command palette"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        style={{
          width: 560,
          maxWidth: "92vw",
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: 8,
          boxShadow: "0 30px 70px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Search size={14} style={{ color: "var(--text-3)" }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search tickets, servers, KB, engineers, racks…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontSize: 13.5,
              fontFamily: "inherit",
            }}
          />
          <span
            className="mono"
            style={{
              fontSize: 10.5,
              color: "var(--text-3)",
              padding: "2px 5px",
              border: "1px solid var(--border)",
              borderRadius: 3,
            }}
          >
            esc
          </span>
        </div>

        <div ref={listRef} style={{ maxHeight: "55vh", overflowY: "auto" }}>
          {items.length === 0 ? (
            <div className="empty">No matches.</div>
          ) : (
            items.map((it, idx) => {
              const Icon = it.Icon;
              const active2 = idx === active;
              return (
                <div
                  key={it.id}
                  data-idx={idx}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => go(it)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "20px 1fr auto",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                    background: active2 ? "var(--accent-dim)" : "transparent",
                    borderLeft: active2 ? "2px solid var(--accent)" : "2px solid transparent",
                    fontSize: 12.5,
                  }}
                >
                  <Icon size={13} style={{ color: active2 ? "var(--accent-2)" : "var(--text-3)" }} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--text)",
                      }}
                    >
                      {it.label}
                    </div>
                    {it.sub && (
                      <div
                        className="mono"
                        style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 1 }}
                      >
                        {it.sub}
                      </div>
                    )}
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      color: "var(--text-3)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {it.kind}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "6px 12px",
            borderTop: "1px solid var(--border)",
            background: "rgba(255,255,255,0.012)",
            fontSize: 10.5,
            color: "var(--text-3)",
          }}
        >
          <Hint icon={<ArrowUp size={10} />}>up</Hint>
          <Hint icon={<ArrowDown size={10} />}>down</Hint>
          <Hint icon={<CornerDownLeft size={10} />}>open</Hint>
          <Hint icon={<Hash size={10} />}>esc to close</Hint>
          <span style={{ marginLeft: "auto" }} className="mono">
            {items.length} result{items.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function Hint({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 14,
          height: 14,
          borderRadius: 3,
          background: "rgba(255,255,255,0.04)",
          color: "var(--text-2)",
        }}
      >
        {icon}
      </span>
      <span>{children}</span>
    </span>
  );
}
