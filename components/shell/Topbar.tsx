"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Command, HelpCircle, Plus } from "lucide-react";

const ROUTE_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  tickets: "Tickets",
  compatibility: "Compatibility",
  engineers: "Engineers",
  kb: "Knowledge Base",
  racks: "Racks",
  firmware: "Firmware",
  reports: "Reports",
  rma: "RMA",
};

export function Topbar() {
  const pathname = usePathname() ?? "/dashboard";
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string; current: boolean }[] = [];
  if (segments.length === 0) {
    crumbs.push({ label: "Dashboard", href: "/dashboard", current: true });
  } else {
    let acc = "";
    segments.forEach((s, i) => {
      acc += "/" + s;
      const label = ROUTE_LABEL[s] ?? s;
      crumbs.push({
        label,
        href: acc,
        current: i === segments.length - 1,
      });
    });
  }

  return (
    <header className="topbar">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        {crumbs.map((c, i) => (
          <span key={c.href} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span className="crumb-sep">/</span>}
            {c.current ? (
              <span className="crumb-current">{c.label}</span>
            ) : (
              <Link href={c.href} style={{ color: "var(--text-2)", textDecoration: "none" }}>
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={15} />
          <span className="dot" />
        </button>
        <button className="icon-btn" aria-label="Command palette">
          <Command size={15} />
        </button>
        <button className="icon-btn" aria-label="Help">
          <HelpCircle size={15} />
        </button>
        <button className="btn btn-primary" style={{ marginLeft: 6 }}>
          <Plus size={13} />
          New
        </button>
      </div>
    </header>
  );
}
