import { Badge } from "@/components/app/Badge";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Billing</h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Manage subscription tiers, invoices, and payment methods.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Growth Plan</h3>
            <Badge label="Active" variant="success" />
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            $399 / month • 5 seats • 10k ASIN checks
          </p>
          <button className="mt-4 rounded-full border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm text-[rgb(var(--text))]">
            Manage plan
          </button>
        </div>
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <h3 className="text-lg font-semibold">Payment method</h3>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Visa ending •••• 1234
          </p>
          <button className="mt-4 rounded-full border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm text-[rgb(var(--text))]">
            Update card
          </button>
        </div>
      </div>
    </div>
  );
}
