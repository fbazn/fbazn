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
      sub: `${stats.totalSaved} saved / ${stats.totalReview} in review`,
      accent: "amber",
    },
    {
      label: "Average profit",
      value: currencyFmt(stats.avgProfit),
      sub: "Per saved lead",
      accent: "indigo",
    },
    {
      label: "Avg ROI",
      value: stats.avgRoi > 0 ? `${stats.avgRoi}%` : "-",
      sub: "Across all items",
      accent: "amber",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="industrial-panel overflow-hidden p-6">
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr,1fr] lg:items-end">
          <div>
            <p className="section-label">Operations deck</p>
            <h2 className="mt-2 font-barlow-condensed text-5xl font-black uppercase leading-none tracking-normal text-[rgb(var(--text))] md:text-6xl">
              Warehouse snapshot
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--muted))]">
              Track the products that matter, protect margin, and keep sourcing decisions moving through one focused command centre.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "Saved", value: stats.totalSaved },
              { label: "Review", value: stats.totalReview },
              { label: "Rejected", value: stats.totalRejected },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border border-[rgb(var(--border))] bg-[rgba(8,12,24,0.56)] px-4 py-3"
              >
                <span className="field-label">{row.label}</span>
                <span className="metric-value text-2xl">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="-mx-6 mt-6">
          <div className="hazard-bar" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            data-accent={card.accent}
            className="industrial-card p-5 pl-6"
          >
            <div className="relative">
              <div className="field-label">{card.label}</div>
              <div className="metric-value mt-3 text-4xl leading-none">
                {card.value}
              </div>
              <div className="mt-2 text-xs text-[rgb(var(--muted))]">
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="industrial-panel p-6">
          <div className="relative flex items-center justify-between">
            <div>
              <p className="section-label">Pipeline</p>
              <h2 className="font-barlow-condensed text-3xl font-black uppercase tracking-normal text-[rgb(var(--text))]">
                Summary
              </h2>
            </div>
            <Badge label="All time" variant="muted" />
          </div>
          <div className="relative mt-6 space-y-3 text-sm text-[rgb(var(--muted))]">
            {[
              { label: "Saved leads", value: stats.totalSaved },
              { label: "In review", value: stats.totalReview },
              { label: "In progress", value: stats.totalActive - stats.totalSaved },
              { label: "Rejected", value: stats.totalRejected },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-[rgb(var(--border))] pb-3 last:border-b-0 last:pb-0"
              >
                <span>{row.label}</span>
                <span className="metric-value text-xl">{row.value}</span>
              </div>
            ))}
          </div>
          {stats.totalActive === 0 && stats.totalReview === 0 && (
            <div className="relative mt-6 border border-dashed border-[rgb(var(--border-subtle))] p-4 text-sm text-[rgb(var(--muted))]">
              No leads yet. Add your first lead using the Add button above.
            </div>
          )}
        </div>

        <div className="industrial-panel p-6">
          <div className="relative">
            <p className="section-label">Recent</p>
            <h2 className="font-barlow-condensed text-3xl font-black uppercase tracking-normal text-[rgb(var(--text))]">
              Saves
            </h2>
          </div>
          {recentItems.length === 0 ? (
            <p className="relative mt-5 text-sm text-[rgb(var(--muted))]">
              No items yet.
            </p>
          ) : (
            <div className="relative mt-5 space-y-4">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))]">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[rgb(var(--muted))]">
                        {item.title.split(" ").slice(0, 2).map((word) => word[0]).join("")}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[rgb(var(--text))]">
                      {item.title}
                    </div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      {item.asin}
                    </div>
                  </div>
                  <Badge
                    label={`${item.roi}% ROI`}
                    variant={item.roi >= 0 ? "success" : "danger"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
