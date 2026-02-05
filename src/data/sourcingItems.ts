import { createClient } from "@/lib/supabase/server";

export type SourcingItemRow = {
  id: string;
  user_id: string;
  asin: string;
  title: string;
  marketplace: string;
  supplier_name: string | null;
  supplier_url: string | null;
  supplier_cost: number | null;
  buy_box_price: number | null;
  fees: number | null;
  est_profit: number | null;
  roi_pct: number | null;
  rank_text: string | null;
  tags: string | null;
  notes: string | null;
  image_url: string | null;
  status: "review" | "saved" | "rejected" | "in_progress";
  created_at: string;
  updated_at: string;
};

const baseSelect = [
  "id",
  "user_id",
  "asin",
  "title",
  "marketplace",
  "supplier_name",
  "supplier_url",
  "supplier_cost",
  "buy_box_price",
  "fees",
  "est_profit",
  "roi_pct",
  "rank_text",
  "tags",
  "notes",
  "image_url",
  "status",
  "created_at",
  "updated_at",
].join(", ");

export async function getReviewQueueRows(): Promise<SourcingItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sourcing_items")
    .select(baseSelect)
    .eq("status", "review")
    .order("created_at", { ascending: false })
    .returns<SourcingItemRow[]>();

  if (error) {
    console.error("Failed to load review queue rows", error);
    throw error;
  }

  return data ?? [];
}

export async function getReviewQueueCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("sourcing_items")
    .select("id", { count: "exact", head: true })
    .eq("status", "review")
    .returns<SourcingItemRow[]>();

  if (error) {
    console.error("Failed to load review queue count", error);
    throw error;
  }

  return count ?? 0;
}

export async function getSourcingRows(): Promise<SourcingItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sourcing_items")
    .select(baseSelect)
    .order("created_at", { ascending: false })
    .returns<SourcingItemRow[]>();

  if (error) {
    console.error("Failed to load sourcing rows", error);
    throw error;
  }

  return data ?? [];
}

export async function getRecentRows(limit = 8): Promise<SourcingItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sourcing_items")
    .select(baseSelect)
    .order("updated_at", { ascending: false })
    .limit(limit)
    .returns<SourcingItemRow[]>();

  if (error) {
    console.error("Failed to load recent rows", error);
    throw error;
  }

  return data ?? [];
}
