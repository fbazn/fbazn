import Link from "next/link";
import { getSuppliersWithCounts } from "@/app/actions/suppliers";

function gbp(n: number | null) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliersWithCounts();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Suppliers</h2>
            <span className="rounded-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-2.5 py-0.5 text-xs font-semibold text-[rgb(var(--muted))]">
              {suppliers.length}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[rgb(var(--muted))]">
            Your supplier directory — click a supplier to see all linked products.
          </p>
        </div>
      </div>

      {/* Empty state */}
      {suppliers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border))] py-20 text-center">
          <span className="text-4xl">🏭</span>
          <p className="mt-3 font-semibold text-[rgb(var(--text))]">No suppliers yet</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Add suppliers from the Review Queue when reviewing a product.
          </p>
          <Link
            href="/review-queue"
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Go to Review Queue
          </Link>
        </div>
      )}

      {/* Supplier grid */}
      {suppliers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {suppliers.map((supplier) => (
            <Link
              key={supplier.id}
              href={`/suppliers/${supplier.id}`}
              className="group rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 transition hover:border-blue-500/40 hover:bg-[rgb(var(--panel))]"
            >
              {/* Icon + name */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))] text-lg">
                  🏭
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[rgb(var(--text))] group-hover:text-blue-400 transition truncate">
                    {supplier.name}
                  </p>
                  {supplier.website && (
                    <p className="mt-0.5 truncate text-xs text-[rgb(var(--muted))]">
                      {supplier.website.replace(/^https?:\/\//, "")}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[rgb(var(--muted))]">Products</p>
                  <p className="mt-0.5 font-semibold text-[rgb(var(--text))]">
                    {supplier.product_count}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {supplier.notes && (
                <p className="mt-3 line-clamp-2 text-xs text-[rgb(var(--muted))]">
                  {supplier.notes}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
