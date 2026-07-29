import { listRuns, listEngineers } from "@/lib/db-queries";
import { ReportsView } from "./ReportsView";

export default async function Page() {
  const [validationRuns, engineers] = await Promise.all([listRuns(), listEngineers()]);
  return <ReportsView validationRuns={validationRuns} engineers={engineers} />;
}
