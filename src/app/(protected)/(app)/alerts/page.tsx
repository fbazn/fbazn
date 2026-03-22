export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Alerts</h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Stay ahead of pricing shifts, inventory gaps, and sourcing risks.
        </p>
      </div>

      {/* Empty state */}
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
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <p className="mt-4 font-semibold text-[rgb(var(--text))]">No alerts yet</p>
        <p className="mt-1.5 max-w-xs text-sm text-[rgb(var(--muted))]">
          Alerts will appear here when we detect price drops, inventory gaps, or
          products with missing cost data.
        </p>
      </div>

      {/* Coming soon section */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
          What you&apos;ll be alerted about
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: (
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              ),
              title: "Price drops",
              detail: "Buy box price drops on products in your sourcing list",
            },
            {
              icon: (
                <>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </>
              ),
              title: "Unmatched inventory",
              detail:
                "Amazon inventory products with no cost price in FBAZN",
            },
            {
              icon: (
                <>
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </>
              ),
              title: "ROI changes",
              detail: "Significant margin shifts on products you&apos;re tracking",
            },
            {
              icon: (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </>
              ),
              title: "Action required",
              detail: "Items in your review queue or inbound orders needing attention",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border-subtle,var(--border)))] bg-[rgb(var(--panel))] p-3.5"
            >
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--card))] border border-[rgb(var(--border))]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[rgb(var(--muted))]"
                >
                  {item.icon}
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-[rgb(var(--text))]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-[rgb(var(--muted))]">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
