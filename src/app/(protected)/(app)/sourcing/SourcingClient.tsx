"use client";

import { useOptimistic, useTransition, useState, useCallback, useEffect, useRef } from "react";
import type { SourcingItemRow } from "@/data/sourcingItems";
import { updateProduct, archiveProduct, bulkArchiveProducts, bulkDeleteProducts } from "@/app/actions/sourcingItems";
import {
  addProductSupplier,
  removeProductSupplier,
  createSupplier,
  type Supplier,
  type ProductSupplier,
} from "@/app/actions/suppliers";

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

function initials(title: string | null) {
  if (!title) return "?";
  return title.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function computeEconomics(item: SourcingItemRow, suppliers: ProductSupplier[]) {
  const withCost = suppliers.filter((s) => s.cost_price != null);
  const cheapestCost =
    withCost.length > 0
      ? Math.min(...withCost.map((s) => s.cost_price!))
      : item.cost_price;

  if (
    cheapestCost == null ||
    item.buy_box_price == null ||
    item.referral_fee == null ||
    item.fba_fee == null
  ) {
    return { costPrice: cheapestCost, netProfit: item.net_profit, roi: item.roi, margin: item.margin };
  }

  const totalFees = item.referral_fee + item.fba_fee;
  const netProfit = item.buy_box_price - cheapestCost - totalFees;
  const roi = cheapestCost > 0 ? (netProfit / cheapestCost) * 100 : null;
  const margin = item.buy_box_price > 0 ? (netProfit / item.buy_box_price) * 100 : null;
  return { costPrice: cheapestCost, netProfit, roi, margin };
}

// ── Add Supplier Modal ─────────────────────────────────────────────────────

function AddSupplierModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (supplier: Supplier) => void;
}) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const inputCls =
    "w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]/50 focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const res = await createSupplier({
      name: name.trim(),
      website: website.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    if (res.error) { setError(res.error); setSaving(false); return; }
    if (res.supplier) onCreated(res.supplier);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-[rgb(var(--border))] px-6 py-4">
            <h3 className="font-semibold text-[rgb(var(--text))]">New Supplier</h3>
            <p className="mt-0.5 text-sm text-[rgb(var(--muted))]">Add a supplier to your directory.</p>
          </div>
          <div className="space-y-4 p-6">
            <div>
              <label className="mb-1 block text-xs text-[rgb(var(--muted))]">
                Supplier name <span className="text-rose-400">*</span>
              </label>
              <input ref={inputRef} type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Wholesale Central" className={inputCls} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[rgb(var(--muted))]">Website</label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://supplier.com" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[rgb(var(--muted))]">Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                placeholder="Payment terms, contact info…" className={`${inputCls} resize-none`} />
            </div>
            {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-[rgb(var(--border))] px-6 py-4">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-[rgb(var(--border))] px-4 py-2 text-sm text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--panel))]">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60">
              {saving ? "Saving…" : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ── Supplier Section ───────────────────────────────────────────────────────

function SupplierSection({
  item,
  linkedSuppliers,
  allSuppliers,
  onSuppliersChange,
}: {
  item: SourcingItemRow;
  linkedSuppliers: ProductSupplier[];
  allSuppliers: Supplier[];
  onSuppliersChange: (updated: ProductSupplier[]) => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("__none__");
  const [newSku, setNewSku] = useState("");
  const [newCost, setNewCost] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>(allSuppliers);

  const sorted = [...linkedSuppliers].sort((a, b) => {
    if (a.cost_price == null && b.cost_price == null) return 0;
    if (a.cost_price == null) return 1;
    if (b.cost_price == null) return -1;
    return a.cost_price - b.cost_price;
  });

  const cheapestId = sorted[0]?.id ?? null;
  const linkedIds = new Set(linkedSuppliers.map((s) => s.supplier_id));
  const available = localSuppliers.filter((s) => !linkedIds.has(s.id));

  const inputCls =
    "w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]/50 focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition";

  async function handleAdd() {
    if (selectedSupplierId === "__none__") return;
    setAdding(true);
    setAddError("");
    const res = await addProductSupplier({
      queue_item_id: item.id,
      supplier_id: selectedSupplierId,
      supplier_sku: newSku.trim() || undefined,
      cost_price: newCost !== "" ? parseFloat(newCost) : undefined,
    });
    if (res.error) { setAddError(res.error); setAdding(false); return; }
    if (res.productSupplier) onSuppliersChange([...linkedSuppliers, res.productSupplier]);
    setSelectedSupplierId("__none__");
    setNewSku("");
    setNewCost("");
    setAdding(false);
  }

  async function handleRemove(linkId: string) {
    const res = await removeProductSupplier(linkId, item.id);
    if (!res.error) onSuppliersChange(linkedSuppliers.filter((s) => s.id !== linkId));
  }

  function handleNewSupplierCreated(supplier: Supplier) {
    setLocalSuppliers((prev) => [...prev, supplier]);
    setSelectedSupplierId(supplier.id);
  }

  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
        Suppliers
      </p>

      {sorted.length > 0 && (
        <div className="mb-3 space-y-2">
          {sorted.map((link, i) => {
            const isCheapest = link.id === cheapestId && sorted.length > 1;
            const isExpensive = i > 0 && sorted.length > 1;
            const cheapestLink = sorted[0];
            return (
              <div
                key={link.id}
                className={`rounded-lg border p-3 transition ${
                  isCheapest
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--panel))]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-[rgb(var(--text))] truncate">
                        {link.supplier?.name ?? "Unknown"}
                      </span>
                      {isCheapest && (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          ✓ Cheapest
                        </span>
                      )}
                      {isExpensive && cheapestLink?.cost_price != null && link.cost_price != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-400">
                          +{gbp(link.cost_price - cheapestLink.cost_price)} vs cheapest
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[rgb(var(--muted))]">
                      {link.cost_price != null && (
                        <span className="font-mono font-semibold text-[rgb(var(--text))]">
                          {gbp(link.cost_price)}
                        </span>
                      )}
                      {link.supplier_sku && (
                        <span className="font-mono opacity-70">{link.supplier_sku}</span>
                      )}
                      {link.supplier?.website && (
                        <a
                          href={link.supplier.website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-blue-400 transition truncate max-w-[120px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {link.supplier.website.replace(/^https?:\/\//, "")} ↗
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(link.id)}
                    title="Remove supplier"
                    className="flex-shrink-0 rounded p-1 text-[rgb(var(--muted))] transition hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--panel))]/40 p-3 space-y-2.5">
        <div>
          <label className="mb-1 block text-xs text-[rgb(var(--muted))]">Select supplier</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => {
              if (e.target.value === "__add_new__") { setShowModal(true); setSelectedSupplierId("__none__"); }
              else setSelectedSupplierId(e.target.value);
            }}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition cursor-pointer"
          >
            <option value="__none__">— Select a supplier —</option>
            {available.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#0f172a]">{s.name}</option>
            ))}
            <option value="__add_new__" className="bg-[#0f172a] text-blue-400 font-semibold">
              + Add new supplier…
            </option>
          </select>
        </div>

        {selectedSupplierId !== "__none__" && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-[rgb(var(--muted))]">SKU</label>
              <input type="text" value={newSku} onChange={(e) => setNewSku(e.target.value)}
                placeholder="SKU-001" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[rgb(var(--muted))]">Cost (£)</label>
              <input type="number" min="0" step="0.01" value={newCost}
                onChange={(e) => setNewCost(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
          </div>
        )}

        {selectedSupplierId !== "__none__" && (
          <button onClick={handleAdd} disabled={adding}
            className="w-full rounded-lg bg-[rgb(var(--card))] border border-[rgb(var(--border))] py-2 text-sm font-medium text-[rgb(var(--text))] transition hover:bg-[rgb(var(--panel))] disabled:opacity-60">
            {adding ? "Adding…" : "Add to product"}
          </button>
        )}

        {addError && <p className="text-xs text-rose-400">{addError}</p>}
      </div>

      {showModal && (
        <AddSupplierModal onClose={() => setShowModal(false)} onCreated={handleNewSupplierCreated} />
      )}
    </div>
  );
}

// ── Product Panel ──────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";
type ArchiveState = "idle" | "archiving" | "done" | "error";

function ProductPanel({
  item,
  allSuppliers,
  onClose,
  onArchive,
}: {
  item: SourcingItemRow;
  allSuppliers: Supplier[];
  onClose: () => void;
  onArchive: (id: string) => Promise<void>;
}) {
  const [linkedSuppliers, setLinkedSuppliers] = useState<ProductSupplier[]>(
    (item.review_queue_suppliers ?? []) as ProductSupplier[],
  );
  const [notes, setNotes] = useState(item.notes ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [archiveState, setArchiveState] = useState<ArchiveState>("idle");

  const econ = computeEconomics(item, linkedSuppliers);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    try {
      const res = await updateProduct(item.id, { notes: notes || undefined });
      if (res?.error) throw new Error(res.error);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }, [item.id, notes]);

  const handleArchive = useCallback(async () => {
    if (!confirm("Archive this product? You can restore it later from Archived Products.")) return;
    setArchiveState("archiving");
    try {
      await onArchive(item.id);
      setArchiveState("done");
      setTimeout(onClose, 800);
    } catch {
      setArchiveState("error");
      setTimeout(() => setArchiveState("idle"), 3000);
    }
  }, [item.id, onArchive, onClose]);

  const inputCls =
    "w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))]/50 focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[580px] flex-col bg-[rgb(var(--card))] shadow-2xl border-l border-[rgb(var(--border))]">

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-[rgb(var(--border))] p-5">
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[rgb(var(--panel))] ring-1 ring-[rgb(var(--border))]">
            {item.image_url ? (
              <img src={item.image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-[rgb(var(--muted))]">
                {initials(item.title)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[rgb(var(--text))] leading-snug line-clamp-2 text-[15px]"
              title={item.title ?? ""}>
              {item.title ?? "Unknown product"}
            </p>
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <a href={`https://www.amazon.co.uk/dp/${item.asin}`} target="_blank" rel="noreferrer"
                className="font-mono text-xs text-blue-400 hover:text-blue-300 transition">
                {item.asin} ↗
              </a>
              <span className="text-[rgb(var(--muted))]/40">·</span>
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Active
              </span>
              <span className="text-[rgb(var(--muted))]/40">·</span>
              <span className="text-xs text-[rgb(var(--muted))]">
                Added {relativeDate(item.created_at)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1.5 text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--panel))] hover:text-[rgb(var(--text))]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Economics — live from cheapest supplier */}
          <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))]/50 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
                Economics
              </p>
              {linkedSuppliers.filter((s) => s.cost_price != null).length > 0 && (
                <span className="text-[10px] text-emerald-400">↳ using cheapest supplier cost</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Buy Box", value: gbp(item.buy_box_price) },
                {
                  label: "Cost",
                  value: gbp(econ.costPrice),
                  highlight: econ.costPrice !== item.cost_price && econ.costPrice != null,
                },
                { label: "Ref Fee", value: gbp(item.referral_fee) },
                { label: "FBA Fee", value: gbp(item.fba_fee) },
              ].map(({ label, value, highlight }) => (
                <div key={label}
                  className={`rounded-lg border p-2.5 text-center transition ${
                    highlight
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--card))]"
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))]">{label}</p>
                  <p className={`mt-0.5 text-xs font-semibold font-mono ${highlight ? "text-emerald-400" : "text-[rgb(var(--text))]"}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { label: "Net Profit", value: gbp(econ.netProfit), colour: profitColour(econ.netProfit) },
                { label: "ROI", value: pct(econ.roi), colour: profitColour(econ.roi) },
                { label: "Margin", value: pct(econ.margin), colour: profitColour(econ.margin) },
              ].map(({ label, value, colour }) => (
                <div key={label} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))]">{label}</p>
                  <p className={`mt-0.5 text-sm font-bold font-mono ${colour}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5 p-5">

            {/* Category + Size Tier */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))]">Category</p>
                <p className="mt-0.5 text-sm text-[rgb(var(--text))]">
                  {item.category ?? <span className="italic text-[rgb(var(--muted))]">Unknown</span>}
                </p>
              </div>
              <div className="rounded-lg bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-3 py-2.5">
                <p className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))]">Size Tier</p>
                <p className="mt-0.5 text-sm text-[rgb(var(--text))]">
                  {item.size_tier ?? <span className="italic text-[rgb(var(--muted))]">Unknown</span>}
                </p>
              </div>
            </div>

            <div className="border-t border-[rgb(var(--border))]" />

            {/* Suppliers */}
            <SupplierSection
              item={item}
              linkedSuppliers={linkedSuppliers}
              allSuppliers={allSuppliers}
              onSuppliersChange={setLinkedSuppliers}
            />

            <div className="border-t border-[rgb(var(--border))]" />

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about this product…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--panel))]/30 p-4 space-y-2.5">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saveState === "saving"}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60"
            >
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : saveState === "error" ? "Error — retry" : "Save changes"}
            </button>
            <button
              onClick={handleArchive}
              disabled={archiveState === "archiving" || archiveState === "done"}
              className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2.5 text-sm font-medium text-[rgb(var(--muted))] transition hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400 active:scale-[0.99] disabled:opacity-60"
            >
              {archiveState === "archiving" ? "Archiving…" : archiveState === "done" ? "✓ Archived" : "Archive"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

type Props = { initialItems: SourcingItemRow[]; allSuppliers: Supplier[] };

export default function SourcingClient({ initialItems, allSuppliers }: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);

  const [items, setOptimistic] = useOptimistic(
    initialItems,
    (state, action: { type: "archive"; id: string } | { type: "bulkArchive"; ids: string[] }) => {
      if (action.type === "archive") return state.filter((i) => i.id !== action.id);
      if (action.type === "bulkArchive") return state.filter((i) => !action.ids.includes(i.id));
      return state;
    },
  );

  const activeItem = items.find((i) => i.id === activeId) ?? null;

  function handleArchive(id: string) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        setOptimistic({ type: "archive", id });
        const res = await archiveProduct(id);
        if (res?.error) { reject(new Error(res.error)); } else { resolve(); }
      });
    });
  }

  // ── Bulk helpers ──────────────────────────────────────────────────────────

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const someSelected = !allSelected && items.some((i) => selectedIds.has(i.id));

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  }

  function toggleSelectOne(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkArchive() {
    const ids = [...selectedIds];
    if (!confirm(`Archive ${ids.length} product${ids.length > 1 ? "s" : ""}?`)) return;
    setBulkPending(true);
    startTransition(async () => {
      setOptimistic({ type: "bulkArchive", ids });
      await bulkArchiveProducts(ids);
      setSelectedIds(new Set());
      setBulkPending(false);
    });
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds];
    if (!confirm(`Permanently delete ${ids.length} product${ids.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkPending(true);
    startTransition(async () => {
      setOptimistic({ type: "bulkArchive", ids });
      await bulkDeleteProducts(ids);
      setSelectedIds(new Set());
      setBulkPending(false);
    });
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Sourcing List</h2>
            <span className="rounded-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-2.5 py-0.5 text-xs font-semibold text-[rgb(var(--muted))]">
              {items.length}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[rgb(var(--muted))]">
            Active products converted from your review queue — click any row to edit.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))]/60">
                <th className="w-10 pl-4 pr-2 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleSelectAll}
                    className="cursor-pointer accent-blue-500 rounded"
                  />
                </th>
                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Product</th>
                <th className="px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Supplier</th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Buy Box</th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Cost</th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Net Profit</th>
                <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">ROI</th>
                <th className="px-3 py-3 pr-4 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Added</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--border))]">

              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-2.5">
                      <span className="text-4xl">📋</span>
                      <span className="font-semibold text-[rgb(var(--text))]">No active products</span>
                      <span className="text-sm text-[rgb(var(--muted))]">
                        Convert products from your Review Queue to see them here.
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {items.map((item) => {
                const isActive = item.id === activeId;
                const supplierNames = (item.review_queue_suppliers ?? [])
                  .sort((a, b) => (a.cost_price ?? Infinity) - (b.cost_price ?? Infinity))
                  .map((s) => s.supplier?.name)
                  .filter(Boolean);
                const displaySupplier = supplierNames[0] ?? item.supplier_name ?? null;

                return (
                  <tr
                    key={item.id}
                    onClick={() => setActiveId(isActive ? null : item.id)}
                    className={`group cursor-pointer transition-colors ${
                      selectedIds.has(item.id)
                        ? "bg-blue-500/[0.05]"
                        : isActive
                        ? "bg-blue-500/[0.07] ring-1 ring-inset ring-blue-500/20"
                        : "hover:bg-[rgb(var(--panel))]/60"
                    }`}
                    style={{ opacity: isPending ? 0.65 : 1 }}
                  >
                    {/* Checkbox */}
                    <td className="w-10 pl-4 pr-2 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => {}}
                        onClick={(e) => toggleSelectOne(item.id, e)}
                        className="cursor-pointer accent-blue-500 rounded"
                      />
                    </td>

                    {/* Product */}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-[rgb(var(--panel))] ring-1 ring-[rgb(var(--border))]">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[rgb(var(--muted))]">
                              {initials(item.title)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="w-[220px] truncate font-medium text-[rgb(var(--text))] text-[13px]" title={item.title ?? undefined}>
                            {item.title}
                          </div>
                          <a
                            href={`https://www.amazon.co.uk/dp/${item.asin}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-[11px] text-[rgb(var(--muted))] hover:text-blue-400 transition"
                          >
                            {item.asin}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Supplier — shows cheapest linked supplier name */}
                    <td className="px-3 py-2.5 text-[13px] text-[rgb(var(--muted))] max-w-[140px]">
                      {displaySupplier ? (
                        <span className="truncate block">
                          {displaySupplier}
                          {supplierNames.length > 1 && (
                            <span className="ml-1 text-[10px] text-[rgb(var(--muted))]/50">
                              +{supplierNames.length - 1}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="opacity-40">—</span>
                      )}
                    </td>

                    {/* Buy box */}
                    <td className="px-3 py-2.5 text-right font-mono text-[13px] text-[rgb(var(--text))]">
                      {gbp(item.buy_box_price)}
                    </td>

                    {/* Cost */}
                    <td className="px-3 py-2.5 text-right font-mono text-[13px] text-[rgb(var(--muted))]">
                      {gbp(item.cost_price)}
                    </td>

                    {/* Net profit */}
                    <td className={`px-3 py-2.5 text-right font-mono text-[13px] font-semibold ${profitColour(item.net_profit)}`}>
                      {gbp(item.net_profit)}
                    </td>

                    {/* ROI */}
                    <td className={`px-3 py-2.5 text-right font-mono text-[13px] font-semibold ${profitColour(item.roi)}`}>
                      {pct(item.roi)}
                    </td>

                    {/* Added */}
                    <td className="px-3 py-2.5 pr-4 text-right text-[11px] text-[rgb(var(--muted))] whitespace-nowrap">
                      {relativeDate(item.created_at)}
                    </td>

                    {/* Archive quick action */}
                    <td className="w-10 pr-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleArchive(item.id); }}
                        title="Archive product"
                        className="rounded p-1.5 text-transparent transition group-hover:text-[rgb(var(--muted))] hover:!text-amber-400 hover:bg-amber-500/10"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="21 8 21 21 3 21 3 8" />
                          <rect x="1" y="3" width="22" height="5" />
                          <line x1="10" y1="12" x2="14" y2="12" />
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

      {/* Slide-over panel */}
      {activeItem && (
        <ProductPanel
          key={activeItem.id}
          item={activeItem}
          allSuppliers={allSuppliers}
          onClose={() => setActiveId(null)}
          onArchive={handleArchive}
        />
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-5 py-3 shadow-2xl shadow-black/50">
          <span className="text-sm font-semibold text-[rgb(var(--text))] whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-[rgb(var(--border))]" />
          <button
            onClick={handleBulkArchive}
            disabled={bulkPending}
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-60"
          >
            Archive
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkPending}
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-60"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            title="Clear selection"
            className="rounded-lg border border-[rgb(var(--border))] p-1.5 text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--panel))]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
