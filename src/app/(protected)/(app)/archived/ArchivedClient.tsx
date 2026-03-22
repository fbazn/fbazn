"use client";

import Link from "next/link";
import { useOptimistic, useTransition, useState } from "react";
import type { SourcingItemRow } from "@/data/sourcingItems";
import { restoreProduct, deleteProduct } from "@/app/actions/sourcingItems";

// ── Helpers ────────────────────────────────────────────────────────────────

function gbp(n: number | null) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

function pct(n: number | null) {
  if (n === null || n === undefined) return "—";
  return `${Number(n).toFixed(1)}%`;
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function profitColour(n: number | null) {
  if (n === null) return "text-[rgb(var(--muted))]";
  return n >= 0 ? "text-emerald-400" : "text-rose-400";
}

function initials(title: string) {
  return title.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

// ── Main component ─────────────────────────────────────────────────────────

type Props = { initialItems: SourcingItemRow[] };

export default function ArchivedClient({ initialItems }: Props) {
  const [isPending, startTransition] = useTransition();

  const [items, setOptimistic] = useOptimistic(
    initialItems,
    (state, action: { type: "remove"; id: string }) => {
      if (action.type === "remove") return state.filter((i) => i.id !== action.id);
      return state;
    },
  );

  function handleRestore(id: string) {
    startTransition(async () => {
      setOptimistic({ type: "remove", id });
      await restoreProduct(id);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Permanently delete this product? This cannot be undone.")) return;
    startTransition(async () => {
      setOptimistic({ type: "remove", id });
      await deleteProduct(id);
    });
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Archived Products</h2>
            <span className="rounded-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-2.5 py-0.5 text-xs font-semibold text-[rgb(var(--muted))]">
              {items.length}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[rgb(var(--muted))]">
            Products you've archived — restore them to move back to your Sourcing List.
          </p>
        </div>
        <Link
          href="/sourcing"
          className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Sourcing List
        </Link>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border))] py-20 text-center">
          <span className="text-4xl">🗄️</span>
          <p className="mt-3 font-semibold text-[rgb(var(--text))]">No archived products</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Archive products from the Sourcing List to keep them here.
          </p>
          <Link
            href="/sourcing"
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Go to Sourcing List
          </Link>
        </div>
      )}

      {/* Table */}
      {items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))]/60">
                  <th className="px-3 py-3 pl-4 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Product</th>
                  <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Supplier</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Buy Box</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Net Profit</th>
                  <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">ROI</th>
                  <th className="px-3 py-3 pr-4 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Archived</th>
                  <th className="w-28" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-[rgb(var(--panel))]/60"
                    style={{ opacity: isPending ? 0.65 : 1 }}
                  >
                    {/* Product */}
                    <td className="px-3 py-2.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-[rgb(var(--panel))] ring-1 ring-[rgb(var(--border))] opacity-60">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="h-full w-full object-cover grayscale" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[rgb(var(--muted))]">
                              {initials(item.title)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="w-[220px] truncate font-medium text-[rgb(var(--muted))] text-[13px]" title={item.title}>
                            {item.title}
                          </div>
                          <a
                            href={`https://www.amazon.co.uk/dp/${item.asin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[11px] text-[rgb(var(--muted))]/60 hover:text-blue-400 transition"
                          >
                            {item.asin}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="px-3 py-2.5 text-[13px] text-[rgb(var(--muted))] max-w-[120px] truncate opacity-60">
                      {item.supplier_name ?? <span className="opacity-40">—</span>}
                    </td>

                    {/* Buy box */}
                    <td className="px-3 py-2.5 text-right font-mono text-[13px] text-[rgb(var(--muted))] opacity-60">
                      {gbp(item.buy_box_price)}
                    </td>

                    {/* Net profit */}
                    <td className={`px-3 py-2.5 text-right font-mono text-[13px] opacity-60 ${profitColour(item.net_profit)}`}>
                      {gbp(item.net_profit)}
                    </td>

                    {/* ROI */}
                    <td className={`px-3 py-2.5 text-right font-mono text-[13px] opacity-60 ${profitColour(item.roi)}`}>
                      {pct(item.roi)}
                    </td>

                    {/* Archived date */}
                    <td className="px-3 py-2.5 pr-4 text-right text-[11px] text-[rgb(var(--muted))] whitespace-nowrap opacity-60">
                      {relativeDate(item.updated_at)}
                    </td>

                    {/* Actions */}
                    <td className="w-28 pr-3">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => handleRestore(item.id)}
                          title="Restore to sourcing list"
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete permanently"
                          className="rounded p-1.5 text-[rgb(var(--muted))] transition hover:bg-rose-500/10 hover:text-rose-400"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
