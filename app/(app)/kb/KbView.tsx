"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Folder,
  Plus,
  Search,
  Star,
  TrendingUp,
  Users,
  Thermometer,
  Zap,
  Network,
  HardDrive,
  Cpu as CpuIcon,
  ShieldCheck,
  Package,
  type LucideIcon,
} from "lucide-react";
import { PageHead } from "@/components/shell/PageHead";
import { Surface } from "@/components/ui/Surface";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/Avatar";
import { cn, fmtNum } from "@/lib/cn";
import { TimeAgo } from "@/components/ui/TimeAgo";
import type { Engineer, KBArticle, KBCategory } from "@/lib/types";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const CATEGORIES: { name: KBCategory; Icon: LucideIcon }[] = [
  { name: "Thermal", Icon: Thermometer },
  { name: "Firmware", Icon: Zap },
  { name: "Network", Icon: Network },
  { name: "Storage", Icon: HardDrive },
  { name: "Compute", Icon: CpuIcon },
  { name: "Validation", Icon: ShieldCheck },
  { name: "RMA Process", Icon: Package },
];

export function KbView({
  kbArticles,
  engineers,
}: {
  kbArticles: KBArticle[];
  engineers: Engineer[];
}) {
  const engineerById = (id: string) => engineers.find((e) => e.id === id);
  const [cat, setCat] = useState<KBCategory | "all">("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: kbArticles.length };
    for (const a of kbArticles) c[a.category] = (c[a.category] || 0) + 1;
    return c;
  }, [kbArticles]);

  const filtered = useMemo(() => {
    return kbArticles.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (q) {
        const n = q.toLowerCase();
        if (
          !a.title.toLowerCase().includes(n) &&
          !a.snippet.toLowerCase().includes(n) &&
          !a.tags.some((t) => t.includes(n))
        )
          return false;
      }
      return true;
    });
  }, [cat, q, kbArticles]);

  const recent = kbArticles.slice().sort((a, b) => +new Date(b.updatedISO) - +new Date(a.updatedISO)).slice(0, 5);
  const popular = kbArticles.slice().sort((a, b) => b.views - a.views).slice(0, 5);
  const contributors = Array.from(new Set(kbArticles.map((a) => a.authorId)))
    .map(engineerById)
    .filter(Boolean)
    .slice(0, 6);

  return (
    <main className="page">
      <PageHead
        title="R&D Knowledge Base"
        meta={
          <>
            <span className="mono">{kbArticles.length} articles</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">{contributors.length} contributors</span>
            <span style={{ color: "var(--text-3)" }}>·</span>
            <span className="mono">last updated 2h ago</span>
          </>
        }
        actions={
          <button className="btn btn-primary">
            <Plus size={13} />
            New article
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr) 300px", gap: 12 }}>
        {/* LEFT: tree */}
        <Surface flush>
          <div className="surface-head">
            <Folder size={13} style={{ color: "var(--text-2)" }} />
            Categories
          </div>
          <div className="kb-tree">
            <div
              className={cn("kb-tree-item", cat === "all" && "active")}
              onClick={() => setCat("all")}
            >
              <BookOpen size={13} style={{ color: "var(--text-3)" }} />
              <span>All articles</span>
              <span className="kb-tree-count">{counts.all}</span>
            </div>
            {CATEGORIES.map((c) => {
              const Icon = c.Icon;
              return (
                <div
                  key={c.name}
                  className={cn("kb-tree-item", cat === c.name && "active")}
                  onClick={() => setCat(c.name)}
                >
                  <Icon size={13} className="nav-icon" />
                  <span>{c.name}</span>
                  <span className="kb-tree-count">{counts[c.name] ?? 0}</span>
                </div>
              );
            })}
          </div>
        </Surface>

        {/* MIDDLE: articles */}
        <Surface flush>
          <div className="toolbar">
            <div className="toolbar-search" style={{ flex: 1 }}>
              <Search size={13} className="toolbar-search-icon" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles, tags, content..."
                style={{ width: "100%" }}
              />
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
              {filtered.length} results
            </span>
          </div>

          <Stagger>
            {filtered.map((a) => {
              const author = engineerById(a.authorId);
              return (
                <StaggerItem key={a.id} className="kb-article">
                  <div className="kb-article-title">{a.title}</div>
                  <div className="kb-article-meta">
                    <span>{a.id}</span>
                    <span>·</span>
                    <Chip tone="outline">{a.category}</Chip>
                    <span>by {author?.name}</span>
                    <span>·</span>
                    <TimeAgo iso={a.updatedISO} prefix="upd " />
                    <span>·</span>
                    <span>{fmtNum(a.views)} views</span>
                  </div>
                  <div className="kb-article-snippet">{a.snippet}</div>
                  <div className="kb-article-tags">
                    {a.tags.map((t) => (
                      <Chip key={t} tone="outline" mono>
                        {t}
                      </Chip>
                    ))}
                  </div>
                </StaggerItem>
              );
            })}
            {filtered.length === 0 && <div className="empty">No articles match.</div>}
          </Stagger>
        </Surface>

        {/* RIGHT: recent + popular + contributors */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Surface
            flush
            title={
              <>
                <Star size={13} style={{ color: "var(--warning)" }} />
                Recently viewed
              </>
            }
          >
            <div>
              {recent.map((a) => (
                <div key={a.id} className="hover-row" style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{a.title}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                    {a.id} · <TimeAgo iso={a.updatedISO} />
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            flush
            title={
              <>
                <TrendingUp size={13} style={{ color: "var(--accent-2)" }} />
                Popular this week
              </>
            }
          >
            <div>
              {popular.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "22px minmax(0, 1fr) auto",
                    padding: "7px 12px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: 12,
                    alignItems: "center",
                  }}
                >
                  <span className="mono" style={{ color: "var(--text-3)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.title}
                  </span>
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>
                    {fmtNum(a.views)}
                  </span>
                </div>
              ))}
            </div>
          </Surface>

          <Surface
            flush
            title={
              <>
                <Users size={13} />
                Contributors
              </>
            }
          >
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {contributors.map((c) => (
                <div key={c!.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <Avatar name={c!.name} size="sm" />
                  <span style={{ flex: 1 }}>{c!.name}</span>
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: 10.5 }}>
                    {kbArticles.filter((a) => a.authorId === c!.id).length} articles
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-3)" }}>
                {engineers.length} total engineers in lab
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </main>
  );
}
