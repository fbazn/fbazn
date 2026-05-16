import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { ATTRIBUTION_DAYS, HOLD_DAYS } from "@/lib/affiliate";

function getRedirectTarget(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next");
  if (next) {
    return { pathname: next, search: "" };
  }

  const plan = request.nextUrl.searchParams.get("plan");
  const checkout = request.nextUrl.searchParams.get("checkout");

  if ((plan === "starter" || plan === "pro") && checkout === "1") {
    return {
      pathname: "/billing",
      search: `?${new URLSearchParams({ plan, checkout: "1" }).toString()}`,
    };
  }

  return { pathname: "/", search: "" };
}

async function attributeReferral(userId: string, request: NextRequest) {
  const refCode = request.cookies.get("fbazn_ref")?.value;
  const refAt = request.cookies.get("fbazn_ref_at")?.value;

  if (!refCode || !refAt) return;

  // Check attribution window
  const clickedAt = new Date(refAt);
  const windowMs = ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000;
  if (Date.now() - clickedAt.getTime() > windowMs) return;

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Look up the affiliate
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("id")
    .eq("code", refCode.toUpperCase())
    .eq("status", "active")
    .single();

  if (!affiliate) return;

  // Avoid self-referral: check if this user is the affiliate
  const { data: selfCheck } = await supabase
    .from("affiliates")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (selfCheck) return;

  // Avoid duplicate referral
  const { data: existing } = await supabase
    .from("affiliate_referrals")
    .select("id")
    .eq("referred_user_id", userId)
    .single();

  if (existing) return;

  await supabase.from("affiliate_referrals").insert({
    affiliate_id: affiliate.id,
    referred_user_id: userId,
    status: "pending",
    clicked_at: clickedAt.toISOString(),
    signed_up_at: new Date().toISOString(),
  });
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirectTo = request.nextUrl.clone();
  const target = getRedirectTarget(request);
  redirectTo.pathname = target.pathname;
  redirectTo.search = target.search;

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    if (data.user) {
      await attributeReferral(data.user.id, request);
    }
  }

  const response = NextResponse.redirect(redirectTo);

  // Clear referral cookies after attribution
  response.cookies.set("fbazn_ref", "", { maxAge: 0, domain: ".fbazn.com", path: "/" });
  response.cookies.set("fbazn_ref_at", "", { maxAge: 0, domain: ".fbazn.com", path: "/" });

  return response;
}
