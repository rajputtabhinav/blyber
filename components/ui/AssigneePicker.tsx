"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Engineer } from "@/lib/types";

interface AssigneePickerProps {
  value: string; // engineer id
  onChange: (id: string) => void;
  engineers: Engineer[];
  size?: "sm" | "md";
}

/**
 * Inline assignee picker. Click the avatar to pop a small menu and
 * reassign without leaving the row.
 */
export function AssigneePicker({ value, onChange, engineers, size = "sm" }: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
      window.addEventListener("mousedown", onDoc);
      return () => window.removeEventListener("mousedown", onDoc);
    }
  }, [open]);

  const current = engineers.find((e) => e.id === value);
  const filtered = q
    ? engineers.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))
    : engineers;

  return (
    <div
      ref={rootRef}
      style={{ position: "relative", display: "inline-flex" }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "1px 5px 1px 1px",
          borderRadius: 12,
          background: "transparent",
          border: "1px solid transparent",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "var(--text)",
          transition: "background-color 100ms ease, border-color 100ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
        }}
      >
        <Avatar name={current?.name ?? "?"} size={size} />
        <span style={{ fontSize: 11.5 }}>{current?.initials}</span>
        <ChevronDown size={10} style={{ color: "var(--text-3)" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            width: 240,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: 5,
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
            zIndex: 30,
            overflow: "hidden",
          }}
        >
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Reassign…"
            style={{
              width: "100%",
              padding: "7px 9px",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid var(--border)",
              outline: "none",
              color: "var(--text)",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          />
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.map((e) => (
              <div
                key={e.id}
                onClick={() => {
                  onChange(e.id);
                  setOpen(false);
                  setQ("");
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "20px 1fr 14px",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 9px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                onMouseEnter={(ev) => {
                  (ev.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(ev) => {
                  (ev.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <Avatar name={e.name} size="sm" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.name}
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                    {e.team} · {e.activeTickets} open
                  </div>
                </div>
                {e.id === value && <Check size={12} style={{ color: "var(--accent-2)" }} />}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="empty" style={{ padding: 12 }}>
                No engineer matches.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
