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
  id?: string;
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
            id={item.id}
            href={item.disabled ? "#" : item.href}
            className={`group relative flex items-center gap-3 px-3 py-2.5 transition ${
              isActive
                ? "text-[rgb(var(--text))]"
                : "text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgba(99,102,241,0.06)]"
            } ${item.disabled ? "cursor-not-allowed opacity-60" : ""}`}
            style={isActive ? {
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '2px',
            } : {
              border: '1px solid transparent',
              borderRadius: '2px',
            }}
          >
            {isActive && (
              <span
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ background: 'rgb(var(--indigo))', borderRadius: '0 2px 2px 0' }}
              />
            )}
            <Icon
              className="h-4 w-4 flex-shrink-0"
              style={{ color: isActive ? 'rgb(var(--indigo))' : undefined }}
            />
            {isExpanded && (
              <span className="flex flex-1 items-center justify-between text-[13px] font-semibold uppercase tracking-wider">
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
