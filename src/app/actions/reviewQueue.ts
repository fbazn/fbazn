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
    .eq("user_id", auth.user.id); // RLS double-check

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
    .eq("user_id", auth.user.id); // RLS double-check

  if (error) {
    console.error("[review_queue] delete error:", error);
    return { error: error.message };
  }

  revalidatePath("/review-queue");
  return { success: true };
}
