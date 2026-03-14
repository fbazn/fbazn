import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PLANS, PLAN_TRIAL_DAYS, type PlanId } from "@/lib/plans";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await request.json() as { planId: PlanId };
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Check for existing Stripe customer
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const customerData = sub?.stripe_customer_id
    ? { customer: sub.stripe_customer_id }
    : { customer_email: user.email };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.fbazn.com";

  const session = await stripe.checkout.sessions.create({
    ...customerData,
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: PLAN_TRIAL_DAYS,
      metadata: { user_id: user.id, plan: plan.id },
    },
    success_url: `${baseUrl}/billing?success=true`,
    cancel_url: `${baseUrl}/billing`,
    metadata: { user_id: user.id, plan: plan.id },
  });

  return NextResponse.json({ url: session.url });
}
