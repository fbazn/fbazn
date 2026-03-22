export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Deals</h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Curated supplier opportunities and short-term promotions.
        </p>
      </div>

      {/* Coming soon */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgb(var(--border))] py-24 text-center">
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
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <p className="mt-4 font-semibold text-[rgb(var(--text))]">Deals — coming soon</p>
        <p className="mt-1.5 max-w-sm text-sm text-[rgb(var(--muted))]">
          Curated supplier liquidations, bulk lots, and short-window promotions will appear
          here. We&apos;ll notify you when this is live.
        </p>
      </div>
    </div>
  );
}
