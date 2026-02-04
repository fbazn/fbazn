"use client";

import { useState } from "react";
import { Badge } from "@/components/app/Badge";

const initialItems = [
  {
    asin: "B0C9JQ4L5Z",
    title: "Ergonomic Mesh Office Chair",
    marketplace: "UK",
    buyBoxPrice: 129.99,
    estProfit: 28.4,
    roiPct: 21,
    savedAt: "2024-05-21 09:24",
    status: "pending_review",
  },
  {
    asin: "B08Q6K2M9D",
    title: "Stainless Steel Air Fryer 5L",
    marketplace: "US",
    buyBoxPrice: 89.5,
    estProfit: 18.75,
    roiPct: 26,
    savedAt: "2024-05-21 10:15",
    status: "pending_review",
  },
  {
    asin: "B0B7Y9W4H2",
    title: "Rechargeable LED Desk Lamp",
    marketplace: "DE",
    buyBoxPrice: 44.0,
    estProfit: 11.2,
    roiPct: 31,
    savedAt: "2024-05-20 16:48",
    status: "pending_review",
  },
  {
    asin: "B09ZV3N7R1",
    title: "Smart Wi-Fi Plug (4-Pack)",
    marketplace: "UK",
    buyBoxPrice: 24.99,
    estProfit: 6.1,
    roiPct: 19,
    savedAt: "2024-05-20 12:02",
    status: "pending_review",
  },
  {
    asin: "B0C2J5L8P8",
    title: "Portable 12L Mini Fridge",
    marketplace: "US",
    buyBoxPrice: 74.0,
    estProfit: 15.45,
    roiPct: 23,
    savedAt: "2024-05-19 18:37",
    status: "pending_review",
  },
];

export default function ReviewQueuePage() {
  const [items, setItems] = useState(initialItems);
  const [selectedAsin, setSelectedAsin] = useState<string | null>(
    initialItems[0]?.asin ?? null
  );

  const selectedItem = items.find((item) => item.asin === selectedAsin) ?? null;

  const handleReject = (asin: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.asin !== asin);
      if (selectedAsin === asin) {
        setSelectedAsin(next[0]?.asin ?? null);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
              Review Queue
            </h2>
            <Badge label={`${items.length}`} variant="muted" />
          </div>
          <p className="text-sm text-[rgb(var(--muted))]">
            Products saved from the extension waiting for review.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[rgb(var(--panel))] text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Market</th>
                <th className="px-4 py-3">Buy Box</th>
                <th className="px-4 py-3">Est. Profit</th>
                <th className="px-4 py-3">ROI</th>
                <th className="px-4 py-3">Saved</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">
              {items.map((item) => (
                <tr
                  key={item.asin}
                  className="transition hover:bg-[rgb(var(--card))]"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-[rgb(var(--text))]">
                      {item.title}
                    </div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      ASIN {item.asin}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[rgb(var(--muted))]">
                    {item.marketplace}
                  </td>
                  <td className="px-4 py-4 text-[rgb(var(--muted))]">
                    ${item.buyBoxPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-[rgb(var(--muted))]">
                    ${item.estProfit.toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-[rgb(var(--muted))]">
                    {item.roiPct}%
                  </td>
                  <td className="px-4 py-4 text-[rgb(var(--muted))]">
                    {item.savedAt}
                  </td>
                  <td className="px-4 py-4">
                    <Badge label={item.status} variant="warning" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        className="rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white"
                        onClick={() => setSelectedAsin(item.asin)}
                        type="button"
                      >
                        Review
                      </button>
                      <button
                        className="rounded-full border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10"
                        onClick={() => handleReject(item.asin)}
                        type="button"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-[rgb(var(--muted))]"
                  >
                    No items left to review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
        {selectedItem ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                  Review details
                </h3>
                <p className="text-sm text-[rgb(var(--muted))]">
                  {selectedItem.title}
                </p>
              </div>
              <Badge label="Pending review" variant="warning" />
            </div>
            <div className="mt-5 grid gap-4 text-sm text-[rgb(var(--muted))] md:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  ASIN
                </div>
                <div className="mt-1 text-[rgb(var(--text))]">
                  {selectedItem.asin}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  Marketplace
                </div>
                <div className="mt-1 text-[rgb(var(--text))]">
                  {selectedItem.marketplace}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  Saved at
                </div>
                <div className="mt-1 text-[rgb(var(--text))]">
                  {selectedItem.savedAt}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  Buy Box
                </div>
                <div className="mt-1 text-[rgb(var(--text))]">
                  ${selectedItem.buyBoxPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  Est. Profit
                </div>
                <div className="mt-1 text-[rgb(var(--text))]">
                  ${selectedItem.estProfit.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  ROI
                </div>
                <div className="mt-1 text-[rgb(var(--text))]">
                  {selectedItem.roiPct}%
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-[rgb(var(--muted))]">
            Select a product to review its details.
          </div>
        )}
      </div>
    </div>
  );
}
