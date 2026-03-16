"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type QueueStatus =
  | "pending"
  | "reviewing"
  | "contacted"
  | "ordered"
  | "rejected";

export async function updateQueueStatus(id: string, status: QueueStatus) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("[review_queue] updateStatus error:", error);
    return { error: error.message };
  }

  revalidatePath("/review-queue");
  return { success: true };
}

export async function deleteQueueItem(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("[review_queue] delete error:", error);
    return { error: error.message };
  }

  revalidatePath("/review-queue");
  return { success: true };
}

export type EnrichFields = {
  supplier_name?: string;
  supplier_product_url?: string;
  supplier_sku?: string;
  supplier_cost?: number | null;
  notes?: string;
  status?: QueueStatus;
};

export async function enrichQueueItem(id: string, fields: EnrichFields) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("[review_queue] enrich error:", error);
    return { error: error.message };
  }

  revalidatePath("/review-queue");
  return { success: true };
}

// Converts a review_queue item into a sourcing_item (the main product pipeline).
// Maps compatible fields and marks the queue item as "ordered".
export async function convertToProduct(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  // Fetch the queue item
  const { data: item, error: fetchErr } = await supabase
    .from("review_queue")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();

  if (fetchErr || !item) {
    return { error: fetchErr?.message ?? "Item not found" };
  }

  // Insert into sourcing_items (the main product pipeline)
  const { error: insertErr } = await supabase.from("sourcing_items").insert({
    user_id: auth.user.id,
    asin: item.asin,
    title: item.title ?? "Unknown product",
    marketplace: "UK",
    supplier_name: item.supplier_name ?? null,
    supplier_url: item.supplier_product_url ?? null,
    supplier_cost: item.supplier_cost ?? item.cost_price ?? null,
    buy_box_price: item.buy_box_price ?? null,
    fees: item.referral_fee != null && item.fba_fee != null
      ? Number(item.referral_fee) + Number(item.fba_fee)
      : null,
    est_profit: item.net_profit ?? null,
    roi_pct: item.roi ?? null,
    notes: item.notes ?? null,
    image_url: item.image_url ?? null,
    tags: null,
    rank_text: null,
    status: "in_progress",
  });

  if (insertErr) {
    console.error("[review_queue] convertToProduct insert error:", insertErr);
    return { error: insertErr.message };
  }

  // Mark the queue item as ordered (converted)
  await supabase
    .from("review_queue")
    .update({ status: "ordered", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  revalidatePath("/review-queue");
  revalidatePath("/sourcing");
  return { success: true };
}
