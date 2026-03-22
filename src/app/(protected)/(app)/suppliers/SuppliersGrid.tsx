"use client";

import Link from "next/link";
import type { SupplierWithCount } from "@/app/actions/suppliers";

function supplierInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function supplierColour(name: string): string {
  const colours = [
    "from-blue-400 to-blue-600",
    "from-violet-400 to-violet-600",
    "from-emerald-400 to-emerald-600",
    "from-amber-400 to-orange-500",
    "from-rose-400 to-rose-600",
    "from-cyan-400 to-cyan-600",
    "from-indigo-400 to-indigo-600",
    "from-pink-400 to-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colours[Math.abs(hash) % colours.length];
}

export function SuppliersGrid({ suppliers }: { suppliers: SupplierWithCount[] }) {
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[rgb(var(--muted))]"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-[rgb(var(--text))]">No suppliers yet</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Suppliers are added when you link one to a product in the Review Queue.
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
              {/* Avatar + name */}
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white ${supplierColour(supplier.name)}`}
                >
                  {supplierInitials(supplier.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[rgb(var(--text))] group-hover:text-blue-400 transition">
                    {supplier.name}
                  </p>
                  {supplier.website && (
                    <a
                      href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 block truncate text-xs text-[rgb(var(--muted))] hover:text-blue-400 transition"
                    >
                      {supplier.website.replace(/^https?:\/\//, "")} ↗
                    </a>
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
