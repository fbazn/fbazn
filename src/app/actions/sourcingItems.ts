"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type NewSourcingItem = {
  asin: string;
  title: string;
  marketplace: string;
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
  image_url?: string;
};

export async function createSourcingItem(item: NewSourcingItem) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not authenticated" };

  const { error } = await supabase.from("sourcing_items").insert({
    ...item,
    user_id: authData.user.id,
    status: "review",
  });

  if (error) {
    console.error("Failed to create sourcing item", error);
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/review-queue");
  revalidatePath("/sourcing");
  return { error: null };
}

type SourcingItemUpdate = {
  supplier_name?: string;
  supplier_url?: string;
  supplier_cost?: number | null;
  notes?: string;
  tags?: string;
};

export async function updateProduct(id: string, fields: SourcingItemUpdate) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("sourcing_items")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    console.error("Failed to update product", error);
    return { error: error.message };
  }

  revalidatePath("/sourcing");
  return { success: true };
}

export async function archiveProduct(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("sourcing_items")
    .update({ status: "archived", updated_at: new Date().toISOString() })
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

export async function restoreProduct(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("sourcing_items")
    .update({ status: "in_progress", updated_at: new Date().toISOString() })
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

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("sourcing_items")
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

// Legacy helpers kept for compatibility
export async function updateSourcingItem(id: string, patch: SourcingItemUpdate) {
  return updateProduct(id, patch);
}

export async function setSourcingStatus(
  id: string,
  status: "review" | "saved" | "rejected" | "in_progress" | "archived",
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sourcing_items")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) { console.error("Failed to update sourcing status", error); }

  revalidatePath("/");
  revalidatePath("/sourcing");
  revalidatePath("/archived");
}
