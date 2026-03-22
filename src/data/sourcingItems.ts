import { createClient } from "@/lib/supabase/server";

// Mirrors the review_queue table columns used by Sourcing List + Archived pages
export type SourcingItemRow = {
  id: string;
  user_id: string;
  asin: string;
  title: string | null;
  image_url: string | null;
  category: string | null;
  size_tier: string | null;
  buy_box_price: number | null;
  cost_price: number | null;
  referral_fee: number | null;
  fba_fee: number | null;
  net_profit: number | null;
  roi: number | null;
  margin: number | null;
  supplier_name: string | null;
  supplier_product_url: string | null;
  supplier_sku: string | null;
  supplier_cost: number | null;
  notes: string | null;
  status: string;
  live_product: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

const baseSelect = [
  "id", "user_id", "asin", "title", "image_url", "category", "size_tier",
  "buy_box_price", "cost_price", "referral_fee", "fba_fee",
  "net_profit", "roi", "margin",
  "supplier_name", "supplier_product_url", "supplier_sku", "supplier_cost",
  "notes", "status", "live_product", "archived", "created_at", "updated_at",
].join(", ");

/** Items in the review queue (not yet converted, not archived) */
export async function getReviewQueueCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("review_queue")
    .select("id", { count: "exact", head: true })
    .eq("live_product", false)
    .eq("archived", false);
  if (error) { console.error("Failed to load review queue count", error); return 0; }
  return count ?? 0;
}

/** Active converted products — shown on Sourcing List */
export async function getActiveProducts(): Promise<SourcingItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_queue")
    .select(baseSelect)
    .eq("live_product", true)
    .eq("archived", false)
    .order("updated_at", { ascending: false })
    .returns<SourcingItemRow[]>();
  if (error) { console.error("Failed to load active products", error); throw error; }
  return data ?? [];
}

/** Archived products — shown on Archived page */
export async function getArchivedProducts(): Promise<SourcingItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_queue")
    .select(baseSelect)
    .eq("archived", true)
    .order("updated_at", { ascending: false })
    .returns<SourcingItemRow[]>();
  if (error) { console.error("Failed to load archived products", error); throw error; }
  return data ?? [];
}
