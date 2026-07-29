import { listComponents, listQualifications, listInstances } from "@/lib/db-queries";
import { ComponentsView } from "./ComponentsView";

export default async function Page() {
  const [catalog, qualifications, componentInstances] = await Promise.all([
    listComponents(),
    listQualifications(),
    listInstances(),
  ]);
  return (
    <ComponentsView
      catalog={catalog}
      qualifications={qualifications}
      componentInstances={componentInstances}
    />
  );
}
