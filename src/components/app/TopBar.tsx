"use client";

import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  Plus,
  Search,
} from "lucide-react";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/sourcing": "Sourcing List",
  "/asin": "ASIN Lookup",
  "/deals": "Deals",
  "/alerts": "Alerts",
  "/integrations": "Integrations",
  "/billing": "Billing",
  "/settings": "Settings",
  "/help": "Help",
};

type TopBarProps = {
  onOpenMobileMenu: () => void;
};

export function TopBar({ onOpenMobileMenu }: TopBarProps) {
  const pathname = usePathname();
  const title = routeTitles[pathname] ?? "Dashboard";

  return (
    <header className="glass-panel fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-4 px-4 md:left-[var(--sidebar-width)] md:right-0 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-200 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
      </div>

      <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 md:flex">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          placeholder="Search products, suppliers, ASINs..."
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="hidden items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 md:flex">
          <Plus className="h-4 w-4" />
          Add
        </button>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-200">
          <Bell className="h-4 w-4" />
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-2 py-1.5 text-sm">
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
          <span className="hidden text-slate-200 md:inline">Amelia</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
}
