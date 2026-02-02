import { Badge } from "@/components/app/Badge";

const alerts = [
  { title: "Price drop detected", detail: "Nimbus Speaker dropped 12%" },
  { title: "Buy box volatility", detail: "Voltix Docking Station" },
  { title: "Low inventory", detail: "Aurora LED Desk Lamp" },
];

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Alerts</h2>
        <p className="text-sm text-slate-400">
          Stay ahead of pricing shifts and sourcing risks.
        </p>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.title}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <div>
              <h3 className="text-base font-semibold text-slate-100">{alert.title}</h3>
              <p className="text-sm text-slate-400">{alert.detail}</p>
            </div>
            <Badge label="New" variant="warning" />
          </div>
        ))}
      </div>
    </div>
  );
}
