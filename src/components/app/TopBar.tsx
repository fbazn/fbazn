"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Laptop,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
} from "lucide-react";
import { Tooltip } from "./Tooltip";
import { useTheme } from "./ThemeProvider";
import { createClient } from "@/lib/supabase/client";

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
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const themeLabel =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;

  const cycleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <header className="glass-panel fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-4 px-4 md:left-[var(--sidebar-width)] md:right-0 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-[rgb(var(--text))]">
          {title}
        </h1>
      </div>

      <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-sm text-[rgb(var(--muted))] md:flex">
        <Search className="h-4 w-4 text-[rgb(var(--muted))]" />
        <input
          className="w-full bg-transparent text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:outline-none"
          placeholder="Search products, suppliers, ASINs..."
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="hidden items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 md:flex">
          <Plus className="h-4 w-4" />
          Add
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="hidden items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--card))] disabled:cursor-not-allowed disabled:opacity-70 md:flex"
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? "Signing out" : "Log out"}
        </button>
        <Tooltip label={`Theme: ${themeLabel}`}>
          <button
            type="button"
            onClick={cycleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))] transition hover:bg-[rgb(var(--card))]"
            aria-label={`Theme: ${themeLabel}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
        </Tooltip>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))]">
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))] transition hover:bg-[rgb(var(--card))] disabled:cursor-not-allowed disabled:opacity-70 md:hidden"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
        <button className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-2 py-1.5 text-sm">
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
          <span className="hidden text-[rgb(var(--text))] md:inline">
            Amelia
          </span>
          <ChevronDown className="h-4 w-4 text-[rgb(var(--muted))]" />
        </button>
      </div>
    </header>
  );
}
