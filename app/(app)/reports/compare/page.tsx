import { Suspense } from "react";
import {
  getRuns,
  listEngineers,
  listComponents,
  listPlatforms,
  listTestPlans,
} from "@/lib/db-queries";
import { CompareView } from "./CompareView";

export default async function Page({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const idsParam = searchParams.ids ?? "";
  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);

  const [runs, engineers, catalog, platforms, testPlans] = await Promise.all([
    getRuns(ids),
    listEngineers(),
    listComponents(),
    listPlatforms(),
    listTestPlans(),
  ]);

  return (
    <Suspense
      fallback={
        <main className="page">
          <div className="page-head">
            <h1 className="page-title">Run comparison</h1>
          </div>
        </main>
      }
    >
      <CompareView
        runs={runs}
        ids={ids}
        engineers={engineers}
        catalog={catalog}
        platforms={platforms}
        testPlans={testPlans}
      />
    </Suspense>
  );
}
