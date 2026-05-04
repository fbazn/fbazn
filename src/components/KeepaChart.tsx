"use client";

import React, { useMemo, useRef, useState } from "react";

export interface KeepaSeriesPoint {
  t: number; // unix ms
  v: number; // raw value (BSR rank OR price in pence)
}

export interface KeepaChartSeries {
  bsr: KeepaSeriesPoint[];
  bb:  KeepaSeriesPoint[];
}

interface Props {
  series: KeepaChartSeries;
  rangeDays?: 30 | 90 | 180 | 365;
  onRangeChange?: (days: 30 | 90 | 180 | 365) => void;
}

const RANGE_OPTIONS = [30, 90, 180, 365] as const;
const W = 900;
const H = 180;
const PAD = { top: 14, right: 16, bottom: 28, left: 62 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

const BSR_COLOR = "#818cf8"; // indigo-400
const BB_COLOR  = "#4ade80"; // green-400

function filterByDays(pts: KeepaSeriesPoint[], days: number): KeepaSeriesPoint[] {
  const cutoff = Date.now() - days * 86_400_000;
  return pts.filter((p) => p.t >= cutoff);
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "2-digit",
  });
}

function fmtBsr(v: number): string {
  return "#" + v.toLocaleString("en-GB");
}

function fmtBbp(pence: number): string {
  return "£" + (pence / 100).toFixed(2);
}

function buildPath(
  pts: { x: number; y: number }[],
): string {
  if (pts.length === 0) return "";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
}

