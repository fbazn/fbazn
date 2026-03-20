import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupplierWithProducts } from "@/app/actions/suppliers";

function gbp(n: number | null) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n);
}

function pct(n: number | null) {
  if (n === null || n === undefined) return "—";
  return `${Number(n).toFixed(1)}%`;
}

function profitColour(n: number | null) {
  if (n === null) return "text-[rgb(var(--muted))]";
  return n >= 0 ? "text-emerald-400" : "text-rose-400";
}

function initials(title: string | null) {
  if (!title) return "?";
  return title
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  reviewing: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  contacted: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  ordered: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getSupplierWithProducts(id);
  if (!result) notFound();

  const { supplier, links } = result;

  // For each product, figure out if this supplier is the cheapest
  // We only have this supplier's cost here — note to user if not cheapest
  // is handled by comparing the link.cost_price to the queue item's cost_price
  // (which is auto-synced to the cheapest)

  return (
    <div className="space-y-6">

      {/* Back breadcrumb */}
      <div>
        <Link
          href="/suppliers"
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Suppliers
        </Link>
      </div>

      {/* Supplier header card */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] text-2xl">
            🏭
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">{supplier.name}</h2>
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-block text-sm text-blue-400 hover:text-blue-300 transition"
              >
                {supplier.website.replace(/^https?:\/\//, "")} ↗
              </a>
            )}
            {supplier.notes && (
              <p className="mt-2 text-sm text-[rgb(var(--muted))]">{supplier.notes}</p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))]">Products</p>
            <p className="mt-0.5 text-2xl font-bold text-[rgb(var(--text))]">{links.length}</p>
          </div>
        </div>
      </div>

      {/* Products table */}
      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border))] py-16 text-center">
          <span className="text-3xl">📦</span>
          <p className="mt-3 font-semibold text-[rgb(var(--text))]">No products linked</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Link this supplier to products in the Review Queue.
          </p>
          <Link
            href="/review-queue"
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Go to Review Queue
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--panel))]/60">
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Product</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Buy Box</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">This Supplier Cost</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Net Profit</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">ROI</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Price</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">SKU</th>
                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[rgb(var(--muted))]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {links.map((link) => {
                  const product = link.review_queue;
                  if (!product) return null;

                  // Is this supplier's cost higher than the product's cheapest cost?
                  const isNotCheapest =
                    link.cost_price != null &&
                    product.cost_price != null &&
                    link.cost_price > product.cost_price + 0.001;

                  const cheaperSaving = isNotCheapest
                    ? link.cost_price! - product.cost_price!
                    : null;

                  return (
                    <tr
                      key={link.id}
                      className="group transition-colors hover:bg-[rgb(var(--panel))]/60"
                    >
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-[rgb(var(--panel))] ring-1 ring-[rgb(var(--border))]">
                            {product.image_url ? (
                              <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[rgb(var(--muted))]">
                                {initials(product.title)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href="/review-queue"
                              className="block max-w-[260px] truncate font-medium text-[rgb(var(--text))] text-[13px] hover:text-blue-400 transition"
                              title={product.title ?? ""}
                            >
                              {product.title ?? "Unknown product"}
                            </Link>
                            <a
                              href={`https://www.amazon.co.uk/dp/${product.asin}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[11px] text-[rgb(var(--muted))] hover:text-blue-400 transition"
                            >
                              {product.asin}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Buy box */}
                      <td className="px-4 py-3 text-right font-mono text-[13px] text-[rgb(var(--text))]">
                        {gbp(product.buy_box_price)}
                      </td>

                      {/* This supplier's cost */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-[13px] text-[rgb(var(--text))]">
                            {gbp(link.cost_price)}
                          </span>
                          {isNotCheapest && cheaperSaving != null && (
                            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-amber-400">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="18 15 12 9 6 15" />
                              </svg>
                              {gbp(cheaperSaving)} cheaper available
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Net profit */}
                      <td className={`px-4 py-3 text-right font-mono text-[13px] font-semibold ${profitColour(product.net_profit)}`}>
                        {gbp(product.net_profit)}
                      </td>

                      {/* ROI */}
                      <td className={`px-4 py-3 text-right font-mono text-[13px] font-semibold ${profitColour(product.roi)}`}>
                        {pct(product.roi)}
                      </td>

                      {/* Price indicator */}
                      <td className="px-4 py-3">
                        {isNotCheapest ? (
                          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                            Not cheapest
                          </span>
                        ) : link.cost_price != null ? (
                          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            ✓ Cheapest
                          </span>
                        ) : (
                          <span className="text-[rgb(var(--muted))]/40 text-xs">—</span>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 font-mono text-[12px] text-[rgb(var(--muted))]">
                        {link.supplier_sku ?? <span className="opacity-40">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            STATUS_STYLES[product.status] ?? STATUS_STYLES.pending
                          }`}
                        >
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
