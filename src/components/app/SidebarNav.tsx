"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "./Badge";
import { LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  disabled?: boolean;
};

type SidebarNavProps = {
  items: NavItem[];
  isExpanded: boolean;
};

export function SidebarNav({ items, isExpanded }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.disabled ? "#" : item.href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-slate-800 text-slate-100"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
            } ${item.disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <Icon className="h-5 w-5" />
            {isExpanded && (
              <span className="flex flex-1 items-center justify-between">
                <span>{item.label}</span>
                {item.badge && <Badge label={item.badge} variant="muted" />}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
