"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Route-level error boundary.
 *
 * In dev/test, we show the full `error.name`, message, and stack so a
 * developer can debug immediately. In production we hide all of that
 * (it can leak file paths, internal IDs, and occasionally secrets) and
 * surface only the request digest — which an operator can grep server
 * logs for.
 */
const SHOW_DETAILS = process.env.NODE_ENV !== "production";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[blyber:route-error]", error);
  }, [error]);

  return (
    <main className="page">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 6,
          marginBottom: 14,
        }}
      >
        <AlertOctagon size={14} style={{ color: "var(--danger)" }} />
        <span style={{ fontSize: 12, color: "var(--text)" }}>
          <strong>{SHOW_DETAILS ? "Route fault" : "Something went wrong"}</strong>
          {SHOW_DETAILS
            ? " — page boundary caught an exception during render."
            : " — the page couldn't load. Try again, or head back to the dashboard."}
        </span>
        {error.digest && (
          <span
            className="mono"
            style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }}
          >
            digest {error.digest}
          </span>
        )}
      </div>

      <div className="surface" style={{ padding: 14 }}>
        {SHOW_DETAILS ? (
          <>
            <div className="label-mono" style={{ marginBottom: 6 }}>
              Exception
            </div>
            <div
              className="mono"
              style={{
                fontSize: 12,
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: 5,
                padding: "10px 12px",
                color: "var(--text)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error.name}: {error.message}
            </div>

            {error.stack && (
              <>
                <div className="label-mono" style={{ marginTop: 14, marginBottom: 6 }}>
                  Stack trace
                </div>
                <pre
                  className="mono"
                  style={{
                    fontSize: 11,
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 5,
                    padding: "10px 12px",
                    color: "var(--text-2)",
                    margin: 0,
                    maxHeight: 380,
                    overflow: "auto",
                  }}
                >
                  {error.stack}
                </pre>
              </>
            )}
          </>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-2)" }}>
            An unexpected error occurred while rendering this page. The fault
            has been logged. If it keeps happening, share the digest above
            with the operator.
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
          <button className="btn btn-primary" onClick={() => reset()}>
            <RotateCcw size={13} />
            Retry render
          </button>
          <Link href="/dashboard" className="btn">
            <ArrowLeft size={13} />
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
