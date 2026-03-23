"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Laptop,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  User,
  CreditCard,
  Settings,
} from "lucide-react";
import { Tooltip } from "./Tooltip";
import { useTheme } from "./ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import type { AppUser } from "./AppShell";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/review-queue": "Review Queue",
  "/sourcing": "Sourcing List",
  "/asin": "ASIN Lookup",
  "/suppliers": "Suppliers",
  "/archived": "Archived Products",
  "/inbound": "Inbound",
  "/inventory": "Inventory",
  "/deals": "Deals",
  "/alerts": "Alerts",
  "/integrations": "Integrations",
  "/billing": "Billing",
  "/settings": "Settings",
  "/help": "Help",
};

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type TopBarProps = {
  onOpenMobileMenu: () => void;
  onOpenAddLead: () => void;
  user: AppUser | null;
};

export function TopBar({ onOpenMobileMenu, onOpenAddLead, user }: TopBarProps) {
  const pathname = usePathname();
  const title = routeTitles[pathname] ?? "Dashboard";
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const themeLabel =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";
  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;

  const cycleTheme = () => {
    setTheme(theme === "light" ? "dark" : theme === "dark" ? "system" : "light");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setUserMenuOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
    setIsSigningOut(false);
  };

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = user?.name ?? "User";
  const displayEmail = user?.email ?? "";

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

      {/* Search — non-functional placeholder until global search is built */}
      <div className="mx-auto hidden w-full max-w-xl items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-sm text-[rgb(var(--muted))] md:flex">
        <Search className="h-4 w-4 flex-shrink-0 text-[rgb(var(--muted))]" />
        <span className="select-none text-[rgb(var(--muted))]">
          Search — coming soon
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Add lead */}
        <button
          id="tour-add-lead"
          type="button"
          onClick={onOpenAddLead}
          className="hidden items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 md:flex"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>

        {/* Theme toggle */}
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

        {/* User menu */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-2 py-1.5 text-sm transition hover:bg-[rgb(var(--card))]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-semibold text-white">
              {userInitials(displayName)}
            </div>
            <span className="hidden text-[rgb(var(--text))] md:inline">
              {displayName}
            </span>
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] py-1.5 shadow-xl">
              {/* User info */}
              <div className="border-b border-[rgb(var(--border))] px-4 pb-3 pt-2">
                <p className="text-sm font-semibold text-[rgb(var(--text))] truncate">
                  {displayName}
                </p>
                <p className="text-xs text-[rgb(var(--muted))] truncate">
                  {displayEmail}
                </p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { setUserMenuOpen(false); router.push("/settings"); }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--panel))]"
                >
                  <Settings className="h-4 w-4 text-[rgb(var(--muted))]" />
                  Settings
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); router.push("/billing"); }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--panel))]"
                >
                  <CreditCard className="h-4 w-4 text-[rgb(var(--muted))]" />
                  Billing
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); router.push("/help"); }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-[rgb(var(--panel))]"
                >
                  <User className="h-4 w-4 text-[rgb(var(--muted))]" />
                  Help
                </button>
              </div>

              {/* Sign out */}
              <div className="border-t border-[rgb(var(--border))] pt-1">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))] transition hover:bg-[rgb(var(--card))] disabled:cursor-not-allowed disabled:opacity-70 md:hidden"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
