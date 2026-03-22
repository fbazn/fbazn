import { getSuppliersWithCounts } from "@/app/actions/suppliers";
import { SuppliersGrid } from "./SuppliersGrid";

export default async function SuppliersPage() {
  const suppliers = await getSuppliersWithCounts();
  return <SuppliersGrid suppliers={suppliers} />;
}
