import { createClient as createAdmin } from "@supabase/supabase-js";
import { getActiveProducts } from "@/data/sourcingItems";
import { getSuppliers } from "@/app/actions/suppliers";
import SourcingClient from "./SourcingClient";

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function SourcingPage() {
  const [products, suppliers] = await Promise.all([
    getActiveProducts(),
    getSuppliers(),
  ]);

  const asins = products.map((p) => p.asin);
  const keepaData: Record<string, number | null> = {};

  if (asins.length > 0) {
    const { data: cacheRows } = await getAdmin()
      .from("keepa_cache")
      .select("asin, data")
      .in("asin", asins);
    for (const row of cacheRows ?? []) {
      keepaData[row.asin] = (row.data as { monthlySold?: number | null })?.monthlySold ?? null;
    }
  }

  return <SourcingClient initialItems={products} allSuppliers={suppliers} keepaData={keepaData} />;
}
