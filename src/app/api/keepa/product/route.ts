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
const IDX_BUY_BOX = 12;

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
  keepaUrl.searchParams.set("stats", "90");
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

  // stats.current is an 18-element array; prices are in pence (divide by 100)
  const salesRankCurrent: number | null = stats?.current?.[IDX_SALES_RANK] ?? null;
  const buyBoxCurrent: number | null =
    stats?.current?.[IDX_BUY_BOX] != null && stats.current[IDX_BUY_BOX] > 0
      ? stats.current[IDX_BUY_BOX] / 100
      : null;

  // 30-day and 90-day averages (avg30 / avg90 arrays mirror current indices)
  const salesRank30Avg: number | null = stats?.avg30?.[IDX_SALES_RANK] ?? null;
  const salesRank90Avg: number | null = stats?.avg90?.[IDX_SALES_RANK] ?? null;
  const buyBox30Avg: number | null =
    stats?.avg30?.[IDX_BUY_BOX] != null && stats.avg30[IDX_BUY_BOX] > 0
      ? stats.avg30[IDX_BUY_BOX] / 100
      : null;

  const payload: KeepaPayload = {
    asin,
    monthlySold,
    salesRankCurrent,
    salesRank30Avg,
    salesRank90Avg,
    buyBoxCurrent,
    buyBox30Avg,
    chartUrl: `https://graph.keepa.com/pricehistory.png?asin=${asin}&country=gb&range=90`,
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
  current?: (number | null)[];
  avg30?: (number | null)[];
  avg90?: (number | null)[];
  avg180?: (number | null)[];
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
  salesRankCurrent: number | null;
  salesRank30Avg: number | null;
  salesRank90Avg: number | null;
  buyBoxCurrent: number | null;
  buyBox30Avg: number | null;
  chartUrl: string;
}
