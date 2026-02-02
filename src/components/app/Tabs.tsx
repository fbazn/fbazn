import { ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  disabled?: boolean;
};

type TabsProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  children: ReactNode;
};

export function Tabs({ tabs, activeTab, onChange, children }: TabsProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                tab.disabled
                  ? "cursor-not-allowed text-slate-500"
                  : isActive
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4">{children}</div>
    </div>
  );
}
