"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type QueueStatus =
  | "pending"
  | "reviewing"
  | "contacted"
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

// ── Bulk actions ───────────────────────────────────────────────────────────

export async function bulkDeleteQueueItems(ids: string[]) {
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
  revalidatePath("/review-queue");
  return { success: true };
}

export async function bulkConvertToProduct(ids: string[]) {
  if (!ids.length) return { success: true };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({ live_product: true, updated_at: new Date().toISOString() })
    .in("id", ids)
    .eq("user_id", auth.user.id);

  if (error) return { error: error.message };
  revalidatePath("/review-queue");
  revalidatePath("/sourcing");
  return { success: true };
}

export async function bulkUpdateQueueStatus(ids: string[], status: QueueStatus) {
  if (!ids.length) return { success: true };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids)
    .eq("user_id", auth.user.id);

  if (error) return { error: error.message };
  revalidatePath("/review-queue");
  return { success: true };
}

// Converts a review_queue item into a live product by flipping live_product = true.
// The item stays in review_queue but is now shown in the Sourcing List instead.
export async function convertToProduct(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue")
    .update({ live_product: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("[review_queue] convertToProduct error:", error);
    return { error: error.message };
  }

  revalidatePath("/review-queue");
  revalidatePath("/sourcing");
  return { success: true };
}
