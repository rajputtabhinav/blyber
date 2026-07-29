"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ROUTES: Record<string, string> = {
  d: "/", // dashboard
  i: "/inventory",
  t: "/tickets",
  r: "/racks",
  f: "/firmware",
  c: "/components",        // c → components
  C: "/compatibility",     // shift+c → compatibility matrix
  e: "/engineers",
  k: "/kb",
  v: "/reports", // (v)alidation
  m: "/rma",
  p: "/platforms",
  P: "/plans",             // shift+p → test plans
  q: "/qualifications",
};

/**
 * Global vim-style nav: press `g` then a letter to jump.
 * `g d` → dashboard, `g i` → inventory, `g t` → tickets, etc.
 *
 * Also: `?` shows a brief hint chip in the corner.
 */
export function KeyboardNav() {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [hint, setHint] = useState(false);
  const armedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function inField(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      return (
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)
      );
    }

    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (inField(e.target)) return;

      if (e.key === "?") {
        e.preventDefault();
        setHint((v) => !v);
        return;
      }

      if (armed) {
        // Preserve case so we can distinguish c (components) vs C (compatibility)
        const k = e.key;
        if (ROUTES[k]) {
          e.preventDefault();
          router.push(ROUTES[k]);
        } else if (ROUTES[k.toLowerCase()]) {
          e.preventDefault();
          router.push(ROUTES[k.toLowerCase()]);
        }
        setArmed(false);
        if (armedTimer.current) clearTimeout(armedTimer.current);
        return;
      }

      if (e.key === "g") {
        e.preventDefault();
        setArmed(true);
        if (armedTimer.current) clearTimeout(armedTimer.current);
        armedTimer.current = setTimeout(() => setArmed(false), 1400);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (armedTimer.current) clearTimeout(armedTimer.current);
    };
  }, [armed, router]);

  return (
    <>
      {armed && (
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 14,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "6px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: 5,
            fontSize: 11.5,
            color: "var(--text)",
            zIndex: 50,
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          }}
          className="mono"
        >
          <span style={{ color: "var(--accent-2)" }}>g</span>
          <span style={{ color: "var(--text-3)" }}> · waiting for next key…</span>
        </div>
      )}

      {hint && (
        <div
          role="dialog"
          aria-label="Keyboard shortcuts"
          onClick={() => setHint(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 60,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: 6,
              padding: 14,
              minWidth: 320,
              fontSize: 12,
            }}
          >
            <div className="label-mono" style={{ marginBottom: 8 }}>
              Keyboard shortcuts
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", rowGap: 4, columnGap: 12 }}>
              <Kbd>⌘ K</Kbd>
              <span>Command palette</span>
              <Kbd>/</Kbd>
              <span>Open palette / focus search</span>
              <Kbd>g d</Kbd>
              <span>Go to dashboard</span>
              <Kbd>g i</Kbd>
              <span>Go to inventory</span>
              <Kbd>g t</Kbd>
              <span>Go to tickets</span>
              <Kbd>g r</Kbd>
              <span>Go to racks</span>
              <Kbd>g f</Kbd>
              <span>Go to firmware</span>
              <Kbd>g c</Kbd>
              <span>Go to components</span>
              <Kbd>g C</Kbd>
              <span>Go to compatibility</span>
              <Kbd>g p</Kbd>
              <span>Go to platforms</span>
              <Kbd>g P</Kbd>
              <span>Go to test plans</span>
              <Kbd>g q</Kbd>
              <span>Go to qualifications</span>
              <Kbd>g e</Kbd>
              <span>Go to engineers</span>
              <Kbd>g k</Kbd>
              <span>Go to KB</span>
              <Kbd>g v</Kbd>
              <span>Go to reports (validation)</span>
              <Kbd>g m</Kbd>
              <span>Go to RMA</span>
              <Kbd>?</Kbd>
              <span>This help</span>
              <Kbd>esc</Kbd>
              <span>Close panels / palette</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 10.5,
        padding: "1px 6px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--border)",
        borderRadius: 3,
        color: "var(--text-2)",
        justifySelf: "start",
      }}
    >
      {children}
    </span>
  );
}
