"use client";

import { useOptimistic, useTransition, useState, useCallback } from "react";
import {
  updateQueueStatus,
  deleteQueueItem,
  enrichQueueItem,
  convertToProduct,
  type QueueStatus,
} from "@/app/actions/reviewQueue";

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
  supplier_name: string | null;
  supplier_product_url: string | null;
  supplier_sku: string | null;
  supplier_cost: number | null;
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

// ── ReviewPanel ────────────────────────────────────────────────────────────

type PanelSaveState = "idle" | "saving" | "saved" | "error";
type PanelConvertState = "idle" | "converting" | "done" | "error";

function ReviewPanel({
  item,
  onClose,
  onStatusChange,
  onDelete,
  onEnrich,
  onConvert,
}: {
  item: QueueRow;
  onClose: () => void;
  onStatusChange: (id: string, status: QueueStatus) => void;
  onDelete: (id: string) => void;
  onEnrich: (id: string, fields: { supplier_name?: string; supplier_product_url?: string; supplier_sku?: string; supplier_cost?: number | null; notes?: string; status?: QueueStatus }) => Promise<void>;
  onConvert: (id: string) => Promise<void>;
}) {
  const [supplierName, setSupplierName] = useState(item.supplier_name ?? "");
  const [supplierUrl, setSupplierUrl] = useState(item.supplier_product_url ?? "");
  const [supplierSku, setSupplierSku] = useState(item.supplier_sku ?? "");
  const [supplierCost, setSupplierCost] = useState(
    item.supplier_cost != null ? String(item.supplier_cost) : "",
  );
  const [notes, setNotes] = useState(item.notes ?? "");
  const [status, setStatus] = useState<QueueStatus>(item.status as QueueStatus);

  const [saveState, setSaveState] = useState<PanelSaveState>("idle");
  const [convertState, setConvertState] = useState<PanelConvertState>("idle");

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    try {
      await onEnrich(item.id, {
        supplier_name: supplierName || undefined,
        supplier_product_url: supplierUrl || undefined,
        supplier_sku: supplierSku || undefined,
        supplier_cost: supplierCost !== "" ? parseFloat(supplierCost) : null,
        notes: notes || undefined,
        status,
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }, [item.id, supplierName, supplierUrl, supplierSku, supplierCost, notes, status, onEnrich]);

  const handleReject = useCallback(async () => {
    setStatus("rejected");
    onStatusChange(item.id, "rejected");
    await onEnrich(item.id, { status: "rejected" });
    onClose();
  }, [item.id, onStatusChange, onEnrich, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
    onClose();
  }, [item.id, onDelete, onClose]);

  const handleConvert = useCallback(async () => {
    setConvertState("converting");
    try {
      await onConvert(item.id);
      setConvertState("done");
      setTimeout(onClose, 1200);
    } catch {
      setConvertState("error");
      setTimeout(() => setConvertState("idle"), 3000);
    }
  }, [item.id, onConvert, onClose]);

  const totalFees =
    item.referral_fee != null && item.fba_fee != null
      ? item.referral_fee + item.fba_fee
      : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[460px] flex-col bg-[rgb(var(--card))] shadow-2xl border-l border-[rgb(var(--border))]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 border-b border-[rgb(var(--border))] p-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[rgb(var(--panel))]">
              {item.image_url ? (
                <img src={item.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[rgb(var(--muted))]">
                  {initials(item.title)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p
                className="font-semibold text-[rgb(var(--text))] leading-snug line-clamp-2"
                title={item.title ?? ""}
              >
                {item.title ?? "Unknown product"}
              </p>
              <a
                href={`https://www.amazon.co.uk/dp/${item.asin}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-[rgb(var(--muted))] hover:text-blue-400"
              >
                {item.asin} ↗
              </a>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1.5 text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--panel))] hover:text-[rgb(var(--text))]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Economics grid */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">Economics</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Buy Box",    value: gbp(item.buy_box_price) },
                { label: "Your Cost",  value: gbp(item.cost_price) },
                { label: "Ref Fee",    value: gbp(item.referral_fee) },
                { label: "FBA Fee",    value: gbp(item.fba_fee) },
                { label: "Total Fees", value: gbp(totalFees) },
                { label: "Net Profit", value: gbp(item.net_profit), colour: profitColour(item.net_profit) },
                { label: "ROI",        value: pct(item.roi),         colour: profitColour(item.roi) },
                { label: "Margin",     value: pct(item.margin),      colour: profitColour(item.margin) },
              ].map(({ label, value, colour }) => (
                <div key={label} className="rounded-xl bg-[rgb(var(--panel))] p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))]">{label}</p>
                  <p className={`mt-0.5 text-sm font-semibold font-mono ${colour ?? "text-[rgb(var(--text))]"}`}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Classification */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">Classification</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[rgb(var(--panel))] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))]">Category</p>
                <p className="mt-0.5 text-sm text-[rgb(var(--text))]">{item.category ?? <span className="italic text-[rgb(var(--muted))]">Unknown</span>}</p>
              </div>
              <div className="rounded-xl bg-[rgb(var(--panel))] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))]">Size Tier</p>
                <p className="mt-0.5 text-sm text-[rgb(var(--text))]">{item.size_tier ?? <span className="italic text-[rgb(var(--muted))]">Unknown</span>}</p>
              </div>
              <div className="rounded-xl bg-[rgb(var(--panel))] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))]">Saved</p>
                <p className="mt-0.5 text-sm text-[rgb(var(--text))]">{relativeDate(item.created_at)}</p>
              </div>
            </div>
          </section>

          {/* Status */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">Status</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as QueueStatus)}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0f172a] text-white font-normal">
                  {o.label}
                </option>
              ))}
            </select>
          </section>

          {/* Supplier details */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">Supplier Details</p>
            <div className="space-y-2.5">
              <div>
                <label className="mb-1 block text-xs text-[rgb(var(--muted))]">Supplier name</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Wholesale Central"
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[rgb(var(--muted))]">Supplier product URL</label>
                <input
                  type="url"
                  value={supplierUrl}
                  onChange={(e) => setSupplierUrl(e.target.value)}
                  placeholder="https://supplier.com/product"
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="mb-1 block text-xs text-[rgb(var(--muted))]">Supplier SKU</label>
                  <input
                    type="text"
                    value={supplierSku}
                    onChange={(e) => setSupplierSku(e.target.value)}
                    placeholder="SKU-001"
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[rgb(var(--muted))]">Supplier cost (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={supplierCost}
                    onChange={(e) => setSupplierCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add any notes about this lead…"
              className="w-full resize-none rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </section>
        </div>

        {/* ── Footer actions ── */}
        <div className="border-t border-[rgb(var(--border))] p-5 space-y-3">
          {/* Convert to product — primary CTA */}
          <button
            onClick={handleConvert}
            disabled={convertState === "converting" || convertState === "done"}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {convertState === "converting" ? "Converting…" : convertState === "done" ? "✓ Converted to product" : "⚡ Convert to Product"}
          </button>

          {/* Save + secondary actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saveState === "saving"}
              className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2.5 text-sm font-medium text-[rgb(var(--text))] transition hover:bg-[rgb(var(--bg-elevated))] disabled:opacity-60"
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : saveState === "error" ? "Error — retry" : "Save changes"}
            </button>
            <button
              onClick={handleReject}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/20"
            >
              Reject
            </button>
            <button
              onClick={handleDelete}
              title="Delete this item"
              className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2.5 text-[rgb(var(--muted))] transition hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type Props = { initialItems: QueueRow[] };

export default function ReviewQueueClient({ initialItems }: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  const [items, setOptimisticItems] = useOptimistic(
    initialItems,
    (state, action: { type: "status"; id: string; status: string } | { type: "delete"; id: string } | { type: "enrich"; id: string; fields: Partial<QueueRow> }) => {
      if (action.type === "delete") return state.filter((i) => i.id !== action.id);
      if (action.type === "status") return state.map((i) => i.id === action.id ? { ...i, status: action.status } : i);
      if (action.type === "enrich") return state.map((i) => i.id === action.id ? { ...i, ...action.fields } : i);
      return state;
    },
  );

  const activeItem = items.find((i) => i.id === activeId) ?? null;

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

  async function handleEnrich(id: string, fields: Parameters<typeof enrichQueueItem>[1]) {
    setOptimisticItems({ type: "enrich", id, fields });
    const res = await enrichQueueItem(id, fields);
    if (res?.error) throw new Error(res.error);
  }

  async function handleConvert(id: string) {
    const res = await convertToProduct(id);
    if (res?.error) throw new Error(res.error);
    setOptimisticItems({ type: "status", id, status: "ordered" });
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
            Products saved from the Chrome extension — click any row to review.
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

              {items.map((item) => {
                const isActive = item.id === activeId;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setActiveId(isActive ? null : item.id)}
                    className={`cursor-pointer transition-colors hover:bg-[rgb(var(--panel))] ${isActive ? "bg-blue-500/5 ring-1 ring-inset ring-blue-500/20" : ""}`}
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
                          <option key={o.value} value={o.value} className="bg-[#0f172a] text-white">
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
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Slide-over panel ── */}
      {activeItem && (
        <ReviewPanel
          key={activeItem.id}
          item={activeItem}
          onClose={() => setActiveId(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEnrich={handleEnrich}
          onConvert={handleConvert}
        />
      )}
    </div>
  );
}
