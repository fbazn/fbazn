"use client";

import { useState, useEffect } from "react";
import { KeepaChart } from "@/components/KeepaChart";

interface KeepaPayload {
  asin: string;
  monthlySold: number | null;
  salesRankCurrent: number | null;
  salesRank30Avg: number | null;
  salesRank90Avg: number | null;
  salesRank180Avg: number | null;
  salesRank365Avg: number | null;
  bsrBest: number | null;
  bsrWorst: number | null;
  buyBoxCurrent: number | null;
  buyBox30Avg: number | null;
  buyBox90Avg: number | null;
  buyBoxLow: number | null;
  buyBoxHigh: number | null;
  volatility: "high" | "medium" | "low" | null;
  series: {
    bsr: { t: number; v: number }[];
    bb:  { t: number; v: number }[];
  };
}

const VOLATILITY_CFG = {
  high:   { color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/30",       icon: "⚡", text: "HIGH VOLATILITY" },
  medium: { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30",     icon: "〜", text: "MED VOLATILITY"  },
  low:    { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: "✓", text: "STABLE PRICE"     },
};

function KStat({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center min-w-0">
      <span className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] whitespace-nowrap">{label}</span>
      <span className={`font-mono font-bold whitespace-nowrap ${sub ? "text-[11px]" : "text-xs"} ${color ?? "text-[rgb(var(--text))]"}`}>
        {value}
      </span>
    </div>
  );
}

function KDivider({ invisible }: { invisible?: boolean }) {
  return (
    <div className="self-stretch" style={{ width: 1, minHeight: 28, background: invisible ? "transparent" : "rgb(var(--border))" }} />
  );
}

// ── Chart pop-out modal ────────────────────────────────────────────────────

function ChartModal({ series, onClose }: { series: KeepaPayload["series"]; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[70] w-[min(90vw,960px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
            BSR &amp; Buy Box History
          </p>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--panel))] hover:text-[rgb(var(--text))]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-5">
          <KeepaChart series={series} rangeDays={90} />
        </div>
      </div>
    </>
  );
}

// ── Main KeepaSection ──────────────────────────────────────────────────────

export function KeepaSection({ asin }: { asin: string }) {
  const [data, setData] = useState<KeepaPayload | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "upgrade" | "error">("loading");
  const [chartModal, setChartModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .auth.getSession()
        .then(async ({ data: { session } }) => {
          if (!session || cancelled) return;
          const res = await fetch(`/api/keepa/product?asin=${asin}`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (cancelled) return;
          if (res.status === 403) { setState("upgrade"); return; }
          if (!res.ok) { setState("error"); return; }
          setData(await res.json() as KeepaPayload);
          setState("ready");
        })
        .catch(() => { if (!cancelled) setState("error"); });
    });
    return () => { cancelled = true; };
  }, [asin]);

  const fmt    = (n: number | null) => n == null ? "—" : n.toLocaleString("en-GB");
  const fmtGbp = (n: number | null) => n == null ? "—" : `£${n.toFixed(2)}`;
  const vcfg   = data?.volatility ? VOLATILITY_CFG[data.volatility] : null;
  const hasSeries = !!(data?.series && (data.series.bsr.length > 0 || data.series.bb.length > 0));

  return (
    <div className="border-b border-[rgb(var(--border))] px-5 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
          Market Data{" "}
          <span className="ml-1 rounded-sm bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-400">PRO</span>
        </p>
        {state === "ready" && hasSeries && (
          <button
            onClick={() => setChartModal(true)}
            className="flex items-center gap-1.5 rounded border border-[rgb(var(--border))] px-2 py-0.5 text-[10px] font-medium text-[rgb(var(--muted))] transition hover:border-indigo-500/50 hover:text-indigo-400"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            Pop out chart
          </button>
        )}
      </div>

      {/* Loading */}
      {state === "loading" && (
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 flex-1 animate-pulse rounded-lg bg-[rgb(var(--panel))]" />
          ))}
        </div>
      )}

      {/* Upgrade gate */}
      {state === "upgrade" && (
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-center">
          <p className="text-xs font-semibold text-indigo-400">Pro plan required</p>
          <p className="mt-0.5 text-[11px] text-[rgb(var(--muted))]">Sales data and price history are available on the Pro plan.</p>
          <a href="/billing" className="mt-2 inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-500">
            Upgrade to Pro →
          </a>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <p className="text-xs text-[rgb(var(--muted))]">Could not load market data — try again later.</p>
      )}

      {/* Data */}
      {state === "ready" && data && (
        <>
          {/* Row 1 */}
          <div className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 mb-2">
            <KStat label="Sales / Mo" value={data.monthlySold != null ? `~${fmt(data.monthlySold)}` : "—"} color="text-indigo-400" />
            <KDivider />
            <KStat label="BSR Now"  value={fmt(data.salesRankCurrent)} />
            <KStat label="30d Avg"  value={fmt(data.salesRank30Avg)}  sub />
            <KStat label="90d Avg"  value={fmt(data.salesRank90Avg)}  sub />
            <KStat label="180d Avg" value={fmt(data.salesRank180Avg)} sub />
            <KStat label="365d Avg" value={fmt(data.salesRank365Avg)} sub />
          </div>

          {/* Row 2 */}
          <div className="flex items-center gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-3 py-2 mb-3">
            <KDivider invisible />
            <KStat label="BB Low"    value={fmtGbp(data.buyBoxLow)}   color="text-emerald-400" sub />
            <KStat label="BB High"   value={fmtGbp(data.buyBoxHigh)}  color="text-rose-400"    sub />
            <KDivider />
            <KStat label="BSR Best"  value={fmt(data.bsrBest)}        color="text-emerald-400" sub />
            <KStat label="BSR Worst" value={fmt(data.bsrWorst)}       color="text-rose-400"    sub />
            <KDivider />
            {vcfg ? (
              <div className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${vcfg.bg} ${vcfg.color}`}>
                <span>{vcfg.icon}</span><span>{vcfg.text}</span>
              </div>
            ) : (
              <span className="text-[9px] text-[rgb(var(--muted))]">—</span>
            )}
          </div>

          {/* Inline chart */}
          {hasSeries && (
            <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-3">
              <KeepaChart series={data.series} rangeDays={90} />
            </div>
          )}
        </>
      )}

      {/* Pop-out modal */}
      {chartModal && data?.series && (
        <ChartModal series={data.series} onClose={() => setChartModal(false)} />
      )}
    </div>
  );
}
