import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function getOtpType(value: string | null): EmailOtpType | null {
  return OTP_TYPES.includes(value as EmailOtpType) ? (value as EmailOtpType) : null;
}

function getAppOrigin() {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://app.fbazn.com").origin;
  } catch {
    return "https://app.fbazn.com";
  }
}

function buildLocalRedirect(request: NextRequest, pathname: string, params?: Record<string, string>) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = params ? `?${new URLSearchParams(params).toString()}` : "";
  url.hash = "";
  return url;
}

function getFallbackRedirect(request: NextRequest, type: EmailOtpType) {
  const plan = request.nextUrl.searchParams.get("plan");
  const checkout = request.nextUrl.searchParams.get("checkout");

  if ((type === "email" || type === "signup") && (plan === "starter" || plan === "pro") && checkout === "1") {
    return buildLocalRedirect(request, "/billing", { plan, checkout: "1" });
  }

  if (type === "recovery" || type === "invite") {
    return buildLocalRedirect(request, "/auth/reset", type === "invite" ? { invite: "1" } : undefined);
  }

  if (type === "email_change") {
    return buildLocalRedirect(request, "/settings", { email_changed: "1" });
  }

  return buildLocalRedirect(request, "/");
}

function getSafeRedirect(request: NextRequest, type: EmailOtpType) {
  const redirectTo = request.nextUrl.searchParams.get("redirect_to");

  if (!redirectTo) {
    return getFallbackRedirect(request, type);
  }

  try {
    const url = redirectTo.startsWith("/")
      ? new URL(redirectTo, request.nextUrl.origin)
      : new URL(redirectTo);
    const allowedOrigins = new Set([request.nextUrl.origin, getAppOrigin()]);

    if (allowedOrigins.has(url.origin)) {
      return url;
    }
  } catch {
    // Fall back below.
  }

  return getFallbackRedirect(request, type);
}

function getErrorRedirect(request: NextRequest, type: EmailOtpType | null) {
  const params = {
    auth_error: "email_link_invalid",
  };

  if (type === "recovery" || type === "invite") {
    return buildLocalRedirect(request, "/auth/reset", params);
  }

  return buildLocalRedirect(request, "/login", params);
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = getOtpType(request.nextUrl.searchParams.get("type"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(getErrorRedirect(request, type));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(getErrorRedirect(request, type));
  }

  return NextResponse.redirect(getSafeRedirect(request, type));
}
