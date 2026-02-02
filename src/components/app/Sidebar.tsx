"use client";

import {
  LayoutDashboard,
  List,
  Search,
  Tag,
  Bell,
  Plug,
  CreditCard,
  Settings,
  HelpCircle,
  Pin,
} from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { SidebarItemStrip } from "./SidebarItemStrip";

type SidebarProps = {
  isExpanded: boolean;
  isPinned: boolean;
  isMobileOpen: boolean;
  onTogglePin: () => void;
  onCloseMobile: () => void;
  onHoverChange: (value: boolean) => void;
};

const primaryItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Sourcing List", href: "/sourcing", icon: List },
  { label: "ASIN Lookup", href: "/asin", icon: Search },
  { label: "Deals", href: "/deals", icon: Tag },
  { label: "Alerts", href: "/alerts", icon: Bell },
];

const secondaryItems = [
  {
    label: "Integrations",
    href: "/integrations",
    icon: Plug,
    badge: "🔒 Coming soon",
    disabled: true,
  },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar({
  isExpanded,
  isPinned,
  isMobileOpen,
  onTogglePin,
  onCloseMobile,
  onHoverChange,
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition md:hidden ${
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onCloseMobile}
      />
      <aside
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-slate-800 bg-slate-950/95 transition-all duration-200 md:translate-x-0 ${
          isExpanded ? "w-[260px]" : "w-[72px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold">
              FZ
            </div>
            {isExpanded && (
              <div>
                <div className="text-sm font-semibold">FBAZN</div>
                <div className="text-xs text-slate-500">app.fbazn.com</div>
              </div>
            )}
          </div>
          {isExpanded && (
            <button
              type="button"
              onClick={onTogglePin}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-300 transition ${
                isPinned ? "bg-slate-800" : "hover:bg-slate-800/70"
              }`}
              aria-label="Pin sidebar"
            >
              <Pin className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
          <SidebarNav items={primaryItems} isExpanded={isExpanded} />
          <SidebarItemStrip isExpanded={isExpanded} />
          <div className="mt-auto flex flex-col gap-4">
            <SidebarNav items={secondaryItems} isExpanded={isExpanded} />
          </div>
        </div>

        <div className="border-t border-slate-800 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500" />
            {isExpanded && (
              <div>
                <div className="text-sm font-semibold">Amelia Reyes</div>
                <div className="text-xs text-slate-500">Ops Manager</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
