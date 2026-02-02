import { Badge } from "@/components/app/Badge";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Billing</h2>
        <p className="text-sm text-slate-400">
          Manage subscription tiers, invoices, and payment methods.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Growth Plan</h3>
            <Badge label="Active" variant="success" />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            $399 / month • 5 seats • 10k ASIN checks
          </p>
          <button className="mt-4 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
            Manage plan
          </button>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold">Payment method</h3>
          <p className="mt-2 text-sm text-slate-400">Visa ending •••• 1234</p>
          <button className="mt-4 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">
            Update card
          </button>
        </div>
      </div>
    </div>
  );
}
