import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { KeyboardNav } from "@/components/shell/KeyboardNav";
import {
  listServers,
  listTickets,
  listKbArticles,
  listEngineers,
  listRacks,
  listComponents,
  listPlatforms,
  listCampaigns,
  listTestPlans,
} from "@/lib/db-queries";

/**
 * Application chrome — shared by every route under app/(app)/.
 * Pre-fetches the global ⌘K palette corpus so search works on every
 * page. If the DB isn't ready (first run before `npm run db:seed`),
 * the palette renders empty rather than crashing the layout.
 */
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let palette: Awaited<ReturnType<typeof loadPalette>> | null = null;
  try {
    palette = await loadPalette();
  } catch {
    palette = null;
  }

  return (
    <>
      <div className="app-shell">
        <Sidebar />
        <div className="main">
          <Topbar />
          {children}
        </div>
      </div>
      {palette && <CommandPalette {...palette} />}
      <KeyboardNav />
    </>
  );
}

async function loadPalette() {
  const [
    servers,
    tickets,
    kbArticles,
    engineers,
    racks,
    catalog,
    platforms,
    campaigns,
    testPlans,
  ] = await Promise.all([
    listServers(),
    listTickets(),
    listKbArticles(),
    listEngineers(),
    listRacks(),
    listComponents(),
    listPlatforms(),
    listCampaigns(),
    listTestPlans(),
  ]);
  return { servers, tickets, kbArticles, engineers, racks, catalog, platforms, campaigns, testPlans };
}
