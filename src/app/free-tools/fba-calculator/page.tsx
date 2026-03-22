"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface ReferralFee {
  category: string;
  referral_fee_pct: number;
  min_referral_fee: number;
}

interface FulfillmentFee {
  size_tier: string;
  description: string;
  fee: number;
  sort_order: number;
}

interface Results {
  referralFee: number;
  fulfillmentFee: number;
  totalFees: number;
  netProfit: number;
  roi: number;
  margin: number;
}

const MARKETPLACE_CURRENCY: Record<string, { code: string; locale: string }> = {
  UK: { code: "GBP", locale: "en-GB" },
  US: { code: "USD", locale: "en-US" },
  DE: { code: "EUR", locale: "de-DE" },
  FR: { code: "EUR", locale: "fr-FR" },
  IT: { code: "EUR", locale: "it-IT" },
  ES: { code: "EUR", locale: "es-ES" },
  CA: { code: "CAD", locale: "en-CA" },
  AU: { code: "AUD", locale: "en-AU" },
};

export default function FbaCalculatorPage() {
  const [marketplace, setMarketplace] = useState("UK");
  const [referralFees, setReferralFees] = useState<ReferralFee[]>([]);
  const [fulfillmentFees, setFulfillmentFees] = useState<FulfillmentFee[]>([]);
  const [loading, setLoading] = useState(true);

  const [buyBoxPrice, setBuyBoxPrice] = useState("");
  const [supplierCost, setSupplierCost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSizeTier, setSelectedSizeTier] = useState("");

  const [results, setResults] = useState<Results | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Try to load the user's preferred marketplace; fall back to UK for unauthenticated users
    supabase
      .from("user_settings")
      .select("default_marketplace")
      .maybeSingle()
      .then(({ data }) => {
        const mp = data?.default_marketplace ?? "UK";
        setMarketplace(mp);

        // Fetch fee tables for the resolved marketplace
        Promise.all([
          supabase
            .from("fba_referral_fees")
            .select("category, referral_fee_pct, min_referral_fee")
            .eq("marketplace", mp)
            .order("category"),
          supabase
            .from("fba_fulfillment_fees")
            .select("size_tier, description, fee, sort_order")
            .eq("marketplace", mp)
            .order("sort_order"),
        ]).then(([referralRes, fulfillmentRes]) => {
          if (referralRes.data) setReferralFees(referralRes.data);
          if (fulfillmentRes.data) setFulfillmentFees(fulfillmentRes.data);
          setLoading(false);
        });
      });
  }, []);

  const calculate = useCallback(() => {
    const price = parseFloat(buyBoxPrice);
    const cost = parseFloat(supplierCost);
    if (!price || !cost || !selectedCategory || !selectedSizeTier) return;

    const referralRow = referralFees.find((r) => r.category === selectedCategory);
    const fulfillmentRow = fulfillmentFees.find((f) => f.size_tier === selectedSizeTier);
    if (!referralRow || !fulfillmentRow) return;

    const referralFee = Math.max(
      (price * referralRow.referral_fee_pct) / 100,
      referralRow.min_referral_fee,
    );
    const fulfillmentFee = fulfillmentRow.fee;
    const totalFees = referralFee + fulfillmentFee;
    const netProfit = price - cost - totalFees;
    const roi = cost > 0 ? (netProfit / cost) * 100 : 0;
    const margin = price > 0 ? (netProfit / price) * 100 : 0;

    setResults({ referralFee, fulfillmentFee, totalFees, netProfit, roi, margin });
  }, [buyBoxPrice, supplierCost, selectedCategory, selectedSizeTier, referralFees, fulfillmentFees]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  const { code: currencyCode, locale: currencyLocale } =
    MARKETPLACE_CURRENCY[marketplace] ?? MARKETPLACE_CURRENCY.UK;

  const fmt = (n: number) =>
    n.toLocaleString(currencyLocale, { style: "currency", currency: currencyCode, minimumFractionDigits: 2 });

  const pct = (n: number) => `${n.toFixed(1)}%`;

  const profitColor =
    results === null
      ? ""
      : results.netProfit > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-500 dark:text-rose-400";

  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <Link
          href="/free-tools"
          className="text-sm text-[rgb(var(--muted))] hover:text-indigo-500"
        >
          ← Free Tools
        </Link>
        <div className="mt-4">
          <p className="text-sm font-semibold text-indigo-500">FBAZN</p>
          <h1 className="mt-1 text-3xl font-bold text-[rgb(var(--text))]">FBA Profit Calculator</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            {marketplace} marketplace · Fees sourced from Amazon&apos;s 2025 schedule
          </p>
        </div>

        {loading ? (
          <div className="mt-12 text-center text-sm text-[rgb(var(--muted))]">Loading fee data…</div>
        ) : (
          <div className="mt-8 space-y-6">
            {/* Inputs */}
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                Product Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-[rgb(var(--text))]">
                  Buy Box Price ({currencyCode})
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={buyBoxPrice}
                      onChange={(e) => setBuyBoxPrice(e.target.value)}
                      placeholder="0.00"
                      className="h-11 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium text-[rgb(var(--text))]">
                  Supplier Cost ({currencyCode})
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={supplierCost}
                      onChange={(e) => setSupplierCost(e.target.value)}
                      placeholder="0.00"
                      className="h-11 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium text-[rgb(var(--text))]">
                  Product Category
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category…</option>
                    {referralFees.map((r) => (
                      <option key={r.category} value={r.category}>
                        {r.category} ({r.referral_fee_pct}%)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-sm font-medium text-[rgb(var(--text))]">
                  Size / Weight Tier
                  <select
                    value={selectedSizeTier}
                    onChange={(e) => setSelectedSizeTier(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select size tier…</option>
                    {fulfillmentFees.map((f) => (
                      <option key={f.size_tier} value={f.size_tier}>
                        {f.size_tier} — {fmt(f.fee)}
                      </option>
                    ))}
                  </select>
                  {selectedSizeTier && (
                    <p className="text-xs text-[rgb(var(--muted))]">
                      {fulfillmentFees.find((f) => f.size_tier === selectedSizeTier)?.description}
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Results */}
            {results && (
              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                  Breakdown
                </h2>

                <div className="space-y-2 text-sm">
                  <Row label="Buy Box Price" value={fmt(parseFloat(buyBoxPrice))} />
                  <Row label="Supplier Cost" value={`− ${fmt(parseFloat(supplierCost))}`} muted />
                  <Row label={`Referral Fee (${referralFees.find((r) => r.category === selectedCategory)?.referral_fee_pct}%)`} value={`− ${fmt(results.referralFee)}`} muted />
                  <Row label="FBA Fulfilment Fee" value={`− ${fmt(results.fulfillmentFee)}`} muted />

                  <div className="my-3 border-t border-[rgb(var(--border))]" />

                  <Row label="Total Fees" value={fmt(results.totalFees)} />

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <StatCard
                      label="Net Profit"
                      value={fmt(results.netProfit)}
                      colorClass={profitColor}
                    />
                    <StatCard
                      label="ROI"
                      value={pct(results.roi)}
                      colorClass={results.roi >= 30 ? "text-emerald-600 dark:text-emerald-400" : results.roi >= 0 ? "text-amber-500" : "text-rose-500 dark:text-rose-400"}
                    />
                    <StatCard
                      label="Margin"
                      value={pct(results.margin)}
                      colorClass={results.margin >= 20 ? "text-emerald-600 dark:text-emerald-400" : results.margin >= 0 ? "text-amber-500" : "text-rose-500 dark:text-rose-400"}
                    />
                  </div>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-[rgb(var(--muted))]">
              Fees are approximate and based on Amazon&apos;s 2025 schedule. Always verify against your
              Seller Central account before making sourcing decisions.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-[rgb(var(--muted))]" : "font-medium text-[rgb(var(--text))]"}>
        {label}
      </span>
      <span className={muted ? "text-[rgb(var(--muted))]" : "font-semibold text-[rgb(var(--text))]"}>
        {value}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: string;
  colorClass: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-3 text-center">
      <span className="text-xs text-[rgb(var(--muted))]">{label}</span>
      <span className={`text-lg font-bold ${colorClass}`}>{value}</span>
    </div>
  );
}
