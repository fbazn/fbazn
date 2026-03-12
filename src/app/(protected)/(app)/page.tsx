import { Badge } from "@/components/app/Badge";
import { getDashboardStats } from "@/data/dashboardStats";
import { getRecentRows } from "@/data/sourcingItems";
import { toMockItem } from "@/data/adapters";

const currencyFmt = (val: number, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(val);

export default async function DashboardPage() {
  const [stats, recentRows] = await Promise.all([
    getDashboardStats(),
    getRecentRows(4),
  ]);
  const recentItems = recentRows.map(toMockItem);

  const cards = [
    {
      label: "Active pipeline",
      value: stats.totalActive.toString(),
      sub: `${stats.totalSaved} saved · ${stats.totalReview} in review`,
    },
    {
      label: "Projected profit",
      value: currencyFmt(stats.projectedProfit),
      sub: "From saved leads",
    },
    {
      label: "Avg ROI",
      value: stats.avgRoi > 0 ? `${stats.avgRoi}%` : "—",
      sub: "Across all items",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 shadow-sm"
          >
            <div className="text-sm text-[rgb(var(--muted))]">{card.label}</div>
            <div className="mt-3 text-2xl font-semibold text-[rgb(var(--text))]">
              {card.value}
            </div>
            <div className="mt-1 text-xs text-[rgb(var(--muted))]">
              {card.sub}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pipeline summary</h2>
            <Badge label="All time" variant="muted" />
          </div>
          <div className="mt-6 space-y-4 text-sm text-[rgb(var(--muted))]">
            {[
              { label: "Saved leads", value: stats.totalSaved },
              { label: "In review", value: stats.totalReview },
              { label: "In progress", value: stats.totalActive - stats.totalSaved },
              { label: "Rejected", value: stats.totalRejected },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span>{row.label}</span>
                <span className="font-medium text-[rgb(var(--text))]">{row.value}</span>
              </div>
            ))}
          </div>
          {stats.totalActive === 0 && stats.totalReview === 0 && (
            <div className="mt-6 rounded-xl border border-dashed border-[rgb(var(--border-subtle))] p-4 text-sm text-[rgb(var(--muted))]">
              No leads yet. Add your first lead using the + Add button above.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <h2 className="text-lg font-semibold">Recent saves</h2>
          {recentItems.length === 0 ? (
            <p className="mt-5 text-sm text-[rgb(var(--muted))]">No items yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[rgb(var(--bg-elevated))]">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[rgb(var(--muted))]">
                        {item.title.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[rgb(var(--text))]">{item.title}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">{item.asin}</div>
                  </div>
                  <Badge label={`${item.roi}% ROI`} variant="success" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
