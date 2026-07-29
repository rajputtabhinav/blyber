import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="page">
      <div
        style={{
          maxWidth: 520,
          marginTop: 60,
          padding: 18,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <FileQuestion size={16} style={{ color: "var(--text-2)" }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
            HTTP 404 / blyber:not-found
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          That resource isn&apos;t in this lab
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55, marginBottom: 14 }}>
          The route, server ID, ticket, or KB article doesn&apos;t resolve. It may have been retired,
          decommissioned, or you may have followed a stale link.
        </div>
        <Link href="/dashboard" className="btn">
          <ArrowLeft size={13} />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
