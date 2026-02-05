import { AppShell } from "@/components/app/AppShell";
import type { ReactNode } from "react";
import { getRecentRows, getReviewQueueCount } from "@/data/sourcingItems";
import { toMockItem } from "@/data/adapters";

export default async function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [recentRows, reviewQueueCount] = await Promise.all([
    getRecentRows(),
    getReviewQueueCount(),
  ]);
  const recentItems = recentRows.map(toMockItem);

  return (
    <AppShell
      recentItems={recentItems}
      initialReviewQueueCount={reviewQueueCount}
    >
      {children}
    </AppShell>
  );
}
