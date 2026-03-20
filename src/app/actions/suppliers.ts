"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────────────────

export type Supplier = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  created_at: string;
};

export type ProductSupplier = {
  id: string;
  queue_item_id: string;
  supplier_id: string;
  supplier_sku: string | null;
  cost_price: number | null;
  created_at: string;
  supplier: Supplier;
};

// ── Supplier directory ─────────────────────────────────────────────────────

/** List all suppliers for the current user */
export async function getSuppliers(): Promise<Supplier[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data } = await supabase
    .from("suppliers")
    .select("id, name, website, notes, created_at")
    .eq("user_id", auth.user.id)
    .order("name");

  return (data ?? []) as Supplier[];
}

/** Create a new supplier in the user's directory */
export async function createSupplier(fields: {
  name: string;
  website?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("suppliers")
    .insert({ user_id: auth.user.id, ...fields })
    .select("id, name, website, notes, created_at")
    .single();

  if (error) {
    console.error("[suppliers] createSupplier error:", error);
    return { error: error.message };
  }

  revalidatePath("/suppliers");
  revalidatePath("/review-queue");
  return { success: true, supplier: data as Supplier };
}

// ── Product ↔ Supplier links ────────────────────────────────────────────────

/** Get all suppliers linked to a queue item, sorted cheapest first */
export async function getProductSuppliers(
  queueItemId: string,
): Promise<ProductSupplier[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data } = await supabase
    .from("review_queue_suppliers")
    .select(
      "id, queue_item_id, supplier_id, supplier_sku, cost_price, created_at, supplier:suppliers(id, name, website, notes, created_at)",
    )
    .eq("queue_item_id", queueItemId)
    .order("cost_price", { ascending: true, nullsFirst: false });

  return (data ?? []) as unknown as ProductSupplier[];
}

/** Link a supplier to a queue item */
export async function addProductSupplier(fields: {
  queue_item_id: string;
  supplier_id: string;
  supplier_sku?: string;
  cost_price?: number | null;
}) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  // Verify user owns the queue item
  const { data: item } = await supabase
    .from("review_queue")
    .select("id")
    .eq("id", fields.queue_item_id)
    .eq("user_id", auth.user.id)
    .single();

  if (!item) return { error: "Queue item not found" };

  const { data, error } = await supabase
    .from("review_queue_suppliers")
    .insert(fields)
    .select(
      "id, queue_item_id, supplier_id, supplier_sku, cost_price, created_at, supplier:suppliers(id, name, website, notes, created_at)",
    )
    .single();

  if (error) {
    console.error("[suppliers] addProductSupplier error:", error);
    return { error: error.message };
  }

  // Update review_queue cost_price to cheapest supplier
  await _syncCheapestCost(supabase, fields.queue_item_id, auth.user.id);

  revalidatePath("/review-queue");
  revalidatePath("/suppliers");
  return { success: true, productSupplier: data as unknown as ProductSupplier };
}

/** Update a product-supplier link (SKU or cost) */
export async function updateProductSupplier(
  id: string,
  fields: { supplier_sku?: string; cost_price?: number | null },
) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { data: link } = await supabase
    .from("review_queue_suppliers")
    .select("queue_item_id")
    .eq("id", id)
    .single();

  if (!link) return { error: "Link not found" };

  const { error } = await supabase
    .from("review_queue_suppliers")
    .update(fields)
    .eq("id", id);

  if (error) return { error: error.message };

  await _syncCheapestCost(supabase, link.queue_item_id, auth.user.id);

  revalidatePath("/review-queue");
  return { success: true };
}

/** Remove a supplier link from a queue item */
export async function removeProductSupplier(id: string, queueItemId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("review_queue_suppliers")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  await _syncCheapestCost(supabase, queueItemId, auth.user.id);

  revalidatePath("/review-queue");
  revalidatePath("/suppliers");
  return { success: true };
}

// ── Internal helper ────────────────────────────────────────────────────────

/** After any supplier cost change, write the cheapest cost_price back to review_queue */
async function _syncCheapestCost(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  queueItemId: string,
  userId: string,
) {
  const { data: links } = await supabase
    .from("review_queue_suppliers")
    .select("cost_price")
    .eq("queue_item_id", queueItemId)
    .not("cost_price", "is", null)
    .order("cost_price", { ascending: true })
    .limit(1);

  const cheapest = links?.[0]?.cost_price ?? null;

  await supabase
    .from("review_queue")
    .update({ cost_price: cheapest, updated_at: new Date().toISOString() })
    .eq("id", queueItemId)
    .eq("user_id", userId);
}

// ── Suppliers directory page data ──────────────────────────────────────────

export type SupplierWithCount = Supplier & { product_count: number };

/** Get all suppliers with how many products each has */
export async function getSuppliersWithCounts(): Promise<SupplierWithCount[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data } = await supabase
    .from("suppliers")
    .select(
      "id, name, website, notes, created_at, review_queue_suppliers(id)",
    )
    .eq("user_id", auth.user.id)
    .order("name");

  return (data ?? []).map((s: Record<string, unknown>) => ({
    ...(s as Omit<typeof s, "review_queue_suppliers">),
    product_count: Array.isArray(s.review_queue_suppliers)
      ? s.review_queue_suppliers.length
      : 0,
  })) as SupplierWithCount[];
}

/** Get a single supplier + all queue items linked to it */
export async function getSupplierWithProducts(supplierId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("id, name, website, notes, created_at")
    .eq("id", supplierId)
    .eq("user_id", auth.user.id)
    .single();

  if (!supplier) return null;

  // Get all queue items linked to this supplier (via junction)
  const { data: links } = await supabase
    .from("review_queue_suppliers")
    .select(
      "id, supplier_sku, cost_price, queue_item_id, review_queue(id, asin, title, image_url, buy_box_price, net_profit, roi, status, cost_price)",
    )
    .eq("supplier_id", supplierId)
    .order("cost_price", { ascending: true });

  return {
    supplier: supplier as Supplier,
    links: (links ?? []) as unknown as Array<{
      id: string;
      supplier_sku: string | null;
      cost_price: number | null;
      queue_item_id: string;
      review_queue: {
        id: string;
        asin: string;
        title: string | null;
        image_url: string | null;
        buy_box_price: number | null;
        net_profit: number | null;
        roi: number | null;
        status: string;
        cost_price: number | null;
      } | null;
    }>,
  };
}
