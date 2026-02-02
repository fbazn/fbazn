import { ReactNode } from "react";

type TooltipProps = {
  label: ReactNode;
  children: ReactNode;
};

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 z-30 hidden -translate-y-1/2 translate-x-3 whitespace-nowrap rounded-lg bg-[rgb(var(--bg-elevated))] px-3 py-2 text-xs text-[rgb(var(--text))] shadow-lg ring-1 ring-[rgb(var(--border))] group-hover:block">
        {label}
      </div>
    </div>
  );
}
