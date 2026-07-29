import { listEngineers, listTickets } from "@/lib/db-queries";
import { EngineersView } from "./EngineersView";

export default async function Page() {
  const [engineers, tickets] = await Promise.all([listEngineers(), listTickets()]);
  return <EngineersView engineers={engineers} tickets={tickets} />;
}
