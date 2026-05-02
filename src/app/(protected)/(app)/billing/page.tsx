"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/app/Badge";
import { createClient } from "@/lib/supabase/client";
import { PLANS, type PlanId } from "@/lib/plans";

interface Subscription {
  plan: PlanId;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

function getActiveCheckoutPlan(value: string | null): Exclude<PlanId, "business"> | null {
  return value === "starter" || value === "pro" ? value : null;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function fmt(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatusMessage({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "info";
  children: ReactNode;
}) {
  const styles = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    danger: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    info: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  }[tone];

  return (
    <div className={`border p-4 text-sm ${styles}`}>
      {children}
    </div>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const autoCheckoutStarted = useRef(false);

  const selectedCheckoutPlan = useMemo(
    () => getActiveCheckoutPlan(searchParams.get("plan")),
    [searchParams],
  );
  const shouldAutoCheckout = searchParams.get("checkout") === "1";
  const checkoutCanceled = searchParams.get("checkout") === "canceled";
  const checkoutSuccess = searchParams.get("success") === "true";

  const handleCheckout = useCallback(async (planId: PlanId) => {
    setLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!res.ok || !payload.url) {
        throw new Error(payload.error ?? "Unable to start checkout. Please try again.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to start checkout.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status, trial_ends_at, current_period_end, cancel_at_period_end")
        .eq("user_id", user.id)
        .maybeSingle();
      setSub(data as Subscription | null);
    });
  }, []);

  useEffect(() => {
    if (!shouldAutoCheckout || autoCheckoutStarted.current || sub === undefined || sub) {
      return;
    }

    if (!selectedCheckoutPlan) {
      setCheckoutError("Choose Starter or Pro to start checkout.");
      return;
    }

    autoCheckoutStarted.current = true;
    void handleCheckout(selectedCheckoutPlan);
  }, [handleCheckout, selectedCheckoutPlan, shouldAutoCheckout, sub]);

  const handlePortal = async () => {
    setPortalLoading(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!res.ok || !payload.url) {
        throw new Error(payload.error ?? "Unable to open billing portal.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Unable to open billing portal.");
      setPortalLoading(false);
    }
  };

  const currentPlan = sub ? PLANS.find((p) => p.id === sub.plan) : null;
  const isTrialing = sub?.status === "trialing";
  const isActive = sub?.status === "active";
  const isCanceling = isActive && sub?.cancel_at_period_end;
  const trialDaysLeft = isTrialing && sub?.trial_ends_at ? daysUntil(sub.trial_ends_at) : null;

  return (
    <div className="space-y-8">
      <section className="industrial-panel overflow-hidden p-6">
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-label">Subscription bay</p>
            <h2 className="font-barlow-condensed text-5xl font-black uppercase leading-none tracking-normal text-[rgb(var(--text))]">
              Billing
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[rgb(var(--muted))]">
              Manage your plan, trial, and payment details from the same operational console.
            </p>
          </div>
          <Badge
            label={sub && currentPlan ? `${currentPlan.name} / ${sub.status}` : "No active plan"}
            variant={sub ? "success" : "warning"}
          />
        </div>
      </section>

      {checkoutSuccess && (
        <StatusMessage tone="success">
          Checkout complete. If your plan is still updating, refresh in a few seconds while Stripe confirms the subscription.
        </StatusMessage>
      )}

      {checkoutCanceled && (
        <StatusMessage tone="warning">
          Checkout was canceled. Your account is ready, but app access starts after you complete a trial checkout.
        </StatusMessage>
      )}

      {checkoutError && (
        <StatusMessage tone="danger">{checkoutError}</StatusMessage>
      )}

      {shouldAutoCheckout && sub === null && selectedCheckoutPlan && loading && (
        <StatusMessage tone="info">
          Opening secure Stripe Checkout for the {selectedCheckoutPlan} trial...
        </StatusMessage>
      )}

      {sub === undefined ? (
        <div className="text-sm text-[rgb(var(--muted))]">Loading...</div>
      ) : sub && currentPlan ? (
        <div className="industrial-panel p-6">
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-barlow-condensed text-3xl font-black uppercase tracking-normal text-[rgb(var(--text))]">
                  {currentPlan.name} Plan
                </h3>
                {isTrialing && <Badge label="Trial" variant="warning" />}
                {isActive && !isCanceling && <Badge label="Active" variant="success" />}
                {isCanceling && <Badge label="Canceling" variant="warning" />}
                {sub.status === "past_due" && <Badge label="Past due" variant="danger" />}
                {sub.status === "canceled" && <Badge label="Canceled" variant="default" />}
              </div>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                {"\u00a3"}{currentPlan.price}/month
              </p>
              {isTrialing && trialDaysLeft !== null && (
                <p className="mt-3 text-sm font-medium text-amber-300">
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in your free trial
                  {sub.trial_ends_at && ` - ends ${fmt(sub.trial_ends_at)}`}
                </p>
              )}
              {isActive && sub.current_period_end && !isCanceling && (
                <p className="mt-3 text-sm text-[rgb(var(--muted))]">
                  Renews on {fmt(sub.current_period_end)}
                </p>
              )}
              {isCanceling && sub.current_period_end && (
                <p className="mt-3 text-sm text-amber-300">
                  Access ends on {fmt(sub.current_period_end)} - you will not be charged again.
                </p>
              )}
              {sub.status === "past_due" && (
                <p className="mt-3 text-sm text-rose-300">
                  Your last payment failed. Update your payment method to keep access.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {isCanceling && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="btn-secondary"
                >
                  {portalLoading ? "Opening..." : "Reactivate subscription"}
                </button>
              )}
              {sub.status === "past_due" && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="btn-secondary border-rose-500/40 text-rose-300 hover:border-rose-400"
                >
                  {portalLoading ? "Opening..." : "Update payment method"}
                </button>
              )}
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="btn-secondary"
              >
                {portalLoading ? "Opening..." : "Manage billing"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <StatusMessage tone="warning">
          No active subscription. Choose Starter or Pro to start your 7-day trial with secure Stripe checkout.
        </StatusMessage>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">{sub ? "Change plan" : "Choose a plan"}</p>
            <h3 className="font-barlow-condensed text-3xl font-black uppercase tracking-normal text-[rgb(var(--text))]">
              Trial access
            </h3>
          </div>
          {!sub && (
            <p className="max-w-sm text-right text-xs text-[rgb(var(--muted))]">
              7-day free trial on Starter and Pro. Card required in secure Stripe checkout.
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = sub?.plan === plan.id;
            const isComingSoon = plan.comingSoon;
            const isSelectedCheckoutPlan = selectedCheckoutPlan === plan.id;

            return (
              <div
                key={plan.id}
                data-accent={isSelectedCheckoutPlan ? "amber" : "indigo"}
                className={`industrial-card flex flex-col p-6 pl-7 transition ${
                  isComingSoon ? "opacity-50" : ""
                } ${
                  isCurrent
                    ? "border-emerald-500/40"
                    : isSelectedCheckoutPlan
                      ? "border-amber-500/50"
                      : ""
                }`}
              >
                <div className="relative flex items-center justify-between gap-3">
                  <h4 className="font-barlow-condensed text-3xl font-black uppercase tracking-normal text-[rgb(var(--text))]">
                    {plan.name}
                  </h4>
                  {isComingSoon && <Badge label="Coming soon" variant="muted" />}
                  {!isComingSoon && isCurrent && <Badge label="Current" variant="success" />}
                  {!isComingSoon && !isCurrent && isSelectedCheckoutPlan && (
                    <Badge label="Selected" variant="warning" />
                  )}
                </div>

                <p className="metric-value relative mt-4 text-5xl leading-none">
                  {"\u00a3"}{plan.price}
                  <span className="ml-1 font-barlow text-sm font-normal normal-case text-[rgb(var(--muted))]">
                    /mo
                  </span>
                </p>
                <p className="relative mt-3 text-sm text-[rgb(var(--muted))]">
                  {plan.description}
                </p>

                <ul className="relative mt-5 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[rgb(var(--text))]">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 bg-amber-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isComingSoon && handleCheckout(plan.id)}
                  disabled={loading || isCurrent || isComingSoon}
                  className={`relative mt-6 h-10 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isComingSoon || isCurrent ? "btn-secondary" : "btn-primary"
                  }`}
                >
                  {isComingSoon
                    ? "Coming soon"
                    : isCurrent
                      ? "Current plan"
                      : sub
                        ? `Switch to ${plan.name}`
                        : loading
                          ? "Opening checkout..."
                          : "Start free trial"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[rgb(var(--muted))]">Loading billing...</div>}>
      <BillingContent />
    </Suspense>
  );
}
