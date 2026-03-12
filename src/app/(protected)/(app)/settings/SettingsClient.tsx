"use client";

import { useState, useTransition } from "react";
import { saveUserSettings } from "@/app/actions/userSettings";
import type { UserSettings } from "@/data/userSettings";
import { Badge } from "@/components/app/Badge";

type Props = { settings: UserSettings };

const MARKETPLACES = ["UK", "US", "DE", "FR", "IT", "ES", "CA", "AU"];
const CURRENCIES = ["GBP", "USD", "EUR", "CAD", "AUD"];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-[rgb(var(--text))]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[rgb(var(--muted))]">{hint}</p>}
    </div>
  );
}

export default function SettingsClient({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [defaultMarketplace, setDefaultMarketplace] = useState(
    settings.default_marketplace,
  );
  const [preferredCurrency, setPreferredCurrency] = useState(
    settings.preferred_currency,
  );
  const [vatUk, setVatUk] = useState(String(settings.vat_rate_uk));
  const [vatUs, setVatUs] = useState(String(settings.vat_rate_us));
  const [vatDe, setVatDe] = useState(String(settings.vat_rate_de));
  const [prepFee, setPrepFee] = useState(String(settings.prep_fee_per_unit));
  const [shipping, setShipping] = useState(
    String(settings.inbound_shipping_per_unit),
  );
  const [minRoi, setMinRoi] = useState(String(settings.min_roi_pct));
  const [minProfit, setMinProfit] = useState(String(settings.min_profit));
  const [targetMargin, setTargetMargin] = useState(
    String(settings.target_margin_pct),
  );

  const inputCls =
    "h-10 w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-indigo-500/40";
  const selectCls = inputCls;

  const n = (v: string, fallback: number) => {
    const parsed = parseFloat(v);
    return isNaN(parsed) ? fallback : parsed;
  };

  const handleSave = () => {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      const result = await saveUserSettings({
        default_marketplace: defaultMarketplace,
        preferred_currency: preferredCurrency,
        vat_rate_uk: n(vatUk, 20),
        vat_rate_us: n(vatUs, 0),
        vat_rate_de: n(vatDe, 19),
        prep_fee_per_unit: n(prepFee, 0.5),
        inbound_shipping_per_unit: n(shipping, 0.3),
        min_roi_pct: n(minRoi, 30),
        min_profit: n(minProfit, 3),
        target_margin_pct: n(targetMargin, 30),
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
            Settings
          </h2>
          <p className="text-sm text-[rgb(var(--muted))]">
            Configure defaults for profit calculations and your workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <Badge label="Saved" variant="success" />}
          {error && (
            <span className="text-sm text-rose-400">{error}</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Marketplace */}
      <Section
        title="Marketplace & currency"
        description="Your default marketplace and display currency across the app."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default marketplace">
            <select
              value={defaultMarketplace}
              onChange={(e) => setDefaultMarketplace(e.target.value)}
              className={selectCls}
            >
              {MARKETPLACES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preferred currency">
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className={selectCls}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* VAT */}
      <Section
        title="VAT rates"
        description="VAT is deducted from buy box revenue when calculating profit. Set to 0 if you are not VAT registered."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="UK VAT %" hint="Standard rate: 20%">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={vatUk}
              onChange={(e) => setVatUk(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="US VAT %" hint="No federal VAT">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={vatUs}
              onChange={(e) => setVatUs(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="DE VAT %" hint="Standard rate: 19%">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={vatDe}
              onChange={(e) => setVatDe(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Fees */}
      <Section
        title="Per-unit costs"
        description="These are added to every profit calculation as a cost. Adjust to match your actual rates."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Prep fee per unit (£/$)"
            hint="Labelling, bagging, and handling at your prep centre."
          >
            <input
              type="number"
              step="0.01"
              min="0"
              value={prepFee}
              onChange={(e) => setPrepFee(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field
            label="Inbound shipping per unit (£/$)"
            hint="Your average freight cost per unit to FBA."
          >
            <input
              type="number"
              step="0.01"
              min="0"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Thresholds */}
      <Section
        title="Profitability thresholds"
        description="Used to colour-code ROI and profit indicators throughout the app."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Minimum ROI %"
            hint="Items below this are flagged red."
          >
            <input
              type="number"
              step="1"
              min="0"
              value={minRoi}
              onChange={(e) => setMinRoi(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field
            label="Minimum profit (£/$)"
            hint="Absolute profit floor per unit."
          >
            <input
              type="number"
              step="0.50"
              min="0"
              value={minProfit}
              onChange={(e) => setMinProfit(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field
            label="Target margin %"
            hint="Gross margin target — items above show green."
          >
            <input
              type="number"
              step="1"
              min="0"
              value={targetMargin}
              onChange={(e) => setTargetMargin(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}
