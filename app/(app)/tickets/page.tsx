import { Suspense } from "react";
import { listTickets, listEngineers } from "@/lib/db-queries";
import { TicketsView } from "./TicketsView";

export default async function Page() {
  const [tickets, engineers] = await Promise.all([listTickets(), listEngineers()]);
  return (
    <Suspense
      fallback={
        <main className="page">
          <div className="page-head">
            <h1 className="page-title">Tickets</h1>
          </div>
          <div className="surface" style={{ padding: 12 }}>
            <div className="empty">Loading tickets…</div>
          </div>
        </main>
      }
    >
      <TicketsView initialTickets={tickets} engineers={engineers} />
    </Suspense>
  );
}
