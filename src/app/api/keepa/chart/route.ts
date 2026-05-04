import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const VALID_RANGES = ["30", "90", "180", "365"] as const;

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
  const asin  = request.nextUrl.searchParams.get("asin")?.toUpperCase();
  const range = request.nextUrl.searchParams.get("range") ?? "90";

  if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ error: "Invalid ASIN" }, { status: 400, headers: CORS });
  }
  const safeRange = (VALID_RANGES as readonly string[]).includes(range)
    ? range
    : "90";

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

  // ── Plan gate ─────────────────────────────────────────────────────────────
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

  // ── Keepa Graph Image API (1 token per call) ──────────────────────────────
  const keepaKey = process.env.KEEPA_API_KEY;
  if (!keepaKey) {
    return NextResponse.json({ error: "Keepa not configured" }, { status: 500, headers: CORS });
  }

  const url = new URL("https://api.keepa.com/graphimage");
  url.searchParams.set("key",       keepaKey);
  url.searchParams.set("domain",    "2");       // Amazon UK
  url.searchParams.set("asin",      asin);
  url.searchParams.set("range",     safeRange);
  // Show only BSR + Buy Box — cleaner chart for FBA sellers
  url.searchParams.set("salesrank", "1");
  url.searchParams.set("bb",        "1");
  url.searchParams.set("amazon",    "0");
  url.searchParams.set("new",       "0");
  url.searchParams.set("used",      "0");
  url.searchParams.set("title",     "0");
  url.searchParams.set("width",     "900");
  url.searchParams.set("height",    "220");
  // Brand colours
  url.searchParams.set("cSales",    "818cf8"); // indigo-400
  url.searchParams.set("cBB",       "4ade80"); // green-400

  const imgRes = await fetch(url.toString());
  if (!imgRes.ok) {
    return NextResponse.json({ error: "Chart fetch failed" }, { status: 502, headers: CORS });
  }

  const imgBuffer = await imgRes.arrayBuffer();

  return new NextResponse(imgBuffer, {
    headers: {
      ...CORS,
      "Content-Type":  "image/png",
      "Cache-Control": "public, max-age=86400", // 24 h browser cache
    },
  });
}
