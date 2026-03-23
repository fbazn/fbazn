"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { MockItem } from "@/lib/mockData";
import { ReviewQueueProvider } from "./ReviewQueueContext";
import { AddLeadModal } from "./AddLeadModal";
import { OnboardingTour } from "./OnboardingTour";

export type AppUser = {
  id: string;
  email: string;
  name: string;
};

type AppShellProps = {
  children: ReactNode;
  recentItems: MockItem[];
  initialReviewQueueCount: number;
  user: AppUser | null;
  defaultMarketplace: string;
};

export function AppShell({
  children,
  recentItems,
  initialReviewQueueCount,
  user,
  defaultMarketplace,
}: AppShellProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  const isExpanded = isPinned || isHovering || isMobileOpen;
  const sidebarWidth = isExpanded ? "260px" : "72px";

  return (
    <ReviewQueueProvider initialCount={initialReviewQueueCount}>
      <div
        className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]"
        style={{ "--sidebar-width": sidebarWidth } as CSSProperties}
      >
        <Sidebar
          isExpanded={isExpanded}
          isPinned={isPinned}
          isMobileOpen={isMobileOpen}
          onTogglePin={() => setIsPinned((value) => !value)}
          onCloseMobile={() => setIsMobileOpen(false)}
          onHoverChange={(value) => setIsHovering(value)}
          recentItems={recentItems}
          user={user}
        />

        <TopBar
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenAddLead={() => setIsAddLeadOpen(true)}
          user={user}
        />

        <div className="relative pt-24 transition-[padding] md:pl-[var(--sidebar-width)]">
          <main className="mx-auto w-full max-w-screen-2xl px-4 pb-16 md:px-8">
            {children}
          </main>
        </div>

        {isAddLeadOpen && (
          <AddLeadModal
            defaultMarketplace={defaultMarketplace}
            onClose={() => setIsAddLeadOpen(false)}
          />
        )}

        <OnboardingTour />
      </div>
    </ReviewQueueProvider>
  );
}
