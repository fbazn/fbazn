import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { getSuppliers } from "@/app/actions/suppliers";
import ReviewQueueClient from "./ReviewQueueClient";
import type { QueueRow } from "./ReviewQueueClient";

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export default async function ReviewQueuePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data, error }, suppliers] = await Promise.all([
    supabase
      .from("review_queue")
      .select(
        `id, asin, title, image_url, category, size_tier,
         buy_box_price, cost_price, referral_fee, fba_fee,
         net_profit, roi, margin, status, notes,
         supplier_name, supplier_product_url, supplier_sku, supplier_cost,
         created_at,
         review_queue_suppliers (
           id, supplier_id, supplier_sku, cost_price, created_at,
           supplier:suppliers ( id, name, website, notes )
         )`,
      )
      .eq("user_id", user?.id ?? "")
      .eq("live_product", false)
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .returns<QueueRow[]>(),
    getSuppliers(),
  ]);

  if (error) {
    console.error("[review_queue] page fetch error:", error);
  }

  const asins = (data ?? []).map((i) => i.asin);
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

  return (
    <ReviewQueueClient initialItems={data ?? []} allSuppliers={suppliers} keepaData={keepaData} />
  );
}
