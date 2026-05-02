"use client";

import {
  Archive,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  List,
  Pin,
  Plug,
  Search,
  Settings,
} from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { SidebarItemStrip } from "./SidebarItemStrip";
import { useReviewQueue } from "./ReviewQueueContext";
import type { MockItem } from "@/lib/mockData";
import type { AppUser } from "./AppShell";

type SidebarProps = {
  isExpanded: boolean;
  isPinned: boolean;
  isMobileOpen: boolean;
  onTogglePin: () => void;
  onCloseMobile: () => void;
  onHoverChange: (value: boolean) => void;
  recentItems: MockItem[];
  user: AppUser | null;
};

const secondaryItems = [
  {
    label: "Integrations",
    href: "/integrations",
    icon: Plug,
    badge: "Soon",
    disabled: true,
  },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings, id: "tour-settings" },
  { label: "Help", href: "/help", icon: HelpCircle },
];

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function Sidebar({
  isExpanded,
  isPinned,
  isMobileOpen,
  onTogglePin,
  onCloseMobile,
  onHoverChange,
  recentItems,
  user,
}: SidebarProps) {
  const { reviewQueueCount } = useReviewQueue();

  const primaryItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, id: "tour-dashboard" },
    {
      label: "Review Queue",
      href: "/review-queue",
      icon: ClipboardList,
      badge: reviewQueueCount > 0 ? `${reviewQueueCount}` : undefined,
      id: "tour-review-queue",
    },
    { label: "Sourcing List", href: "/sourcing", icon: List, id: "tour-sourcing" },
    { label: "ASIN Lookup", href: "/asin", icon: Search },
    { label: "Suppliers", href: "/suppliers", icon: Building2, id: "tour-suppliers" },
    { label: "Archived", href: "/archived", icon: Archive },
    { label: "Alerts", href: "/alerts", icon: Bell },
  ];

  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? "";

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition md:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
      />
      <aside
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-[rgb(var(--border))] bg-[rgba(8,12,24,0.94)] shadow-[16px_0_54px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-200 md:translate-x-0 ${
          isExpanded ? "w-[260px]" : "w-[72px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div
          className="relative flex items-center justify-between px-4"
          style={{ height: "64px", borderBottom: "1px solid rgb(var(--border))" }}
        >
          <div className="flex items-center">
            {isExpanded ? (
              <div>
                <span
                  className="select-none font-barlow-condensed font-black uppercase tracking-normal"
                  style={{ fontSize: "24px", color: "rgb(var(--text))" }}
                >
                  FB<span style={{ color: "rgb(var(--indigo))" }}>AZN</span>
                </span>
                <p className="section-label -mt-1 text-[9px]">
                  Command centre
                </p>
              </div>
            ) : (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-[linear-gradient(135deg,rgb(var(--amber)),rgb(var(--indigo)))] font-barlow-condensed text-sm font-black text-white [clip-path:polygon(6px_0%,100%_0%,calc(100%_-_6px)_100%,0%_100%)]">
                FZ
              </div>
            )}
          </div>

          {isExpanded && (
            <button
              type="button"
              onClick={onTogglePin}
              className={`flex h-8 w-8 items-center justify-center border text-[rgb(var(--muted))] transition ${
                isPinned
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                  : "border-[rgb(var(--border))] hover:border-amber-500/50 hover:bg-[rgb(var(--card))]"
              }`}
              aria-label="Pin sidebar"
            >
              <Pin className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="hazard-bar" />

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
          <SidebarNav items={primaryItems} isExpanded={isExpanded} />
          <SidebarItemStrip isExpanded={isExpanded} items={recentItems} />
          <div className="mt-auto flex flex-col gap-4">
            <SidebarNav items={secondaryItems} isExpanded={isExpanded} />
          </div>
        </div>

        <div className="border-t border-[rgb(var(--border))] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-[linear-gradient(135deg,rgb(var(--amber)),rgb(var(--indigo)))] font-barlow-condensed text-xs font-black text-white">
              {userInitials(displayName)}
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {displayName}
                </div>
                <div className="truncate text-xs text-[rgb(var(--muted))]">
                  {displayEmail}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
