import { getActiveProducts } from "@/data/sourcingItems";
import { getSuppliers } from "@/app/actions/suppliers";
import SourcingClient from "./SourcingClient";

export default async function SourcingPage() {
  const [products, suppliers] = await Promise.all([
    getActiveProducts(),
    getSuppliers(),
  ]);
  return <SourcingClient initialItems={products} allSuppliers={suppliers} />;
}
