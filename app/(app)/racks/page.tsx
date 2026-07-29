import { listRacks, listServers, listEngineers } from "@/lib/db-queries";
import { RacksView } from "./RacksView";

export default async function Page() {
  const [racks, servers, engineers] = await Promise.all([
    listRacks(),
    listServers(),
    listEngineers(),
  ]);
  return <RacksView racks={racks} servers={servers} engineers={engineers} />;
}
