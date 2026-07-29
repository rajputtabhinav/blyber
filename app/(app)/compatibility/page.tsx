import { listComponents, listPlatforms, listQualifications } from "@/lib/db-queries";
import { CompatibilityView } from "./CompatibilityView";

export default async function Page() {
  const [catalog, platforms, qualifications] = await Promise.all([
    listComponents(),
    listPlatforms(),
    listQualifications(),
  ]);
  return (
    <CompatibilityView
      catalog={catalog}
      platforms={platforms}
      qualifications={qualifications}
    />
  );
}
