"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ProductUpdate = {
  supplier_name?: string;
  supplier_url?: string;
  supplier_cost?: number | null;
  notes?: string;
};

/** Update editable fields on a live product (review_queue row) */
export async function updateProduct(id: string, fields: ProductUpdate) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({
      supplier_name: fields.supplier_name,
      supplier_cost: fields.supplier_cost,
      notes: fields.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("Failed to update product", error);
    return { error: error.message };
  }

  revalidatePath("/sourcing");
  return { success: true };
}

/** Move a live product to the archived state */
export async function archiveProduct(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("Failed to archive product", error);
    return { error: error.message };
  }

  revalidatePath("/sourcing");
  revalidatePath("/archived");
  return { success: true };
}

/** Restore an archived product back to the sourcing list */
export async function restoreProduct(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({ archived: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("Failed to restore product", error);
    return { error: error.message };
  }

  revalidatePath("/sourcing");
  revalidatePath("/archived");
  return { success: true };
}

// ── Compatibility exports ─────────────────────────────────────────────────────

/** Manually add a lead directly into the review queue */
export async function createSourcingItem(item: {
  asin: string;
  title: string;
  marketplace?: string;
  supplier_name?: string;
  supplier_url?: string;
  supplier_cost?: number;
  buy_box_price?: number;
  fees?: number;
  est_profit?: number;
  roi_pct?: number;
  rank_text?: string;
  tags?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase.from("review_queue").insert({
    user_id: auth.user.id,
    asin: item.asin,
    title: item.title,
    marketplace: item.marketplace ?? "UK",
    supplier_name: item.supplier_name ?? null,
    supplier_product_url: item.supplier_url ?? null,
    cost_price: item.supplier_cost ?? null,
    buy_box_price: item.buy_box_price ?? null,
    net_profit: item.est_profit ?? null,
    roi: item.roi_pct ?? null,
    notes: item.notes ?? null,
    live_product: false,
    archived: false,
  });

  if (error) {
    console.error("Failed to create sourcing item", error);
    return { error: error.message };
  }

  revalidatePath("/review-queue");
  return { error: null };
}

/** Legacy alias — updates a review_queue row */
export async function updateSourcingItem(
  id: string,
  fields: { supplier_name?: string; supplier_url?: string; supplier_cost?: number | null; notes?: string },
) {
  return updateProduct(id, fields);
}

/** Legacy alias — archives the item */
export async function setSourcingStatus(id: string) {
  return archiveProduct(id);
}

/** Archive multiple products at once */
export async function bulkArchiveProducts(ids: string[]) {
  if (!ids.length) return { success: true };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .in("id", ids)
    .eq("user_id", auth.user.id);

  if (error) return { error: error.message };
  revalidatePath("/sourcing");
  revalidatePath("/archived");
  return { success: true };
}

/** Permanently delete multiple products */
export async function bulkDeleteProducts(ids: string[]) {
  if (!ids.length) return { success: true };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .delete()
    .in("id", ids)
    .eq("user_id", auth.user.id);

  if (error) return { error: error.message };
  revalidatePath("/sourcing");
  return { success: true };
}

/** Permanently delete a product */
export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("Failed to delete product", error);
    return { error: error.message };
  }

  revalidatePath("/sourcing");
  revalidatePath("/archived");
  return { success: true };
}
