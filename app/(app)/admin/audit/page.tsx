import { listAuditLog, listEngineers } from "@/lib/db-queries";
import { AuditView } from "./AuditView";

export default async function Page() {
  const [entries, engineers] = await Promise.all([
    listAuditLog(500),
    listEngineers(),
  ]);
  return <AuditView entries={entries} engineers={engineers} />;
}
