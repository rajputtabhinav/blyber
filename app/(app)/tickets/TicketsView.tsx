"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bookmark,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Tag as TagIcon,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip, SevDot } from "@/components/ui/Chip";
import { AssigneePicker } from "@/components/ui/AssigneePicker";
import { cn } from "@/lib/cn";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { Engineer, Severity, Ticket } from "@/lib/types";
import { Stagger, StaggerItem, PulseDot } from "@/components/ui/motion";
import { useQueryState } from "@/lib/useQueryState";
import { useSavedViews } from "@/lib/useSavedViews";
import {
  resolveTicketsAction,
  assignTicketAction,
  assignTicketsToMeAction,
  closeTicketsAction,
} from "@/lib/db-mutations";

const SEVS: { value: Severity | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function StatusChip({ s }: { s: Ticket["status"] }) {
  const m: Record<Ticket["status"], { tone: "info" | "warning" | "danger" | "success" | "neutral"; label: string }> = {
    open: { tone: "info", label: "open" },
    in_progress: { tone: "warning", label: "in-progress" },
    blocked: { tone: "danger", label: "blocked" },
    resolved: { tone: "success", label: "resolved" },
    closed: { tone: "neutral", label: "closed" },
  };
  return <Chip tone={m[s].tone}>{m[s].label}</Chip>;
}

function SlaChip({ state, dueISO }: { state: "ok" | "warn" | "err"; dueISO: string }) {
  const tone = state === "err" ? "danger" : state === "warn" ? "warning" : "neutral";
  return (
    <Chip tone={tone} mono>
      {state === "err" ? "SLA breached" : <TimeAgo iso={dueISO} prefix="SLA " />}
    </Chip>
  );
}

export function TicketsView({
  initialTickets,
  engineers,
}: {
  initialTickets: Ticket[];
  engineers: Engineer[];
}) {
  const [sev, setSev] = useQueryState<Severity | "all">("sev", "all");
  const [q, setQ] = useQueryState<string>("q", "");

  // Local mutable copy so inline edits + bulk actions take effect immediately.
  const [list, setList] = useState<Ticket[]>(initialTickets);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { views, save, remove } = useSavedViews("tickets");
  const searchParams = useSearchParams();
  const [savingView, setSavingView] = useState(false);
  const [viewName, setViewName] = useState("");

  const counts = useMemo(() => {
    const c: Record<Severity | "all", number> = { all: list.length, critical: 0, high: 0, medium: 0, low: 0 };
    for (const t of list) c[t.severity]++;
    return c;
  }, [list]);

  const filtered = useMemo(() => {
    return list.filter((t) => {
      if (sev !== "all" && t.severity !== sev) return false;
      if (q) {
        const needle = q.toLowerCase();
        if (
          !t.id.toLowerCase().includes(needle) &&
          !t.title.toLowerCase().includes(needle) &&
          !t.tags.some((tag) => tag.includes(needle))
        )
          return false;
      }
      return true;
    });
  }, [list, sev, q]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));
  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  }

  // Optimistic UI: update local state immediately, then call the
  // server action. revalidatePath() inside the action causes the
  // server component to re-render with the persisted state.
  function reassign(ticketId: string, engineerId: string) {
    setList((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, assigneeId: engineerId, updatedISO: new Date().toISOString() }
          : t,
      ),
    );
    void assignTicketAction(ticketId, engineerId);
  }

  function bulkResolve() {
    const ids = Array.from(selected);
    setList((prev) =>
      prev.map((t) =>
        selected.has(t.id) ? { ...t, status: "resolved", updatedISO: new Date().toISOString() } : t,
      ),
    );
    setSelected(new Set());
    void resolveTicketsAction(ids);
  }
  function bulkAssignToMe() {
    const ids = Array.from(selected);
    setList((prev) =>
      prev.map((t) =>
        selected.has(t.id) ? { ...t, assigneeId: "eng-01", updatedISO: new Date().toISOString() } : t,
      ),
    );
    setSelected(new Set());
    void assignTicketsToMeAction(ids);
  }
  function bulkClose() {
    const ids = Array.from(selected);
    setList((prev) =>
      prev.map((t) =>
        selected.has(t.id) ? { ...t, status: "closed", updatedISO: new Date().toISOString() } : t,
      ),
    );
    setSelected(new Set());
    void closeTicketsAction(ids);
  }

  function handleSaveView() {
    const name = viewName.trim();
    if (!name) return;
    save(name, searchParams?.toString() ?? "");
    setViewName("");
    setSavingView(false);
  }

  return (
    <main className="page">
      <PageHead
        title="Tickets"
        meta={
          <>
            <span className="mono">{list.length} total</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono" style={{ color: "var(--danger)" }}>
              {counts.critical} critical
            </span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">SLA: 2 breached</span>
          </>
        }
        actions={
          <>
            <button className="btn" onClick={() => setSavingView((v) => !v)}>
              <Bookmark size={13} />
              Save view
            </button>
            <button className="btn btn-primary">
              <Plus size={13} />
              New ticket
            </button>
          </>
        }
      />

      {savingView && (
        <div
          className="surface"
          style={{
            padding: "8px 12px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Bookmark size={13} style={{ color: "var(--accent-2)" }} />
          <input
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            placeholder='Name this view e.g. "My critical, SLA-breached"'
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveView();
              if (e.key === "Escape") setSavingView(false);
            }}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              borderRadius: 5,
              padding: "5px 8px",
              fontSize: 12,
              fontFamily: "inherit",
              color: "var(--text)",
              outline: "none",
            }}
          />
          <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
            ?{searchParams?.toString() || "<no filters>"}
          </span>
          <button className="btn btn-primary" onClick={handleSaveView}>
            Save
          </button>
          <button className="btn btn-ghost" onClick={() => setSavingView(false)}>
            Cancel
          </button>
        </div>
      )}

      {views.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          <span className="label-mono">Saved</span>
          {views.map((v) => (
            <span
              key={v.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 4px 3px 9px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 11.5,
                color: "var(--text-2)",
              }}
            >
              <Link
                href={`/tickets${v.query ? `?${v.query}` : ""}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {v.name}
              </Link>
              <button
                onClick={() => remove(v.id)}
                aria-label={`Remove view ${v.name}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-3)",
                  cursor: "pointer",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <Surface flush>
        <div className="toolbar">
          <div className="tabs">
            {SEVS.map((o) => (
              <button
                key={o.value}
                className={cn("tab", sev === o.value && "active")}
                onClick={() => setSev(o.value)}
              >
                {o.label}
                <span className="tab-count">{counts[o.value]}</span>
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
              placeholder="ID, title, tag..."
            />
          </div>
          <div className="toolbar-spacer" />
          <button className="btn btn-ghost">
            <Filter size={13} />
            Assignee
          </button>
          <button className="btn btn-ghost">
            <Filter size={13} />
            Server
          </button>
          <span style={{ fontSize: 11, color: "var(--text-3)" }} className="mono">
            {filtered.length} shown
          </span>
        </div>

        {selected.size > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "var(--accent-dim)",
              borderBottom: "1px solid var(--border)",
              fontSize: 12,
            }}
          >
            <strong className="mono" style={{ color: "var(--text)" }}>
              {selected.size}
            </strong>
            <span style={{ color: "var(--text-2)" }}>selected</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="btn" onClick={bulkAssignToMe}>
                <UserPlus size={12} />
                Assign to me
              </button>
              <button className="btn">
                <TagIcon size={12} />
                Add tag
              </button>
              <button className="btn btn-primary" onClick={bulkResolve}>
                <CheckCircle2 size={12} />
                Resolve
              </button>
              <button className="btn btn-ghost" onClick={bulkClose}>
                <Trash2 size={12} />
                Close
              </button>
              <button className="btn btn-ghost" onClick={() => setSelected(new Set())}>
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 28 }}>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th style={{ width: 16 }}></th>
              <th>ID</th>
              <th>Title</th>
              <th>Server / Rack</th>
              <th>Assignee</th>
              <th>SLA</th>
              <th>Status</th>
              <th>Tags</th>
              <th>Updated</th>
            </tr>
          </thead>
          <Stagger as="tbody">
            {filtered.map((t) => {
              const checked = selected.has(t.id);
              return (
                <StaggerItem
                  as="tr"
                  key={t.id}
                  className={checked ? "selected" : ""}
                >
                  <td onClick={(e) => { e.stopPropagation(); toggleRow(t.id); }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRow(t.id)}
                      aria-label={`Select ${t.id}`}
                    />
                  </td>
                  <td>
                    {t.severity === "critical" ? (
                      <PulseDot color="var(--danger)" size={8} />
                    ) : (
                      <SevDot severity={t.severity} />
                    )}
                  </td>
                  <td className="id-cell">
                    <Link href={`/tickets/${t.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {t.id}
                    </Link>
                  </td>
                  <td style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis" }}>
                    <Link href={`/tickets/${t.id}`} style={{ color: "var(--text)", textDecoration: "none" }}>
                      {t.title}
                    </Link>
                  </td>
                  <td className="mono" style={{ color: "var(--text-2)", fontSize: 11.5 }}>
                    {t.serverId}
                    <span style={{ color: "var(--text-3)" }}> · {t.rack}</span>
                  </td>
                  <td>
                    <AssigneePicker
                      value={t.assigneeId}
                      onChange={(id) => reassign(t.id, id)}
                      engineers={engineers}
                    />
                  </td>
                  <td>
                    <SlaChip state={t.slaState} dueISO={t.slaDueISO} />
                  </td>
                  <td>
                    <StatusChip s={t.status} />
                  </td>
                  <td>
                    <div style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
                      {t.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} tone="outline" mono>
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </td>
                  <td className="mono" style={{ color: "var(--text-3)" }}>
                    <TimeAgo iso={t.updatedISO} />
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
