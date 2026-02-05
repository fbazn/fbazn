"use client";

import { DataTable } from "@/components/app/DataTable";
import { useDetailsDrawer } from "@/components/app/AppShell";
import { mockSourcingRows } from "@/lib/mockData";
import { Badge } from "@/components/app/Badge";

export default function SourcingPage() {
  const { openDrawer } = useDetailsDrawer();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
            Sourcing List
          </h2>
          <p className="text-sm text-[rgb(var(--muted))]">
            Evaluate incoming leads and open details for quick ROI checks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge label="128 active" variant="muted" />
          <button className="rounded-full border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm text-[rgb(var(--text))]">
            Export
          </button>
          <button className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
            New lead
          </button>
        </div>
      </div>
      <DataTable rows={mockSourcingRows} onRowClick={openDrawer} />
    </div>
  );
}
