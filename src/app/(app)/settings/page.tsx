import { Badge } from "@/components/app/Badge";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Settings</h2>
        <p className="text-sm text-slate-400">
          Customize workspace defaults and team preferences.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <Badge label="Enabled" variant="success" />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Price drops, buy box shifts, and ROI alerts.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="text-lg font-semibold">Team access</h3>
          <p className="mt-2 text-sm text-slate-400">
            12 teammates • 3 admin roles
          </p>
        </div>
      </div>
    </div>
  );
}
