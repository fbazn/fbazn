import { ReactNode } from "react";

type TooltipProps = {
  label: ReactNode;
  children: ReactNode;
};

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 z-30 hidden -translate-y-1/2 translate-x-3 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-100 shadow-lg ring-1 ring-slate-800 group-hover:block">
        {label}
      </div>
    </div>
  );
}
