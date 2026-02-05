import { Badge } from "@/components/app/Badge";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">
          Integrations
        </h2>
        <Badge label="🔒 Coming soon" variant="muted" />
      </div>
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
        <p className="text-sm text-[rgb(var(--muted))]">
          Connect Amazon, Walmart, and supplier feeds to unlock automated data
          sync. This area will support secure API connections and webhooks.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            "Amazon Seller Central",
            "Supplier FTP feeds",
            "ERP integrations",
            "Slack alerts",
          ].map((integration) => (
            <div
              key={integration}
              className="rounded-xl border border-dashed border-[rgb(var(--border-subtle))] p-4 text-sm text-[rgb(var(--muted))]"
            >
              {integration}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
