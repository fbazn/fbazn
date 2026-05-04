import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const KEEPA_DOMAIN = 2; // Amazon UK

// Keepa CSV data-type indices
const IDX_SALES_RANK = 3;
const IDX_BUY_BOX   = 18; // index 18 = New FBA / Buy Box (pence)

// Volatility thresholds
const VOLATILITY_HIGH   = 0.40; // 40%+ swing
const VOLATILITY_MEDIUM = 0.20; // 20%+ swing

let supabaseAdmin: SupabaseClient | null = null;
function getSupabase() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return supabaseAdmin;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const asin = request.nextUrl.searchParams.get("asin")?.toUpperCase();
  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ error: "Invalid ASIN" }, { status: 400, headers: CORS });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401, headers: CORS });
  }

  const supabase = getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser(auth.slice(7));
  if (authError || !user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401, headers: CORS });
  }

  // ── Plan gate — Pro or Business only ─────────────────────────────────────
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasAccess =
    sub &&
    (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") &&
    (sub.plan === "pro" || sub.plan === "business");

  if (!hasAccess) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403, headers: CORS });
  }

  // ── Cache check ───────────────────────────────────────────────────────────
  const { data: cached } = await supabase
    .from("keepa_cache")
    .select("data, fetched_at")
    .eq("asin", asin)
    .maybeSingle();

  if (cached) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, { headers: CORS });
    }
  }

  // ── Keepa API call ────────────────────────────────────────────────────────
  const keepaKey = process.env.KEEPA_API_KEY;
  if (!keepaKey) {
    return NextResponse.json({ error: "Keepa not configured" }, { status: 500, headers: CORS });
  }

  const keepaUrl = new URL("https://api.keepa.com/product");
  keepaUrl.searchParams.set("key", keepaKey);
  keepaUrl.searchParams.set("domain", String(KEEPA_DOMAIN));
  keepaUrl.searchParams.set("asin", asin);
  keepaUrl.searchParams.set("stats", "365"); // get 30/90/180/365-day averages + min/max
  keepaUrl.searchParams.set("history", "1");

  const keepaRes = await fetch(keepaUrl.toString());
  if (!keepaRes.ok) {
    return NextResponse.json({ error: "Keepa request failed" }, { status: 502, headers: CORS });
  }

  const keepaJson = await keepaRes.json() as KeepaResponse;
  const product = keepaJson.products?.[0];

  if (!product) {
    return NextResponse.json({ error: "Product not found in Keepa" }, { status: 404, headers: CORS });
  }

  // ── Parse response ────────────────────────────────────────────────────────
  const stats = product.stats;

  const monthlySold: number | null =
    typeof product.monthlySold === "number" && product.monthlySold >= 0
      ? product.monthlySold
      : null;

  // ── Sales rank ───────────────────────────────────────────────────────────
  const salesRankCurrent  = stats?.current?.[IDX_SALES_RANK]  ?? null;
  const salesRank30Avg    = stats?.avg30?.[IDX_SALES_RANK]    ?? null;
  const salesRank90Avg    = stats?.avg90?.[IDX_SALES_RANK]    ?? null;
  const salesRank180Avg   = stats?.avg180?.[IDX_SALES_RANK]   ?? null;
  const salesRank365Avg   = stats?.avg365?.[IDX_SALES_RANK]   ?? null;
  // Keepa stats.min / stats.max entries are [keepaTime, value] pairs.
  // The actual value is always at index [1].
  const mmVal = (
    arr: ([(number | null), (number | null)] | null)[] | undefined,
    idx: number,
  ): number | null => {
    const entry = arr?.[idx];
    if (!Array.isArray(entry)) return null;
    const v = entry[1];
    return typeof v === "number" && v > 0 ? v : null;
  };

  // min = best rank (lowest number), max = worst rank (highest number)
  const bsrBest  = mmVal(stats?.min, IDX_SALES_RANK);
  const bsrWorst = mmVal(stats?.max, IDX_SALES_RANK);

  // ── Buy box (pence → pounds) ──────────────────────────────────────────────
  const pence = (v: number | null | undefined): number | null =>
    typeof v === "number" && v > 0 ? v / 100 : null;

  const buyBoxCurrent = pence(stats?.current?.[IDX_BUY_BOX]);
  const buyBox30Avg   = pence(stats?.avg30?.[IDX_BUY_BOX]);
  const buyBox90Avg   = pence(stats?.avg90?.[IDX_BUY_BOX]);
  const buyBoxLow     = pence(mmVal(stats?.min, IDX_BUY_BOX));
  const buyBoxHigh    = pence(mmVal(stats?.max, IDX_BUY_BOX));

  // ── Volatility ────────────────────────────────────────────────────────────
  let volatility: "high" | "medium" | "low" | null = null;
  if (buyBoxLow != null && buyBoxHigh != null && buyBoxLow > 0) {
    const swing = (buyBoxHigh - buyBoxLow) / buyBoxLow;
    if (swing >= VOLATILITY_HIGH)        volatility = "high";
    else if (swing >= VOLATILITY_MEDIUM) volatility = "medium";
    else                                 volatility = "low";
  }

  // ── Chart URLs (free — no token cost) ────────────────────────────────────
  const chartBase = `https://graph.keepa.com/pricehistory.png?asin=${asin}&domain=2&salesrank=1&bb=1`;
  const chartUrls = {
    d30:  `${chartBase}&range=30`,
    d90:  `${chartBase}&range=90`,
    d180: `${chartBase}&range=180`,
    d365: `${chartBase}&range=365`,
  };

  const payload: KeepaPayload = {
    asin,
    monthlySold,
    // BSR
    salesRankCurrent,
    salesRank30Avg,
    salesRank90Avg,
    salesRank180Avg,
    salesRank365Avg,
    bsrBest,
    bsrWorst,
    // Buy box
    buyBoxCurrent,
    buyBox30Avg,
    buyBox90Avg,
    buyBoxLow,
    buyBoxHigh,
    // Signals
    volatility,
    // Charts
    chartUrls,
    // Legacy (keep for backward compat with cached data)
    chartUrl: chartUrls.d90,
  };

  // ── Upsert cache ──────────────────────────────────────────────────────────
  await supabase.from("keepa_cache").upsert({
    asin,
    data: payload,
    fetched_at: new Date().toISOString(),
  });

  return NextResponse.json(payload, { headers: CORS });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface KeepaStats {
  current?:  (number | null)[];
  avg30?:    (number | null)[];
  avg90?:    (number | null)[];
  avg180?:   (number | null)[];
  avg365?:   (number | null)[];
  // Each element is a [keepaTime, value] pair — value is at [1]
  min?:      ([(number | null), (number | null)] | null)[];
  max?:      ([(number | null), (number | null)] | null)[];
}

interface KeepaProduct {
  asin: string;
  monthlySold?: number;
  stats?: KeepaStats;
}

interface KeepaResponse {
  products?: KeepaProduct[];
}

export interface KeepaPayload {
  asin: string;
  monthlySold: number | null;
  // BSR
  salesRankCurrent:  number | null;
  salesRank30Avg:    number | null;
  salesRank90Avg:    number | null;
  salesRank180Avg:   number | null;
  salesRank365Avg:   number | null;
  bsrBest:           number | null;
  bsrWorst:          number | null;
  // Buy box
  buyBoxCurrent:     number | null;
  buyBox30Avg:       number | null;
  buyBox90Avg:       number | null;
  buyBoxLow:         number | null;
  buyBoxHigh:        number | null;
  // Signals
  volatility:        "high" | "medium" | "low" | null;
  // Charts
  chartUrls:         { d30: string; d90: string; d180: string; d365: string };
  chartUrl:          string; // legacy
}
