import { AppShell } from "@/components/app/AppShell";
import type { ReactNode } from "react";
import { getRecentRows, getReviewQueueCount } from "@/data/sourcingItems";
import { toMockItem } from "@/data/adapters";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateUserSettings } from "@/data/userSettings";

export default async function AppLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();
  const [{ data: authData }, recentRows, reviewQueueCount, userSettings] = await Promise.all([
    supabase.auth.getUser(),
    getRecentRows(),
    getReviewQueueCount(),
    getOrCreateUserSettings().catch(() => null),
  ]);
  const recentItems = recentRows.map(toMockItem);

  const user = authData.user
    ? {
        id: authData.user.id,
        email: authData.user.email ?? "",
        name:
          (authData.user.user_metadata?.full_name as string | undefined) ??
          (authData.user.user_metadata?.name as string | undefined) ??
          authData.user.email?.split("@")[0] ??
          "User",
      }
    : null;

  return (
    <AppShell
      recentItems={recentItems}
      initialReviewQueueCount={reviewQueueCount}
      user={user}
      defaultMarketplace={userSettings?.default_marketplace ?? "UK"}
    >
      {children}
    </AppShell>
  );
}