function buildArea(
  pts: { x: number; y: number }[],
  bottom: number,
): string {
  if (pts.length === 0) return "";
  const line = buildPath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${line} L${last.x.toFixed(1)},${bottom} L${first.x.toFixed(1)},${bottom} Z`;
}

export function KeepaChart({ series, rangeDays = 90, onRangeChange }: Props) {
  const [range, setRange] = useState<30 | 90 | 180 | 365>(rangeDays);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const bsrPts = useMemo(() => filterByDays(series.bsr, range), [series.bsr, range]);
  const bbPts  = useMemo(() => filterByDays(series.bb,  range), [series.bb,  range]);

  // Unified time axis from both series
  const allTs = useMemo(() => {
    const set = new Set([...bsrPts.map((p) => p.t), ...bbPts.map((p) => p.t)]);
    return Array.from(set).sort((a, b) => a - b);
  }, [bsrPts, bbPts]);

  const tMin = allTs[0] ?? Date.now() - range * 86_400_000;
  const tMax = allTs[allTs.length - 1] ?? Date.now();

  // X scale
  const xScale = (t: number) =>
    PAD.left + ((t - tMin) / Math.max(tMax - tMin, 1)) * INNER_W;

  // BSR y-scale (inverted: lower rank = higher on chart)
  const bsrMin = bsrPts.length ? Math.min(...bsrPts.map((p) => p.v)) : 0;
  const bsrMax = bsrPts.length ? Math.max(...bsrPts.map((p) => p.v)) : 1;
  const bsrPad = (bsrMax - bsrMin) * 0.1 || 1;
  const yBsr = (v: number) =>
    PAD.top + INNER_H - ((v - bsrMin + bsrPad) / (bsrMax - bsrMin + 2 * bsrPad)) * INNER_H;

  // BB y-scale (right axis, pence)
  const bbMin  = bbPts.length ? Math.min(...bbPts.map((p) => p.v)) : 0;
  const bbMax  = bbPts.length ? Math.max(...bbPts.map((p) => p.v)) : 1;
  const bbPadV = (bbMax - bbMin) * 0.1 || 1;
  const yBb = (v: number) =>
    PAD.top + INNER_H - ((v - bbMin + bbPadV) / (bbMax - bbMin + 2 * bbPadV)) * INNER_H;

  const bsrXY = useMemo(
    () => bsrPts.map((p) => ({ x: xScale(p.t), y: yBsr(p.v), t: p.t, v: p.v })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bsrPts, tMin, tMax, bsrMin, bsrMax],
  );
  const bbXY = useMemo(
    () => bbPts.map((p) => ({ x: xScale(p.t), y: yBb(p.v), t: p.t, v: p.v })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bbPts, tMin, tMax, bbMin, bbMax],
  );

  const chartBottom = PAD.top + INNER_H;

  // Hover: find nearest BSR point by x distance
  const hoverData = useMemo(() => {
    if (hoverX === null || bsrXY.length === 0) return null;
    let closest = bsrXY[0];
    let minDist = Math.abs(bsrXY[0].x - hoverX);
    for (const pt of bsrXY) {
      const d = Math.abs(pt.x - hoverX);
      if (d < minDist) { minDist = d; closest = pt; }
    }
    // Nearest BB point at same time
    let bbV: number | null = null;
    if (bbXY.length > 0) {
      let closestBb = bbXY[0];
      let minBb = Math.abs(bbXY[0].t - closest.t);
      for (const p of bbXY) {
        const d = Math.abs(p.t - closest.t);
        if (d < minBb) { minBb = d; closestBb = p; }
      }
      if (minBb < 3 * 24 * 60 * 60 * 1000) bbV = closestBb.v;
    }
    return { x: closest.x, t: closest.t, bsrV: closest.v, bbV };
  }, [hoverX, bsrXY, bbXY]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = ((e.clientX - rect.left) / rect.width) * W;
    setHoverX(rawX);
  };

  // Y-axis BSR ticks (left)
  const bsrTicks = useMemo(() => {
    if (bsrPts.length === 0) return [];
    const count = 4;
    return Array.from({ length: count }, (_, i) => {
      const v = bsrMin + ((bsrMax - bsrMin) / (count - 1)) * i;
      return { y: yBsr(v), label: v < 1000 ? String(Math.round(v)) : `${(v / 1000).toFixed(0)}k` };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bsrMin, bsrMax, bsrPts]);

  // X-axis date ticks
  const xTicks = useMemo(() => {
    if (allTs.length === 0) return [];
    const count = 5;
    return Array.from({ length: count }, (_, i) => {
      const t = tMin + ((tMax - tMin) / (count - 1)) * i;
      return { x: xScale(t), label: fmtDate(t) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTs, tMin, tMax]);

  const handleRangeClick = (d: 30 | 90 | 180 | 365) => {
    setRange(d);
    onRangeChange?.(d);
  };

  const isEmpty = bsrXY.length === 0 && bbXY.length === 0;

  return (
    <div style={{ width: "100%", fontFamily: "inherit" }}>
      {/* Range switcher */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "8px", justifyContent: "flex-end" }}>
        {RANGE_OPTIONS.map((d) => (
          <button
            key={d}
            onClick={() => handleRangeClick(d)}
            style={{
              padding: "2px 10px",
              borderRadius: "4px",
              border: "1px solid",
              borderColor: range === d ? "#818cf8" : "#374151",
              background: range === d ? "rgba(129,140,248,0.15)" : "transparent",
              color: range === d ? "#818cf8" : "#6b7280",
              fontSize: "11px",
              fontWeight: range === d ? 600 : 400,
              cursor: "pointer",
              lineHeight: "1.4",
            }}
          >
            {d}D
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ position: "relative", width: "100%" }}>
        {isEmpty ? (
          <div
            style={{
              height: `${H}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            No chart data available for this range
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: "block", overflow: "visible" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverX(null)}
          >
            <defs>
              <linearGradient id="bsrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BSR_COLOR} stopOpacity="0.25" />
                <stop offset="100%" stopColor={BSR_COLOR} stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="bbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BB_COLOR} stopOpacity="0.20" />
                <stop offset="100%" stopColor={BB_COLOR} stopOpacity="0.02" />
              </linearGradient>
              <clipPath id="chartClip">
                <rect x={PAD.left} y={PAD.top} width={INNER_W} height={INNER_H} />
              </clipPath>
            </defs>

            {/* Grid lines */}
            {bsrTicks.map((tk, i) => (
              <line
                key={i}
                x1={PAD.left}
                y1={tk.y}
                x2={PAD.left + INNER_W}
                y2={tk.y}
                stroke="#1f2937"
                strokeWidth="1"
              />
            ))}

            {/* BSR area + line */}
            {bsrXY.length > 1 && (
              <g clipPath="url(#chartClip)">
                <path
                  d={buildArea(bsrXY, chartBottom)}
                  fill="url(#bsrGrad)"
                />
                <path
                  d={buildPath(bsrXY)}
                  fill="none"
                  stroke={BSR_COLOR}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* BB area + line */}
            {bbXY.length > 1 && (
              <g clipPath="url(#chartClip)">
                <path
                  d={buildArea(bbXY, chartBottom)}
                  fill="url(#bbGrad)"
                />
                <path
                  d={buildPath(bbXY)}
                  fill="none"
                  stroke={BB_COLOR}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* X-axis ticks */}
            {xTicks.map((tk, i) => (
              <text
                key={i}
                x={tk.x}
                y={H - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#4b5563"
              >
                {tk.label}
              </text>
            ))}

            {/* Y-axis BSR ticks (left) */}
            {bsrTicks.map((tk, i) => (
              <text
                key={i}
                x={PAD.left - 6}
                y={tk.y + 3}
                textAnchor="end"
                fontSize="9"
                fill={BSR_COLOR}
                opacity="0.7"
              >
                {tk.label}
              </text>
            ))}

            {/* Hover crosshair */}
            {hoverData && (
              <>
                <line
                  x1={hoverData.x}
                  y1={PAD.top}
                  x2={hoverData.x}
                  y2={chartBottom}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Tooltip box */}
                {(() => {
                  const tx = hoverData.x > W * 0.65 ? hoverData.x - 130 : hoverData.x + 10;
                  const ty = PAD.top + 6;
                  const lineH = 14;
                  const lines = [
                    fmtDate(hoverData.t),
                    `BSR: ${fmtBsr(hoverData.bsrV)}`,
                    ...(hoverData.bbV != null ? [`BB: ${fmtBbp(hoverData.bbV)}`] : []),
                  ];
                  return (
                    <g>
                      <rect
                        x={tx - 4}
                        y={ty - 2}
                        width={120}
                        height={lines.length * lineH + 6}
                        rx="4"
                        fill="#111827"
                        stroke="#374151"
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      {lines.map((ln, li) => (
                        <text
                          key={li}
                          x={tx + 4}
                          y={ty + li * lineH + 10}
                          fontSize="10"
                          fill={li === 0 ? "#9ca3af" : li === 1 ? BSR_COLOR : BB_COLOR}
                        >
                          {ln}
                        </text>
                      ))}
                    </g>
                  );
                })()}
              </>
            )}

            {/* Legend */}
            <g transform={`translate(${PAD.left + 4}, ${PAD.top + 6})`}>
              <rect width="8" height="2" y="3" fill={BSR_COLOR} rx="1" />
              <text x="12" y="8" fontSize="9" fill={BSR_COLOR} opacity="0.9">BSR</text>
              <rect x="34" width="8" height="2" y="3" fill={BB_COLOR} rx="1" />
              <text x="46" y="8" fontSize="9" fill={BB_COLOR} opacity="0.9">Buy Box</text>
            </g>
          </svg>
        )}
      </div>
    </div>
  );
}
