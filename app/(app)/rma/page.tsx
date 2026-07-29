import { listRma } from "@/lib/db-queries";
import { RmaView } from "./RmaView";

export default async function Page() {
  const rmaItems = await listRma();
  return <RmaView rmaItems={rmaItems} />;
}
