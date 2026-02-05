import { Badge } from "@/components/app/Badge";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Help</h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Find onboarding resources or contact support.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quickstart guide</h3>
            <Badge label="New" variant="warning" />
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Walk through your first sourcing workflow in 15 minutes.
          </p>
        </div>
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <h3 className="text-lg font-semibold">Support</h3>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            support@fbazn.com
          </p>
          <button className="mt-4 rounded-full border border-[rgb(var(--border-subtle))] px-4 py-2 text-sm text-[rgb(var(--text))]">
            Open ticket
          </button>
        </div>
      </div>
    </div>
  );
}
