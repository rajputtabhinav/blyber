import { listTestPlans, listRuns, listEngineers } from "@/lib/db-queries";
import { PlansView } from "./PlansView";

export default async function Page() {
  const [testPlans, validationRuns, engineers] = await Promise.all([
    listTestPlans(),
    listRuns(),
    listEngineers(),
  ]);
  return (
    <PlansView
      testPlans={testPlans}
      validationRuns={validationRuns}
      engineers={engineers}
    />
  );
}
