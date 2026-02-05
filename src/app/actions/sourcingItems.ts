"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SourcingItemUpdate = {
  supplier_name?: string;
  supplier_url?: string;
  supplier_cost?: number;
  tags?: string;
  notes?: string;
};

export async function updateSourcingItem(
  id: string,
  patch: SourcingItemUpdate
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sourcing_items")
    .update(patch)
    .eq("id", id);

  if (error) {
    console.error("Failed to update sourcing item", error);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/review-queue");
  revalidatePath("/sourcing");
  revalidatePath("/sourcing-list");
}

export async function setSourcingStatus(
  id: string,
  status: "review" | "saved" | "rejected" | "in_progress"
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sourcing_items")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Failed to update sourcing status", error);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/review-queue");
  revalidatePath("/sourcing");
  revalidatePath("/sourcing-list");
}

export async function seedSourcingItems() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return;
  }

  const now = new Date().toISOString();
  const rows = [
    {
      user_id: data.user.id,
      asin: "B0DEVSEED1",
      title: "SolarPro Outdoor Lantern",
      marketplace: "US",
      supplier_name: "Bright Wholesale",
      supplier_url: "https://supplier.example.com/solarpro-lantern",
      supplier_cost: 12.4,
      buy_box_price: 36.99,
      fees: 8.1,
      est_profit: 16.49,
      roi_pct: 133,
      rank_text: "#2,410 Outdoors",
      tags: "outdoor, lighting",
      notes: "Seasonal promo candidate.",
      image_url:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80",
      status: "review",
      created_at: now,
      updated_at: now,
    },
    {
      user_id: data.user.id,
      asin: "B0DEVSEED2",
      title: "Metro Luxe Desk Organizer",
      marketplace: "UK",
      supplier_name: "Stationery Hub",
      supplier_url: "https://supplier.example.com/desk-organizer",
      supplier_cost: 7.8,
      buy_box_price: 24.5,
      fees: 5.4,
      est_profit: 11.3,
      roi_pct: 145,
      rank_text: "#3,102 Office",
      tags: "office, storage",
      notes: "Check packaging dimensions.",
      image_url:
        "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=200&q=80",
      status: "review",
      created_at: now,
      updated_at: now,
    },
    {
      user_id: data.user.id,
      asin: "B0DEVSEED3",
      title: "Nimbus Travel Mug",
      marketplace: "DE",
      supplier_name: "Urban Traders",
      supplier_url: "https://supplier.example.com/nimbus-mug",
      supplier_cost: 5.6,
      buy_box_price: 19.99,
      fees: 4.8,
      est_profit: 9.59,
      roi_pct: 171,
      rank_text: "#4,880 Kitchen",
      tags: "drinkware, travel",
      notes: "Consider bundling with lids.",
      image_url:
        "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=200&q=80",
      status: "review",
      created_at: now,
      updated_at: now,
    },
  ];

  const { error } = await supabase.from("sourcing_items").insert(rows);

  if (error) {
    console.error("Failed to seed sourcing items", error);
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/review-queue");
  revalidatePath("/sourcing");
  revalidatePath("/sourcing-list");
}
