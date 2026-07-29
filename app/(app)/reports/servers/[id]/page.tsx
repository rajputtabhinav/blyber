import { notFound } from "next/navigation";
import {
  getServer,
  listEngineers,
  listInstancesByServer,
  listRunsByServer,
  listTicketsByServer,
  listRmaByServer,
  listComponents,
  listPlatforms,
} from "@/lib/db-queries";
import { derivePlatformId } from "@/lib/data";
import { ServerReportView } from "./ServerReportView";

export default async function Page({ params }: { params: { id: string } }) {
  const server = await getServer(params.id);
  if (!server) notFound();

  const [engineers, bom, runs, tx, rmas, catalog, platforms] = await Promise.all([
    listEngineers(),
    listInstancesByServer(server.id),
    listRunsByServer(server.id),
    listTicketsByServer(server.id),
    listRmaByServer(server.id),
    listComponents(),
    listPlatforms(),
  ]);
  const owner = engineers.find((e) => e.id === server.owner);
  const platformId = server.platformId ?? derivePlatformId(server);
  const platform = platformId ? platforms.find((p) => p.id === platformId) : undefined;

  return (
    <ServerReportView
      server={server}
      owner={owner}
      platform={platform}
      bom={bom}
      runs={runs}
      tx={tx}
      rmas={rmas}
      catalog={catalog}
      engineers={engineers}
    />
  );
}
