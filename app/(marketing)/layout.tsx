import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BlyberWordmark } from "@/components/shell/BlyberWordmark";

/**
 * Marketing chrome — used only by the public landing page.
 * Light mint background, generous whitespace, no Sidebar/Topbar.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mkt-root">
      <header className="mkt-nav">
        <div className="mkt-nav-inner">
          <Link href="/" className="mkt-brand" aria-label="Blyber home">
            <BlyberWordmark height={20} />
          </Link>
          <nav className="mkt-nav-links">
            <a href="#modules">Modules</a>
            <a href="#capabilities">Capabilities</a>
            <a href="#workflow">Workflow</a>
            <a href="#vendors">Vendors</a>
          </nav>
          <Link href="/dashboard" className="mkt-cta">
            Open Dashboard
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>

      {children}

      <footer className="mkt-footer">
        <div className="mkt-footer-inner">
          <div className="mkt-footer-col">
            <BlyberWordmark height={18} />
            <p className="mkt-footer-tag">
              Mission control for infrastructure engineers.
            </p>
          </div>

          <div className="mkt-footer-col">
            <div className="mkt-footer-label">Modules</div>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/inventory">Inventory</Link>
            <Link href="/tickets">Tickets</Link>
            <Link href="/reports">Validation runs</Link>
          </div>

          <div className="mkt-footer-col">
            <div className="mkt-footer-label">Validation</div>
            <Link href="/plans">Test Plans</Link>
            <Link href="/qualifications">Qualifications</Link>
            <Link href="/compatibility">Compatibility</Link>
            <Link href="/kb">Knowledge Base</Link>
          </div>

          <div className="mkt-footer-col">
            <div className="mkt-footer-label">Hardware</div>
            <Link href="/racks">Racks</Link>
            <Link href="/components">Components</Link>
            <Link href="/platforms">Platforms</Link>
            <Link href="/firmware">Firmware</Link>
          </div>
        </div>
        <div className="mkt-footer-bottom">
          <span className="mono">© Blyber Labs · internal build</span>
          <Link href="/admin/audit" className="mkt-footer-bottom-link">
            Audit log
          </Link>
        </div>
      </footer>
    </div>
  );
}
