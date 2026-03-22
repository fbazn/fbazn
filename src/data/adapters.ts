import type { MockItem } from "@/lib/mockData";
import type { SourcingItemRow } from "./sourcingItems";

const asNumber = (value: number | null | undefined) => value ?? 0;

/** Convert a review_queue SourcingItemRow to the legacy MockItem shape used by AppShell/dashboard */
export const toMockItem = (row: SourcingItemRow): MockItem => ({
  id: row.id,
  title: row.title ?? "",
  asin: row.asin ?? "",
  supplier: row.supplier_name ?? "",
  cost: asNumber(row.cost_price),
  buyBox: asNumber(row.buy_box_price),
  fees: asNumber(row.referral_fee) + asNumber(row.fba_fee),
  profit: asNumber(row.net_profit),
  roi: asNumber(row.roi),
  rank: "",
  status: row.live_product ? "In Progress" : "Review",
  imageUrl: row.image_url ?? undefined,
});
