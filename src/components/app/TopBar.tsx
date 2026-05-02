"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CreditCard,
  Laptop,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
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
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-4 border-b border-[rgb(var(--border))] bg-[rgba(8,12,24,0.88)] px-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl md:left-[var(--sidebar-width)] md:right-0 md:px-8">
      <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,rgba(245,158,11,0.55),rgba(99,102,241,0.45),transparent)]" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-9 w-9 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="section-label leading-none">Workspace</p>
          <h1 className="font-barlow-condensed text-2xl font-black uppercase leading-none tracking-normal text-[rgb(var(--text))]">
            {title}
          </h1>
        </div>
      </div>

      <div className="mx-auto hidden h-10 w-full max-w-xl items-center gap-2 border border-[rgb(var(--border))] bg-[rgba(8,12,24,0.72)] px-4 text-sm text-[rgb(var(--muted))] shadow-[inset_0_1px_0_rgba(240,244,255,0.04)] md:flex">
        <Search className="h-4 w-4 flex-shrink-0 text-[rgb(var(--muted))]" />
        <span className="select-none text-[rgb(var(--muted))]">
          Search - coming soon
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          id="tour-add-lead"
          type="button"
          onClick={onOpenAddLead}
          className="btn-primary hidden h-10 px-5 md:flex"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>

        <Tooltip label={`Theme: ${themeLabel}`}>
          <button
            type="button"
            onClick={cycleTheme}
            className="inline-flex h-9 w-9 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))] transition hover:border-amber-500/50 hover:bg-[rgb(var(--card))]"
            aria-label={`Theme: ${themeLabel}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
        </Tooltip>

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((value) => !value)}
            className="inline-flex h-9 items-center gap-2 border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-2 text-sm transition hover:border-amber-500/50 hover:bg-[rgb(var(--card))]"
          >
            <div className="flex h-6 w-6 items-center justify-center bg-[linear-gradient(135deg,rgb(var(--amber)),rgb(var(--indigo)))] font-barlow-condensed text-xs font-black text-white">
              {userInitials(displayName)}
            </div>
            <span className="hidden text-[rgb(var(--text))] md:inline">
              {displayName}
            </span>
          </button>

          {userMenuOpen && (
            <div className="industrial-panel absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden py-1.5">
              <div className="relative border-b border-[rgb(var(--border))] px-4 pb-3 pt-2">
                <p className="truncate text-sm font-semibold text-[rgb(var(--text))]">
                  {displayName}
                </p>
                <p className="truncate text-xs text-[rgb(var(--muted))]">
                  {displayEmail}
                </p>
              </div>

              <div className="relative py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-amber-500/5"
                >
                  <Settings className="h-4 w-4 text-[rgb(var(--muted))]" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/billing");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-amber-500/5"
                >
                  <CreditCard className="h-4 w-4 text-[rgb(var(--muted))]" />
                  Billing
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/help");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-[rgb(var(--text))] transition hover:bg-amber-500/5"
                >
                  <User className="h-4 w-4 text-[rgb(var(--muted))]" />
                  Help
                </button>
              </div>

              <div className="relative border-t border-[rgb(var(--border))] pt-1">
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="inline-flex h-9 w-9 items-center justify-center border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text))] transition hover:bg-[rgb(var(--card))] disabled:cursor-not-allowed disabled:opacity-70 md:hidden"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
