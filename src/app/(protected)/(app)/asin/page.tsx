import { Badge } from "@/components/app/Badge";

export default function AsinPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          ASIN Lookup
        </h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Search any ASIN and preview profitability insights.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5">
        <input
          placeholder="Enter ASIN or product URL"
          className="flex-1 bg-transparent text-sm text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:outline-none"
        />
        <button className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
          Run check
        </button>
      </div>
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
              Placeholder results
            </h3>
            <p className="text-sm text-[rgb(var(--muted))]">
              Preview pricing, fees, and competition signals.
            </p>
          </div>
          <Badge label="Awaiting input" variant="muted" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Projected margin",
            "Sales velocity",
            "Seller saturation",
          ].map((metric) => (
            <div
              key={metric}
              className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] p-4 text-sm text-[rgb(var(--muted))]"
            >
              {metric} will appear here.
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
