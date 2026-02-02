import { Badge } from "@/components/app/Badge";

export default function AsinPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">ASIN Lookup</h2>
        <p className="text-sm text-slate-400">
          Search any ASIN and preview profitability insights.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <input
          placeholder="Enter ASIN or product URL"
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
          Run check
        </button>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Placeholder results
            </h3>
            <p className="text-sm text-slate-400">
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
              className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400"
            >
              {metric} will appear here.
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
