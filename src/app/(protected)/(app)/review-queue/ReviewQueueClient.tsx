"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/app/Badge";
import { useDetailsDrawer } from "@/components/app/AppShell";
import { useReviewQueue } from "@/components/app/ReviewQueueContext";
import type { ReviewQueueItem } from "@/lib/mockData";
import {
  seedSourcingItems,
  setSourcingStatus,
} from "@/app/actions/sourcingItems";
import { useRouter } from "next/navigation";

type ReviewQueueClientProps = {
  initialItems: ReviewQueueItem[];
  showSeedButton: boolean;
};

export default function ReviewQueueClient({
  initialItems,
  showSeedButton,
}: ReviewQueueClientProps) {
  const { openDrawer, closeDrawer, selectedItem } = useDetailsDrawer();
  const { setReviewQueueCount } = useReviewQueue();
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  function updateSelection(nextItems: ReviewQueueItem[]) {
    const isSelectedReview =
      selectedItem && "type" in selectedItem && selectedItem.type === "review";

    if (!isSelectedReview) {
      return;
    }

    if (nextItems.length > 0) {
      openDrawer(nextItems[0], { onReject: handleReject, onSave: handleSave });
    } else {
      closeDrawer();
    }
  }

  function handleReject(item: ReviewQueueItem) {
    setItems((prev) => {
      const next = prev.filter((entry) => entry.id !== item.id);
      if (
        selectedItem &&
        "type" in selectedItem &&
        selectedItem.type === "review" &&
        selectedItem.id === item.id
      ) {
        updateSelection(next);
      }
      return next;
    });

    startTransition(() => {
      void setSourcingStatus(item.id, "rejected");
    });
  }

  function handleSave(item: ReviewQueueItem) {
    setItems((prev) => {
      const next = prev.filter((entry) => entry.id !== item.id);
      if (
        selectedItem &&
        "type" in selectedItem &&
        selectedItem.type === "review" &&
        selectedItem.id === item.id
      ) {
        updateSelection(next);
      }
      return next;
    });

    startTransition(() => {
      void setSourcingStatus(item.id, "saved");
    });
  }

  const handleOpenReview = (item: ReviewQueueItem) => {
    openDrawer(item, { onReject: handleReject, onSave: handleSave });
  };

  useEffect(() => {
    const pendingCount = items.filter(
      (item) => item.status === "pending_review"
    ).length;
    setReviewQueueCount(pendingCount);
  }, [items, setReviewQueueCount]);

  const handleSeed = () => {
    startTransition(async () => {
      await seedSourcingItems();
      router.refresh();
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
            {showSeedButton && (
              <button
                type="button"
                onClick={handleSeed}
                disabled={isPending}
                className="rounded-full border border-[rgb(var(--border-subtle))] px-3 py-1 text-xs text-[rgb(var(--text))] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Seed sample items
              </button>
            )}
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
                  key={item.id}
                  onClick={() => handleOpenReview(item)}
                  className="cursor-pointer transition hover:bg-[rgb(var(--card))]"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-[rgb(var(--bg-elevated))]">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[rgb(var(--muted))]">
                            {item.title
                              .split(" ")
                              .slice(0, 2)
                              .map((word) => word[0])
                              .join("")}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[rgb(var(--text))]">
                          {item.title}
                        </div>
                        <div className="text-xs text-[rgb(var(--muted))]">
                          {item.asin}
                        </div>
                      </div>
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
                    <Badge label="Pending review" variant="warning" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        className="rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenReview(item);
                        }}
                        type="button"
                      >
                        Review
                      </button>
                      <button
                        className="rounded-full border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleReject(item);
                        }}
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
    </div>
  );
}
