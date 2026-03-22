// Legacy type used by AppShell, Sidebar, SidebarItemStrip, and the adapters layer.
// Real data from `review_queue` is converted to this shape via `src/data/adapters.ts`.
// TODO: migrate all consumers to a proper DB-typed shape and delete this file.

export type MockItem = {
  id: string;
  title: string;
  asin: string;
  supplier: string;
  cost: number;
  buyBox: number;
  fees: number;
  profit: number;
  roi: number;
  rank: string;
  status: "Review" | "Saved" | "Rejected" | "In Progress";
  imageUrl?: string;
};
