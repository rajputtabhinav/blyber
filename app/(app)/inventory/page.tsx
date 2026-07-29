import { listServers, listEngineers } from "@/lib/db-queries";
import { InventoryView } from "./InventoryView";

export default async function Page() {
  const [servers, engineers] = await Promise.all([listServers(), listEngineers()]);
  return <InventoryView servers={servers} engineers={engineers} />;
}
