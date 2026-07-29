import {
  listCampaigns,
  listQualifications,
  listComponents,
  listPlatforms,
  listEngineers,
} from "@/lib/db-queries";
import { QualificationsView } from "./QualificationsView";

export default async function Page() {
  const [campaigns, qualifications, catalog, platforms, engineers] = await Promise.all([
    listCampaigns(),
    listQualifications(),
    listComponents(),
    listPlatforms(),
    listEngineers(),
  ]);
  return (
    <QualificationsView
      campaigns={campaigns}
      qualifications={qualifications}
      catalog={catalog}
      platforms={platforms}
      engineers={engineers}
    />
  );
}
