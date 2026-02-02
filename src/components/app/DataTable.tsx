import { MockItem } from "@/lib/mockData";
import { Badge } from "./Badge";

type DataTableProps = {
  rows: MockItem[];
  onRowClick?: (row: MockItem) => void;
};

const statusVariant: Record<MockItem["status"], "success" | "warning" | "danger" | "default"> = {
  Saved: "success",
  Review: "warning",
  Rejected: "danger",
  "In Progress": "default",
};

export function DataTable({ rows, onRowClick }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Buy Box</th>
              <th className="px-4 py-3">Profit</th>
              <th className="px-4 py-3">ROI</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className="cursor-pointer transition hover:bg-slate-800/60"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-800">
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-300">
                          {row.title
                            .split(" ")
                            .slice(0, 2)
                            .map((word) => word[0])
                            .join("")}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-100">{row.title}</div>
                      <div className="text-xs text-slate-400">{row.asin}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-300">{row.supplier}</td>
                <td className="px-4 py-4 text-slate-300">${row.cost.toFixed(2)}</td>
                <td className="px-4 py-4 text-slate-300">${row.buyBox.toFixed(2)}</td>
                <td className="px-4 py-4 text-slate-300">${row.profit.toFixed(2)}</td>
                <td className="px-4 py-4 text-slate-300">{row.roi}%</td>
                <td className="px-4 py-4">
                  <Badge label={row.status} variant={statusVariant[row.status]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
