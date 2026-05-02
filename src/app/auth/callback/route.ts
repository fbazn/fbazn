import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getRedirectTarget(request: NextRequest) {
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

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirectTo = request.nextUrl.clone();
  const target = getRedirectTarget(request);
  redirectTo.pathname = target.pathname;
  redirectTo.search = target.search;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(redirectTo);
}
