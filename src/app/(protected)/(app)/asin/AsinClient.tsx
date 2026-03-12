"use client";

import { useState } from "react";
import { Badge } from "@/components/app/Badge";
import type { UserSettings } from "@/data/userSettings";

type Props = { settings: UserSettings };

const MARKETPLACES = ["UK", "US", "DE", "FR", "IT", "ES"] as const;
type Marketplace = (typeof MARKETPLACES)[number];

const CURRENCY_SYMBOL: Record<string, string> = {
  UK: "£",
  US: "$",
  DE: "€",
  FR: "€",
  IT: "€",
  ES: "€",
};

const VAT_MAP: Record<string, number> = {
  UK: 20,
  US: 0,
  DE: 19,
  FR: 20,
  IT: 22,
  ES: 21,
};

function fmt(n: number, sym: string) {
  return `${sym}${n.toFixed(2)}`;
}

export default function AsinClient({ settings }: Props) {
  const [marketplace, setMarketplace] = useState<Marketplace>(
    (settings.default_marketplace as Marketplace) ?? "UK",
  );
  const [asin, setAsin] = useState("");
  const [buyBox, setBuyBox] = useState("");
  const [supplierCost, setSupplierCost] = useState("");
  const [fees, setFees] = useState("");
  const [includeVat, setIncludeVat] = useState(true);
  const [includePrepFee, setIncludePrepFee] = useState(true);
  const [includeShipping, setIncludeShipping] = useState(true);

  const sym = CURRENCY_SYMBOL[marketplace] ?? "£";
  const vatRate =
    marketplace === "UK"
      ? settings.vat_rate_uk
      : marketplace === "US"
        ? settings.vat_rate_us
        : marketplace === "DE"
          ? settings.vat_rate_de
          : VAT_MAP[marketplace] ?? 0;

  const numBuyBox = parseFloat(buyBox) || 0;
  const numCost = parseFloat(supplierCost) || 0;
  const numFees = parseFloat(fees) || 0;

  const vatAmount = includeVat ? numBuyBox * (vatRate / 100) : 0;
  const prepFee = includePrepFee ? settings.prep_fee_per_unit : 0;
  const shippingFee = includeShipping ? settings.inbound_shipping_per_unit : 0;

  const totalCosts = numCost + numFees + vatAmount + prepFee + shippingFee;
  const profit = numBuyBox > 0 ? numBuyBox - totalCosts : null;
  const roi = profit !== null && numCost > 0 ? (profit / numCost) * 100 : null;
  const margin = profit !== null && numBuyBox > 0 ? (profit / numBuyBox) * 100 : null;

  const roiVariant =
    roi === null ? "muted" : roi >= settings.min_roi_pct ? "success" : roi >= 15 ? "warning" : "danger";

  const hasInput = numBuyBox > 0 || numCost > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          ASIN Lookup
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Enter product details to calculate profitability.
        </p>
      </div>

      {/* Input card */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* ASIN */}
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              ASIN
            </label>
            <input
              value={asin}
              onChange={(e) => setAsin(e.target.value.toUpperCase())}
              placeholder="B0C9JQ4L5Z"
              className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Marketplace */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              Marketplace
            </label>
            <select
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value as Marketplace)}
              className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {MARKETPLACES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Buy Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              Buy box price ({sym})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={buyBox}
              onChange={(e) => setBuyBox(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Supplier cost */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              Supplier cost ({sym})
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

          {/* FBA fees */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              FBA fees ({sym})
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

        {/* Toggles */}
        <div className="mt-5 flex flex-wrap gap-3">
          {[
            {
              label: `VAT ${vatRate}%`,
              value: includeVat,
              set: setIncludeVat,
              detail: vatRate === 0 ? "n/a for this marketplace" : undefined,
            },
            {
              label: `Prep fee ${sym}${settings.prep_fee_per_unit.toFixed(2)}/unit`,
              value: includePrepFee,
              set: setIncludePrepFee,
            },
            {
              label: `Inbound ${sym}${settings.inbound_shipping_per_unit.toFixed(2)}/unit`,
              value: includeShipping,
              set: setIncludeShipping,
            },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => t.set(!t.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                t.value
                  ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-300"
                  : "border-[rgb(var(--border))] text-[rgb(var(--muted))]"
              }`}
            >
              {t.value ? "✓ " : ""}{t.label}
            </button>
          ))}
          <span className="self-center text-xs text-[rgb(var(--muted))]">
            — rates from Settings
          </span>
        </div>
      </div>

      {/* Results */}
      {hasInput && (
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
              Profitability breakdown
            </h3>
            {roi !== null && (
              <Badge
                label={`${roi.toFixed(1)}% ROI`}
                variant={roiVariant}
              />
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Est. profit",
                value:
                  profit !== null ? fmt(profit, sym) : "—",
                highlight: profit !== null && profit > 0,
                danger: profit !== null && profit < 0,
              },
              {
                label: "ROI",
                value: roi !== null ? `${roi.toFixed(1)}%` : "—",
                highlight: roi !== null && roi >= settings.min_roi_pct,
                danger: roi !== null && roi < 0,
              },
              {
                label: "Margin",
                value: margin !== null ? `${margin.toFixed(1)}%` : "—",
                highlight:
                  margin !== null && margin >= settings.target_margin_pct,
                danger: margin !== null && margin < 0,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[rgb(var(--border))] p-4"
              >
                <div className="text-xs text-[rgb(var(--muted))]">
                  {stat.label}
                </div>
                <div
                  className={`mt-1 text-2xl font-semibold ${
                    stat.danger
                      ? "text-rose-400"
                      : stat.highlight
                        ? "text-emerald-400"
                        : "text-[rgb(var(--text))]"
                  }`}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
              Cost breakdown
            </div>
            {[
              { label: "Supplier cost", value: numCost },
              { label: "FBA fees", value: numFees },
              {
                label: `VAT (${vatRate}%)`,
                value: vatAmount,
                muted: !includeVat,
              },
              {
                label: `Prep fee`,
                value: prepFee,
                muted: !includePrepFee,
              },
              {
                label: `Inbound shipping`,
                value: shippingFee,
                muted: !includeShipping,
              },
              {
                label: "Total costs",
                value: totalCosts,
                bold: true,
              },
            ].map((row) => (
              <div
                key={row.label}
                className={`flex items-center justify-between ${
                  row.muted ? "opacity-40" : ""
                }`}
              >
                <span
                  className={
                    row.bold
                      ? "font-semibold text-[rgb(var(--text))]"
                      : "text-[rgb(var(--muted))]"
                  }
                >
                  {row.label}
                </span>
                <span
                  className={
                    row.bold
                      ? "font-semibold text-[rgb(var(--text))]"
                      : "text-[rgb(var(--muted))]"
                  }
                >
                  {fmt(row.value, sym)}
                </span>
              </div>
            ))}
          </div>

          {asin && (
            <div className="mt-6">
              <a
                href={`https://www.amazon.co.uk/dp/${asin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                View on Amazon
              </a>
            </div>
          )}
        </div>
      )}

      {!hasInput && (
        <div className="rounded-2xl border border-dashed border-[rgb(var(--border-subtle))] p-8 text-center text-sm text-[rgb(var(--muted))]">
          Enter a buy box price and supplier cost above to see the profit
          breakdown.
        </div>
      )}
    </div>
  );
}
