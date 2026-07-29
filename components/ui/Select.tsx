"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  /** Optional secondary text shown muted to the right of the label. */
  hint?: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: readonly SelectOption<T>[];
  /** Min width of the trigger button. Falls back to content width. */
  minWidth?: number;
  /** Aria label for the trigger. */
  ariaLabel?: string;
  className?: string;
  /** Apply visual classes to the trigger button. Default: "btn". */
  triggerClassName?: string;
}

/**
 * Custom <Select> that matches the dark theme exactly.
 *
 * Why this exists: native <select> on Windows renders its option
 * listbox via the OS, which ignores `color-scheme: dark` and any
 * `:checked` / `:hover` CSS on <option> — the highlighted item
 * stays pale blue regardless. This component renders an identical-
 * looking trigger (button styled as .btn with a chevron) but draws
 * its own dropdown panel against the dark surface palette, with
 * full keyboard support and click-outside-to-close.
 *
 * API is intentionally close to native <select> so existing call
 * sites need a near-mechanical swap.
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  minWidth,
  ariaLabel,
  className,
  triggerClassName = "btn",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.value === value);

  // Open: focus & highlight the currently-selected item
  useEffect(() => {
    if (!open) return;
    const i = options.findIndex((o) => o.value === value);
    setActiveIdx(i >= 0 ? i : 0);
  }, [open, options, value]);

  // Click outside closes
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Scroll active option into view
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLDivElement>(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  function commit(idx: number) {
    const opt = options[idx];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    // Restore focus to the trigger so keyboard nav continues to feel native.
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIdx(options.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(activeIdx);
    } else if (e.key === "Tab") {
      // Allow tab to close + move focus naturally.
      setOpen(false);
    }
  }

  return (
    <div
      ref={rootRef}
      className={className}
      style={{ position: "relative", display: "inline-flex" }}
      onKeyDown={onKey}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={triggerClassName}
        style={{
          minWidth,
          paddingRight: 8,
          /* Reserve a bit of room between label and chevron */
          gap: 8,
        }}
      >
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current?.label ?? "—"}
        </span>
        <ChevronDown size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 4,
            minWidth: "100%",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: 5,
            boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
            zIndex: 40,
            overflow: "hidden",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {options.map((opt, i) => {
            const isActive = i === activeIdx;
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                data-idx={i}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => commit(i)}
                className={cn(isActive && "is-active")}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 14px",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--text)",
                  background: isActive ? "var(--accent-dim)" : "transparent",
                  borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                  paddingLeft: 8,
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {opt.label}
                  {opt.hint && (
                    <span className="mono" style={{ marginLeft: 6, color: "var(--text-3)", fontSize: 10.5 }}>
                      {opt.hint}
                    </span>
                  )}
                </span>
                {isSelected && <Check size={12} style={{ color: "var(--accent-2)" }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
