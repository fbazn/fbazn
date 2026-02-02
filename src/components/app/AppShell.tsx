"use client";

import { createContext, useContext, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { DetailsDrawer } from "./DetailsDrawer";
import { MockItem } from "@/lib/mockData";

type DetailsDrawerContextValue = {
  selectedItem: MockItem | null;
  isOpen: boolean;
  openDrawer: (item: MockItem) => void;
  closeDrawer: () => void;
};

const DetailsDrawerContext = createContext<DetailsDrawerContextValue | undefined>(
  undefined
);

export function useDetailsDrawer() {
  const context = useContext(DetailsDrawerContext);
  if (!context) {
    throw new Error("useDetailsDrawer must be used within AppShell");
  }
  return context;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isExpanded = isPinned || isHovering || isMobileOpen;
  const sidebarWidth = isExpanded ? "260px" : "72px";

  const openDrawer = (item: MockItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const contextValue: DetailsDrawerContextValue = {
    selectedItem,
    isOpen: isDrawerOpen,
    openDrawer,
    closeDrawer,
  };

  return (
    <DetailsDrawerContext.Provider value={contextValue}>
      <div
        className="min-h-screen bg-slate-950 text-slate-100"
        style={{ "--sidebar-width": sidebarWidth } as CSSProperties}
      >
        <Sidebar
          isExpanded={isExpanded}
          isPinned={isPinned}
          isMobileOpen={isMobileOpen}
          onTogglePin={() => setIsPinned((value) => !value)}
          onCloseMobile={() => setIsMobileOpen(false)}
          onHoverChange={(value) => setIsHovering(value)}
        />

        <TopBar onOpenMobileMenu={() => setIsMobileOpen(true)} />

        <div
          className={`relative pt-24 transition-[padding] md:pl-[var(--sidebar-width)] ${
            isDrawerOpen ? "md:pr-[420px]" : "md:pr-0"
          }`}
        >
          <main className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8">
            {children}
          </main>
        </div>

        {isDrawerOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={closeDrawer}
          />
        )}
        <DetailsDrawer />
      </div>
    </DetailsDrawerContext.Provider>
  );
}
