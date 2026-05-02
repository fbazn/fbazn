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
        className="relative min-h-screen overflow-hidden bg-[rgb(var(--bg))] text-[rgb(var(--text))]"
        style={{ "--sidebar-width": sidebarWidth } as CSSProperties}
      >
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(115deg,rgba(245,158,11,0.14),transparent_34%,rgba(99,102,241,0.16)_72%,transparent)]" />
          <div className="absolute inset-y-0 left-0 w-px bg-amber-500/30 md:left-[var(--sidebar-width)]" />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgba(99,102,241,0.08),transparent)]" />
        </div>

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

        <div className="relative z-10 pt-24 transition-[padding] md:pl-[var(--sidebar-width)]">
          <main className="mx-auto w-full max-w-[1500px] px-4 pb-16 md:px-8">
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
