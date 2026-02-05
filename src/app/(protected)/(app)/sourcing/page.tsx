import { getSourcingRows } from "@/data/sourcingItems";
import { toMockItem } from "@/data/adapters";
import SourcingClient from "./SourcingClient";

export default async function SourcingPage() {
  const rows = (await getSourcingRows()).map(toMockItem);

  return <SourcingClient rows={rows} />;
}
