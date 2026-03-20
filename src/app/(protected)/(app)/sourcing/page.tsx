import { getActiveProducts } from "@/data/sourcingItems";
import SourcingClient from "./SourcingClient";

export default async function SourcingPage() {
  const products = await getActiveProducts();
  return <SourcingClient initialItems={products} />;
}
