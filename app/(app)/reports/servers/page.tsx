import {
  listServers,
  listRuns,
  listTickets,
  listRma,
  listEngineers,
} from "@/lib/db-queries";
import { ServerReportsView } from "./ServerReportsView";

export default async function Page() {
  const [servers, validationRuns, tickets, rmaItems, engineers] = await Promise.all([
    listServers(),
    listRuns(),
    listTickets(),
    listRma(),
    listEngineers(),
  ]);
  return (
    <ServerReportsView
      servers={servers}
      validationRuns={validationRuns}
      tickets={tickets}
      rmaItems={rmaItems}
      engineers={engineers}
    />
  );
}
