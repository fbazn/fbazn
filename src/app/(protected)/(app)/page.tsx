import { mockRecentItems } from "@/lib/mockData";
import { Badge } from "@/components/app/Badge";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Active sourcing", value: "128", trend: "+12%" },
          { label: "Projected profit", value: "$24.8k", trend: "+8%" },
          { label: "ROI watchlist", value: "42", trend: "Stable" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5 shadow-sm"
          >
            <div className="text-sm text-[rgb(var(--muted))]">{card.label}</div>
            <div className="mt-3 text-2xl font-semibold text-[rgb(var(--text))]">
              {card.value}
            </div>
            <div className="mt-2 text-xs text-emerald-300">{card.trend}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pipeline summary</h2>
            <Badge label="Last 7 days" variant="muted" />
          </div>
          <div className="mt-6 space-y-4 text-sm text-[rgb(var(--muted))]">
            <div className="flex items-center justify-between">
              <span>New supplier leads</span>
              <span className="text-[rgb(var(--text))]">34</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Listings evaluated</span>
              <span className="text-[rgb(var(--text))]">182</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Saved to watchlist</span>
              <span className="text-[rgb(var(--text))]">58</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rejected</span>
              <span className="text-[rgb(var(--text))]">17</span>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-[rgb(var(--border-subtle))] p-4 text-sm text-[rgb(var(--muted))]">
            Add notes, reminders, or automation workflows for your sourcing team.
          </div>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <h2 className="text-lg font-semibold">Recent saves</h2>
          <div className="mt-5 space-y-4">
            {mockRecentItems.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[rgb(var(--bg-elevated))]">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[rgb(var(--muted))]">
                      {item.title
                        .split(" ")
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[rgb(var(--text))]">
                    {item.title}
                  </div>
                  <div className="text-xs text-[rgb(var(--muted))]">
                    ASIN {item.asin}
                  </div>
                </div>
                <Badge label={`${item.roi}% ROI`} variant="success" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
