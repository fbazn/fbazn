import { createClient } from "@/lib/supabase/server";
import ReviewQueueClient from "./ReviewQueueClient";
import type { QueueRow } from "./ReviewQueueClient";

export default async function ReviewQueuePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("review_queue")
    .select(
      "id, asin, title, image_url, category, size_tier, buy_box_price, cost_price, referral_fee, fba_fee, net_profit, roi, margin, status, notes, created_at",
    )
    .order("created_at", { ascending: false })
    .returns<QueueRow[]>();

  if (error) {
    console.error("[review_queue] page fetch error:", error);
  }

  return <ReviewQueueClient initialItems={data ?? []} />;
}
