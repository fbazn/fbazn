import { createClient } from "@/lib/supabase/server";

export type DashboardStats = {
  totalActive: number;
  totalSaved: number;
  totalRejected: number;
  totalReview: number;
  projectedProfit: number;
  avgRoi: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sourcing_items")
    .select("status, est_profit, roi_pct");

  if (error) {
    console.error("Failed to load dashboard stats", error);
    return {
      totalActive: 0,
      totalSaved: 0,
      totalRejected: 0,
      totalReview: 0,
      projectedProfit: 0,
      avgRoi: 0,
    };
  }

  const rows = data ?? [];
  const saved = rows.filter((r) => r.status === "saved");
  const review = rows.filter((r) => r.status === "review");
  const inProgress = rows.filter((r) => r.status === "in_progress");
  const rejected = rows.filter((r) => r.status === "rejected");

  const active = [...saved, ...inProgress];
  const projectedProfit = saved.reduce(
    (sum, r) => sum + (r.est_profit ?? 0),
    0,
  );
  const roiValues = rows
    .map((r) => r.roi_pct)
    .filter((v): v is number => v != null && v > 0);
  const avgRoi =
    roiValues.length > 0
      ? roiValues.reduce((s, v) => s + v, 0) / roiValues.length
      : 0;

  return {
    totalActive: active.length,
    totalSaved: saved.length,
    totalRejected: rejected.length,
    totalReview: review.length,
    projectedProfit,
    avgRoi: Math.round(avgRoi),
  };
}
