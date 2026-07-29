import { listFirmware } from "@/lib/db-queries";
import { FirmwareView } from "./FirmwareView";

export default async function Page() {
  const firmware = await listFirmware();
  return <FirmwareView firmware={firmware} />;
}
