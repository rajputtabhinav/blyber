import { listPlatforms, listQualifications, listServers } from "@/lib/db-queries";
import { PlatformsView } from "./PlatformsView";

export default async function Page() {
  const [platforms, qualifications, servers] = await Promise.all([
    listPlatforms(),
    listQualifications(),
    listServers(),
  ]);
  return <PlatformsView platforms={platforms} qualifications={qualifications} servers={servers} />;
}
