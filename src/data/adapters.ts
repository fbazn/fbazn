import type { MockItem, ReviewQueueItem } from "@/lib/mockData";
import type { SourcingItemRow } from "./sourcingItems";

const fallbackImage =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=200&q=80";

const statusMap: Record<SourcingItemRow["status"], MockItem["status"]> = {
  review: "Review",
  saved: "Saved",
  rejected: "Rejected",
  in_progress: "In Progress",
};

const formatSavedAt = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const datePart = date.toLocaleDateString("en-CA");
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart} ${timePart}`;
};

const asNumber = (value: number | null) => value ?? 0;

export const toReviewQueueItem = (row: SourcingItemRow): ReviewQueueItem => ({
  id: row.id,
  type: "review",
  asin: row.asin ?? "",
  title: row.title ?? "",
  marketplace: row.marketplace ?? "",
  buyBoxPrice: asNumber(row.buy_box_price),
  estProfit: asNumber(row.est_profit),
  roiPct: asNumber(row.roi_pct),
  savedAt: formatSavedAt(row.created_at),
  status: "pending_review",
  supplierName: row.supplier_name ?? "",
  supplierUrl: row.supplier_url ?? "",
  supplierCost: asNumber(row.supplier_cost),
  tags: row.tags ?? "",
  notes: row.notes ?? "",
  imageUrl: row.image_url ?? fallbackImage,
});

export const toMockItem = (row: SourcingItemRow): MockItem => ({
  id: row.id,
  title: row.title ?? "",
  asin: row.asin ?? "",
  supplier: row.supplier_name ?? "",
  cost: asNumber(row.supplier_cost),
  buyBox: asNumber(row.buy_box_price),
  fees: asNumber(row.fees),
  profit: asNumber(row.est_profit),
  roi: asNumber(row.roi_pct),
  rank: row.rank_text ?? "",
  status: statusMap[row.status],
  imageUrl: row.image_url ?? fallbackImage,
});
