import { getArchivedProducts } from "@/data/sourcingItems";
import ArchivedClient from "./ArchivedClient";

export default async function ArchivedPage() {
  const products = await getArchivedProducts();
  return <ArchivedClient initialItems={products} />;
}
