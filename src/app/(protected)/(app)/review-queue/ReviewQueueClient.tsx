"use client";

import { useOptimistic, useTransition } from "react";
import { updateQueueStatus, deleteQueueItem, type QueueStatus } from "@/app/actions/reviewQueue";

// ── Types ──────────────────────────────────────────────────────────────────

export type QueueRow = {
  id: string;
  asin: string;
  title: string | null;
  image_url: string | null;
  category: string | null;
  size_tier: string | null;
  buy_box_price: number | null;
  cost_price: number | null;
  referral_fee: number | null;
  fba_fee: number | null;
  net_profit: number | null;
  roi: number | null;
  margin: number | null;
  status: string;
  notes: string | null;
  created_at: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: QueueStatus; label: string }[] = [
  { value: "pending",   label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "contacted", label: "Contacted" },
  { value: "ordered",   label: "Ordered" },
  { value: "rejected",  label: "Rejected" },
];

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-blue-500/15 text-blue-300 border-blue-500/30",
  reviewing: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  contacted: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  ordered:   "bg-green-500/15 text-green-300 border-green-500/30",
  rejected:  "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function statusLabel(s: string) {
  return STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s;
}

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
  return n >= 0 ? "text-green-400" : "text-rose-400";
}

function initials(title: string | null) {
  if (!title) return "?";
  return title.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ── Component ──────────────────────────────────────────────────────────────

type Props = { initialItems: QueueRow[] };

export default function ReviewQueueClient({ initialItems }: Props) {
  const [isPending, startTransition] = useTransition();

  const [items, setOptimisticItems] = useOptimistic(
    initialItems,
    (state, action: { type: "status"; id: string; status: string } | { type: "delete"; id: string }) => {
      if (action.type === "delete") return state.filter((i) => i.id !== action.id);
      return state.map((i) => i.id === action.id ? { ...i, status: action.status } : i);
    },
  );

  function handleStatusChange(id: string, status: QueueStatus) {
    startTransition(async () => {
      setOptimisticItems({ type: "status", id, status });
      await updateQueueStatus(id, status);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this item from your queue?")) return;
    startTransition(async () => {
      setOptimisticItems({ type: "delete", id });
      await deleteQueueItem(id);
    });
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Review Queue</h2>
            <span className="rounded-full bg-[rgb(var(--panel))] px-2.5 py-0.5 text-xs font-semibold text-[rgb(var(--muted))]">
              {items.length}
            </span>
          </div>
          <p className="text-sm text-[rgb(var(--muted))]">
            Products saved from the Chrome extension — sorted by newest first.
          </p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[rgb(var(--panel))] text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
              <tr>
                <th className="px-4 py-3 min-w-[240px]">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Size Tier</th>
                <th className="px-4 py-3 text-right">Buy Box</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Net Profit</th>
                <th className="px-4 py-3 text-right">ROI</th>
                <th className="px-4 py-3 text-right">Margin</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Saved</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">

              {/* ── Loading / empty states ── */}
              {items.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-sm text-[rgb(var(--muted))]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl">📦</span>
                      <span className="font-medium text-[rgb(var(--text))]">Queue is empty</span>
                      <span>Save products from Amazon using the FBAZN Chrome extension.</span>
                    </div>
                  </td>
                </tr>
              )}

              {items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-[rgb(var(--panel))]"
                  style={{ opacity: isPending ? 0.7 : 1 }}
                >
                  {/* ── Item ── */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[rgb(var(--bg-elevated))]">
                        {item.image_url ? (
                          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[rgb(var(--muted))]">
                            {initials(item.title)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="max-w-[200px] truncate font-medium text-[rgb(var(--text))]"
                          title={item.title ?? ""}
                        >
                          {item.title ?? "Unknown product"}
                        </div>
                        <a
                          href={`https://www.amazon.co.uk/dp/${item.asin}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs text-[rgb(var(--muted))] hover:text-blue-400"
                        >
                          {item.asin}
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* ── Category ── */}
                  <td className="px-4 py-3 text-[rgb(var(--muted))]">
                    {item.category ?? <span className="italic opacity-50">—</span>}
                  </td>

                  {/* ── Size tier ── */}
                  <td className="px-4 py-3 text-[rgb(var(--muted))] whitespace-nowrap">
                    {item.size_tier ?? <span className="italic opacity-50">—</span>}
                  </td>

                  {/* ── Financials ── */}
                  <td className="px-4 py-3 text-right font-mono text-[rgb(var(--text))]">
                    {gbp(item.buy_box_price)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[rgb(var(--muted))]">
                    {gbp(item.cost_price)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${profitColour(item.net_profit)}`}>
                    {gbp(item.net_profit)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${profitColour(item.roi)}`}>
                    {pct(item.roi)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${profitColour(item.margin)}`}>
                    {pct(item.margin)}
                  </td>

                  {/* ── Status ── */}
                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as QueueStatus)}
                      onClick={(e) => e.stopPropagation()}
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold cursor-pointer bg-transparent focus:outline-none ${STATUS_STYLES[item.status] ?? STATUS_STYLES.pending}`}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}
                          className="bg-[#0f172a] text-white">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* ── Date ── */}
                  <td className="px-4 py-3 text-right text-xs text-[rgb(var(--muted))] whitespace-nowrap">
                    {relativeDate(item.created_at)}
                  </td>

                  {/* ── Delete ── */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Remove from queue"
                      className="rounded p-1.5 text-[rgb(var(--muted))] transition hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
