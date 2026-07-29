import { listKbArticles, listEngineers } from "@/lib/db-queries";
import { KbView } from "./KbView";

export default async function Page() {
  const [kbArticles, engineers] = await Promise.all([listKbArticles(), listEngineers()]);
  return <KbView kbArticles={kbArticles} engineers={engineers} />;
}
