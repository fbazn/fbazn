"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Tabs } from "./Tabs";
import { Badge } from "./Badge";
import { useDetailsDrawer } from "./AppShell";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "fees", label: "Fees/ROI" },
  { id: "notes", label: "Notes" },
  { id: "history", label: "History 🔒", disabled: true },
];

export function DetailsDrawer() {
  const { isOpen, selectedItem, closeDrawer } = useDetailsDrawer();
  const [activeTab, setActiveTab] = useState("overview");

  if (!selectedItem) {
    return null;
  }

  return (
    <div
      className={`fixed right-0 top-0 z-40 h-full w-full max-w-md transform bg-[rgb(var(--bg))] shadow-2xl transition duration-200 md:w-[420px] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col border-l border-[rgb(var(--border))]">
        <div className="flex items-start justify-between border-b border-[rgb(var(--border))] px-6 py-6">
          <div className="space-y-2">
            <Badge label="Details" variant="muted" />
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
              {selectedItem.title}
            </h2>
            <p className="text-sm text-[rgb(var(--muted))]">
              ASIN {selectedItem.asin}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--card))]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-2xl bg-[rgb(var(--bg-elevated))]">
              {selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[rgb(var(--muted))]">
                  {selectedItem.title
                    .split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")}
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
              <div>Supplier: {selectedItem.supplier}</div>
              <div>Rank: {selectedItem.rank}</div>
              <div>Status: {selectedItem.status}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4 text-sm">
            <div>
              <div className="text-xs text-[rgb(var(--muted))]">Buy Box</div>
              <div className="text-base font-semibold text-[rgb(var(--text))]">
                ${selectedItem.buyBox.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[rgb(var(--muted))]">Profit</div>
              <div className="text-base font-semibold text-[rgb(var(--text))]">
                ${selectedItem.profit.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[rgb(var(--muted))]">ROI</div>
              <div className="text-base font-semibold text-[rgb(var(--text))]">
                {selectedItem.roi}%
              </div>
            </div>
            <div>
              <div className="text-xs text-[rgb(var(--muted))]">Fees</div>
              <div className="text-base font-semibold text-[rgb(var(--text))]">
                ${selectedItem.fees.toFixed(2)}
              </div>
            </div>
          </div>

          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
            {activeTab === "overview" && (
              <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
                <p>
                  Placeholder overview with highlights on margin, inventory notes, and
                  recent price activity.
                </p>
                <ul className="space-y-2">
                  <li>• Buy box stability: 14-day average</li>
                  <li>• Estimated monthly volume: 320 units</li>
                  <li>• Competitors: 5 active sellers</li>
                </ul>
              </div>
            )}
            {activeTab === "fees" && (
              <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
                <p>Breakdown of estimated FBA fees and ROI drivers.</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Referral fee</span>
                    <span>${(selectedItem.fees * 0.45).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fulfillment fee</span>
                    <span>${(selectedItem.fees * 0.55).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "notes" && (
              <div className="space-y-3 text-sm text-[rgb(var(--muted))]">
                <p>Notes area for team comments and sourcing decisions.</p>
                <div className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] p-4 text-[rgb(var(--muted))]">
                  Add internal notes, supplier caveats, or reorder reminders.
                </div>
              </div>
            )}
            {activeTab === "history" && (
              <div className="text-sm text-[rgb(var(--muted))]">
                Upgrade to unlock history.
              </div>
            )}
          </Tabs>
        </div>

        <div className="border-t border-[rgb(var(--border))] px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm text-[rgb(var(--text))]">
              Tag
            </button>
            <button className="rounded-full border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm text-[rgb(var(--text))]">
              Archive
            </button>
            <a
              href="#"
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Open on Amazon
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
