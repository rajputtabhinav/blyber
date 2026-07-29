"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  PackageOpen,
  Users,
  Server,
  GalleryHorizontalEnd,
  Cpu,
  GitCompareArrows,
  FlaskConical,
  BookOpen,
  Search,
  Boxes,
  Layers,
  ShieldCheck,
  ClipboardList,
  FileText,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";
import { BlyberWordmark } from "@/components/shell/BlyberWordmark";

interface NavSpec {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
  dot?: string;
}
interface NavGroup {
  title: string;
  items: NavSpec[];
}

const groups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Tickets", href: "/tickets", icon: Ticket },
      { label: "RMA", href: "/rma", icon: PackageOpen },
      { label: "Engineers", href: "/engineers", icon: Users },
    ],
  },
  {
    title: "Hardware",
    items: [
      { label: "Inventory", href: "/inventory", icon: Server },
      { label: "Racks", href: "/racks", icon: GalleryHorizontalEnd },
      { label: "Components", href: "/components", icon: Boxes },
      { label: "Platforms", href: "/platforms", icon: Layers },
      { label: "Firmware", href: "/firmware", icon: Cpu },
    ],
  },
  {
    title: "Validation",
    items: [
      { label: "Test Plans", href: "/plans", icon: ClipboardList },
      { label: "Qualifications", href: "/qualifications", icon: ShieldCheck },
      { label: "Compatibility", href: "/compatibility", icon: GitCompareArrows },
      { label: "Reports", href: "/reports", icon: FlaskConical },
      { label: "Server Reports", href: "/reports/servers", icon: FileText },
      { label: "Knowledge Base", href: "/kb", icon: BookOpen },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(href);

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <BlyberWordmark height={22} />
        <span className="env-pill">LAB</span>
      </div>

      <div className="sidebar-search">
        <Search size={13} className="sidebar-search-icon" />
        <input type="text" placeholder="Search..." aria-label="Search" />
        <span className="sidebar-kbd">⌘K</span>
      </div>

      <nav className="nav-groups">
        {groups.map((g) => (
          <div className="nav-group" key={g.title}>
            <div className="nav-group-label">{g.title}</div>
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("nav-item", active && "active")}
                >
                  <Icon size={14} className="nav-icon" />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span className="nav-count">{item.count}</span>
                  )}
                  {item.dot && (
                    <span className="nav-dot" style={{ background: item.dot }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <Avatar name="Priya Raghavan" size="md" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>
            Priya Raghavan
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
            Staff · Validation
          </div>
        </div>
      </div>
    </aside>
  );
}
