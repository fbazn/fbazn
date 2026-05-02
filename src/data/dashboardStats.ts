import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalActive: number;
  totalSaved: number;
  totalRejected: number;
  totalReview: number;
  avgProfit: number;
  avgRoi: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("review_queue")
    .select("status, net_profit, roi, live_product, archived");

  if (error) {
    console.error("Failed to load dashboard stats", error);
    return {
      totalActive: 0,
      totalSaved: 0,
      totalRejected: 0,
      totalReview: 0,
      avgProfit: 0,
      avgRoi: 0,
    };
  }

  const rows = data ?? [];

  // live_product=true, not archived = sourcing list (active)
  const active = rows.filter((r) => r.live_product === true && !r.archived);
  // live_product=false, not archived = review queue
  const inReview = rows.filter((r) => r.live_product === false && !r.archived);
  // rejected status items
  const rejected = rows.filter((r) => r.status === "rejected");

  const profitValues = active
    .map((r) => r.net_profit)
    .filter((v): v is number => v != null);
  const avgProfit =
    profitValues.length > 0
      ? profitValues.reduce((sum, value) => sum + value, 0) / profitValues.length
      : 0;

  const roiValues = active
    .map((r) => r.roi)
    .filter((v): v is number => v != null && v > 0);
  const avgRoi =
    roiValues.length > 0
      ? roiValues.reduce((s, v) => s + v, 0) / roiValues.length
      : 0;

  return {
    totalActive: active.length,
    totalSaved: active.length, // kept for UI compat (shows in "Saved leads" card)
    totalRejected: rejected.length,
    totalReview: inReview.length,
    avgProfit,
    avgRoi: Math.round(avgRoi),
  };
}
