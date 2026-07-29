"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Wifi } from "lucide-react";

interface Event {
  id: number;
  src: string;
  msg: string;
  tone: "info" | "ok" | "warn";
  at: string;
}

const SAMPLES: Omit<Event, "id" | "at">[] = [
  { src: "BMC", msg: "SVR-00124 sensor poll OK · 67°C", tone: "info" },
  { src: "BMC", msg: "SVR-00123 fan F2 RPM 11250 (nominal)", tone: "info" },
  { src: "REDFISH", msg: "SVR-00125 power 740W (stable)", tone: "info" },
  { src: "IPMI", msg: "SVR-00131 PSU1/PSU2 redundancy verified", tone: "ok" },
  { src: "REDFISH", msg: "SVR-00132 NIC p2p1 link up · 400G", tone: "ok" },
  { src: "BMC", msg: "SVR-00134 GPU3 temp 91°C — approaching threshold", tone: "warn" },
  { src: "TELEMETRY", msg: "rack R-DC1-B03 utilization 92%", tone: "warn" },
  { src: "BMC", msg: "SVR-00127 NVMe slot-3 SMART scan complete", tone: "info" },
  { src: "REDFISH", msg: "SVR-00133 memory ECC scrub started", tone: "info" },
  { src: "IPMI", msg: "SVR-00141 PSU2 input fault recurring", tone: "warn" },
  { src: "BMC", msg: "SVR-00126 fan F3 RPM stable 11240 ±42 (post-RMA)", tone: "ok" },
  { src: "TELEMETRY", msg: "DC1 intake 22.4°C · exhaust 38°C", tone: "info" },
  { src: "REDFISH", msg: "SVR-00145 NCCL all-reduce iter 4128 OK", tone: "ok" },
  { src: "BMC", msg: "SVR-00128 burn-in hour 23/72 progressing", tone: "info" },
];

const MAX_KEEP = 8;
const TICK_MS = 4000;

/**
 * Simulated event stream.
 *
 * Hydration-safe: initial state is an empty array, so the server-
 * rendered HTML matches the first client render exactly. The first
 * batch of events is seeded inside a `useEffect`, which only runs on
 * the client — that's the same place `nowLabel()` becomes safe to call
 * (server time and client time would otherwise differ by a second and
 * trigger a hydration text mismatch).
 *
 * IDs come from a per-instance ref counter that monotonically
 * increments, so the seed and the interval can never produce a
 * collision (the previous version's seed used ids 1..4 with id `1` at
 * the top, then the interval prepended `id = prev[0].id + 1 = 2`,
 * which collided with the existing id `2`).
 */
export function LiveTicker() {
  const [events, setEvents] = useState<Event[]>([]);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nextIdRef = useRef(1);

  function makeEvent(): Event {
    const sample = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    return {
      ...sample,
      id: nextIdRef.current++,
      at: nowLabel(),
    };
  }

  // Seed once on mount — never during SSR, so no hydration mismatch.
  useEffect(() => {
    const initial: Event[] = [];
    // Most recent first → highest id at index 0
    for (let i = 0; i < 4; i++) initial.unshift(makeEvent());
    setEvents(initial);
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ticker — only after mount, only when not paused.
  useEffect(() => {
    if (!mounted || paused) return;
    const t = setInterval(() => {
      setEvents((prev) => [makeEvent(), ...prev].slice(0, MAX_KEEP));
    }, TICK_MS);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, mounted]);

  return (
    <div
      className="surface"
      style={{ overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 240 }}
    >
      <div
        className="surface-head"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <Wifi size={13} style={{ color: paused ? "var(--text-3)" : "var(--success)" }} />
        Live event stream
        <span
          className="mono"
          style={{
            fontSize: 9.5,
            padding: "1px 5px",
            background: paused ? "rgba(156,163,175,0.14)" : "rgba(34,197,94,0.14)",
            color: paused ? "var(--text-3)" : "var(--success)",
            borderRadius: 3,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {paused ? "paused" : mounted ? "live" : "connecting…"}
        </span>
        <span className="surface-actions">
          <button
            className="btn btn-ghost"
            style={{ padding: "2px 6px", fontSize: 11 }}
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Resume stream" : "Pause stream"}
            disabled={!mounted}
          >
            {paused ? <Play size={11} /> : <Pause size={11} />}
            {paused ? "Resume" : "Pause"}
          </button>
        </span>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {!mounted && (
          // Pre-hydration placeholder so the surface keeps its height
          // and the layout doesn't jump when events arrive.
          <div
            style={{
              padding: "20px 12px",
              fontSize: 11,
              color: "var(--text-3)",
              textAlign: "center",
            }}
          >
            Waiting for events…
          </div>
        )}
        {mounted &&
          events.map((e, idx) => (
            <div
              key={e.id}
              style={{
                display: "grid",
                gridTemplateColumns: "8px 70px minmax(0, 1fr) auto",
                gap: 10,
                alignItems: "center",
                padding: "7px 12px",
                borderBottom: "1px solid var(--border)",
                fontSize: 12,
                opacity: idx === 0 ? 1 : 1 - idx * 0.06,
                background: idx === 0 && !paused ? "rgba(34,197,94,0.04)" : "transparent",
                transition: "background-color 800ms ease",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    e.tone === "warn"
                      ? "var(--warning)"
                      : e.tone === "ok"
                      ? "var(--success)"
                      : "var(--info)",
                }}
              />
              <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                {e.src}
              </span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.msg}
              </span>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--text-3)" }}>
                {e.at}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function nowLabel() {
  const d = new Date();
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`;
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
