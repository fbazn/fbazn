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
