"use client";

import { mockRecentItems } from "@/lib/mockData";
import { Tooltip } from "./Tooltip";
import { useDetailsDrawer } from "./AppShell";

export function SidebarItemStrip({ isExpanded }: { isExpanded: boolean }) {
  const { openDrawer } = useDetailsDrawer();

  return (
    <div className="space-y-2">
      {isExpanded && (
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recent
        </p>
      )}
      <div className={`grid gap-2 ${isExpanded ? "grid-cols-3" : "grid-cols-1"}`}>
        {mockRecentItems.slice(0, 9).map((item) => {
          const initials = item.title
            .split(" ")
            .slice(0, 2)
            .map((word) => word[0])
            .join("");
          return (
            <Tooltip
              key={item.id}
              label={
                <div className="space-y-1">
                  <div className="font-semibold text-slate-100">{item.title}</div>
                  <div className="text-[11px] text-slate-300">
                    ROI {item.roi}% • Profit ${item.profit.toFixed(2)}
                  </div>
                </div>
              }
            >
              <button
                type="button"
                onClick={() => openDrawer(item)}
                className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-200 transition hover:border-slate-600"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">
                    {initials}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
