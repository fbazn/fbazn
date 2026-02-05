import { Badge } from "@/components/app/Badge";

const deals = [
  { title: "Flash liquidation", detail: "45 SKUs • $8-12 margin" },
  { title: "Electronics bundle", detail: "12 SKUs • 2-week lead" },
  { title: "Seasonal closeout", detail: "27 SKUs • Limited stock" },
];

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Deals</h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Curated supplier opportunities and short-term promotions.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {deals.map((deal) => (
          <div
            key={deal.title}
            className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                {deal.title}
              </h3>
              <Badge label="Hot" variant="warning" />
            </div>
            <p className="mt-3 text-sm text-[rgb(var(--muted))]">
              {deal.detail}
            </p>
            <button className="mt-4 rounded-full border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm text-[rgb(var(--text))]">
              Review deal
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
