import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  // Verify bearer token from the Chrome extension
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const token = auth.slice(7);

  // Validate the token against Supabase
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Check the user has an active subscription
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasAccess =
    sub &&
    (sub.status === "active" ||
      sub.status === "trialing" ||
      sub.status === "past_due");

  if (!hasAccess) {
    return NextResponse.json({ error: "No active subscription" }, { status: 403 });
  }

  const body = await request.json();
  const {
    asin,
    title,
    category,
    size_tier,
    buy_box_price,
    cost_price,
    referral_fee,
    fba_fee,
    net_profit,
    roi,
    margin,
  } = body;

  if (!asin) {
    return NextResponse.json({ error: "ASIN is required" }, { status: 400 });
  }

  const { error: insertError } = await supabaseAdmin.from("review_queue").insert({
    user_id: user.id,
    asin,
    title: title ?? null,
    category: category ?? null,
    size_tier: size_tier ?? null,
    buy_box_price: buy_box_price ?? null,
    cost_price: cost_price ?? null,
    referral_fee: referral_fee ?? null,
    fba_fee: fba_fee ?? null,
    net_profit: net_profit ?? null,
    roi: roi ?? null,
    margin: margin ?? null,
  });

  if (insertError) {
    console.error("[leads] insert error:", insertError);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
