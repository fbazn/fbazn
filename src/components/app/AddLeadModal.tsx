"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSourcingItem } from "@/app/actions/sourcingItems";

type Props = {
  onClose: () => void;
};

const MARKETPLACES = ["UK", "US", "DE", "FR", "IT", "ES", "CA", "AU"];

export function AddLeadModal({ onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [asin, setAsin] = useState("");
  const [title, setTitle] = useState("");
  const [marketplace, setMarketplace] = useState("UK");
  const [supplierName, setSupplierName] = useState("");
  const [supplierUrl, setSupplierUrl] = useState("");
  const [supplierCost, setSupplierCost] = useState("");
  const [buyBoxPrice, setBuyBoxPrice] = useState("");
  const [fees, setFees] = useState("");
  const [rankText, setRankText] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? undefined : n;
  };

  const calcProfit = () => {
    const cost = num(supplierCost) ?? 0;
    const box = num(buyBoxPrice) ?? 0;
    const fee = num(fees) ?? 0;
    if (cost === 0 || box === 0) return undefined;
    return parseFloat((box - fee - cost).toFixed(2));
  };

  const calcRoi = () => {
    const cost = num(supplierCost) ?? 0;
    const profit = calcProfit();
    if (!profit || cost === 0) return undefined;
    return parseFloat(((profit / cost) * 100).toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin.trim() || !title.trim()) {
      setError("ASIN and title are required.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createSourcingItem({
        asin: asin.trim().toUpperCase(),
        title: title.trim(),
        marketplace,
        supplier_name: supplierName || undefined,
        supplier_url: supplierUrl || undefined,
        supplier_cost: num(supplierCost),
        buy_box_price: num(buyBoxPrice),
        fees: num(fees),
        est_profit: calcProfit(),
        roi_pct: calcRoi(),
        rank_text: rankText || undefined,
        tags: tags || undefined,
        notes: notes || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
      onClose();
    });
  };

  const estProfit = calcProfit();
  const estRoi = calcRoi();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
              Add new lead
            </h2>
            <p className="text-sm text-[rgb(var(--muted))]">
              Manually add a product to your review queue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:bg-[rgb(var(--card))]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[65vh] overflow-y-auto px-6 py-6">
            <div className="space-y-5">
              {/* ASIN + Marketplace */}
              <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    ASIN <span className="text-rose-400">*</span>
                  </label>
                  <input
                    value={asin}
                    onChange={(e) => setAsin(e.target.value)}
                    placeholder="B0C9JQ4L5Z"
                    className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    Marketplace
                  </label>
                  <select
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value)}
                    className="h-10 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {MARKETPLACES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                  Product title <span className="text-rose-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ergonomic Mesh Office Chair"
                  className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  required
                />
              </div>

              {/* Supplier */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    Supplier name
                  </label>
                  <input
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Costco Wholesale"
                    className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    Supplier URL
                  </label>
                  <input
                    type="url"
                    value={supplierUrl}
                    onChange={(e) => setSupplierUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    Supplier cost (£/$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={supplierCost}
                    onChange={(e) => setSupplierCost(e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    Buy box price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={buyBoxPrice}
                    onChange={(e) => setBuyBoxPrice(e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    Total fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fees}
                    onChange={(e) => setFees(e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              {/* Live profit preview */}
              {(estProfit !== undefined || estRoi !== undefined) && (
                <div className="flex items-center gap-6 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-4 py-3 text-sm">
                  <div>
                    <div className="text-xs text-[rgb(var(--muted))]">Est. profit</div>
                    <div
                      className={`font-semibold ${
                        (estProfit ?? 0) >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {estProfit !== undefined
                        ? `£${estProfit.toFixed(2)}`
                        : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[rgb(var(--muted))]">ROI</div>
                    <div
                      className={`font-semibold ${
                        (estRoi ?? 0) >= 30
                          ? "text-emerald-400"
                          : (estRoi ?? 0) >= 15
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {estRoi !== undefined ? `${estRoi}%` : "—"}
                    </div>
                  </div>
                </div>
              )}

              {/* Extra */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    BSR / rank
                  </label>
                  <input
                    value={rankText}
                    onChange={(e) => setRankText(e.target.value)}
                    placeholder="#1,234 Home & Kitchen"
                    className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                    Tags
                  </label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="kitchen, seasonal"
                    className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any sourcing notes..."
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-[rgb(var(--border))] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm text-[rgb(var(--text))] hover:bg-[rgb(var(--card))]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Saving…" : "Add to review queue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
