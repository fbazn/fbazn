"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLANS, type PlanId } from "@/lib/plans";
import { Badge } from "@/components/app/Badge";

interface Subscription {
  plan: PlanId;
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
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

export default function BillingPage() {
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

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

  const handleCheckout = async (planId: PlanId) => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setLoading(false);
  };

  // Opens Stripe Customer Portal — handles both "manage billing" and "undo cancel"
  const handlePortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const { url } = await res.json();
    if (url) window.location.href = url;
    setPortalLoading(false);
  };

  const currentPlan = sub ? PLANS.find((p) => p.id === sub.plan) : null;
  const isTrialing = sub?.status === "trialing";
  const isActive = sub?.status === "active";
  const isCanceling = isActive && sub?.cancel_at_period_end;
  const trialDaysLeft = isTrialing && sub?.trial_ends_at ? daysUntil(sub.trial_ends_at) : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Billing</h2>
        <p className="text-sm text-[rgb(var(--muted))]">
          Manage your subscription, plan, and payment details.
        </p>
      </div>

      {/* Current plan status */}
      {sub === undefined ? (
        <div className="text-sm text-[rgb(var(--muted))]">Loading…</div>
      ) : sub && currentPlan ? (
        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[rgb(var(--text))]">
                  {currentPlan.name} Plan
                </h3>
                {isTrialing && <Badge label="Trial" variant="warning" />}
                {isActive && !isCanceling && <Badge label="Active" variant="success" />}
                {isCanceling && <Badge label="Canceling" variant="warning" />}
                {sub.status === "past_due" && <Badge label="Past due" variant="danger" />}
                {sub.status === "canceled" && <Badge label="Canceled" variant="default" />}
              </div>
              <p className="mt-1 text-sm text-[rgb(var(--muted))]">
                £{currentPlan.price}/month
              </p>
              {isTrialing && trialDaysLeft !== null && (
                <p className="mt-2 text-sm font-medium text-amber-400">
                  {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in your free trial
                  {sub.trial_ends_at && ` · ends ${fmt(sub.trial_ends_at)}`}
                </p>
              )}
              {isActive && sub.current_period_end && !isCanceling && (
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                  Renews on {fmt(sub.current_period_end)}
                </p>
              )}
              {isCanceling && sub.current_period_end && (
                <p className="mt-2 text-sm text-amber-400">
                  Access ends on {fmt(sub.current_period_end)} · You won&apos;t be charged again
                </p>
              )}
              {sub.status === "past_due" && (
                <p className="mt-2 text-sm text-rose-400">
                  Your last payment failed. Update your payment method to keep access.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Undo cancel */}
              {isCanceling && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-60"
                >
                  {portalLoading ? "Opening…" : "Reactivate subscription"}
                </button>
              )}
              {/* Update payment for past_due */}
              {sub.status === "past_due" && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-60"
                >
                  {portalLoading ? "Opening…" : "Update payment method"}
                </button>
              )}
              {/* Standard manage billing */}
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="rounded-xl border border-[rgb(var(--border-subtle,var(--border)))] px-4 py-2 text-sm font-medium text-[rgb(var(--text))] transition hover:bg-[rgb(var(--bg))] disabled:opacity-60"
              >
                {portalLoading ? "Opening…" : "Manage billing"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          No active subscription. Start your 7-day free trial below.
        </div>
      )}

      {/* Plan cards */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
          {sub ? "Change plan" : "Choose a plan"}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = sub?.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border p-6 transition ${
                  isCurrent
                    ? "border-blue-500/40 bg-blue-500/10"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--card))]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[rgb(var(--text))]">{plan.name}</h4>
                  {isCurrent && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-2xl font-bold text-[rgb(var(--text))]">
                  £{plan.price}
                  <span className="text-sm font-normal text-[rgb(var(--muted))]">/mo</span>
                </p>
                <p className="mt-2 text-sm text-[rgb(var(--muted))]">{plan.description}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[rgb(var(--text))]">
                      <span className="mt-0.5 text-blue-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading || isCurrent}
                  className={`mt-6 h-10 rounded-xl text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isCurrent
                      ? "border border-blue-500/40 text-blue-400"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {isCurrent
                    ? "Current plan"
                    : sub
                      ? `Switch to ${plan.name}`
                      : "Start free trial"}
                </button>
              </div>
            );
          })}
        </div>
        {!sub && (
          <p className="mt-3 text-center text-xs text-[rgb(var(--muted))]">
            7-day free trial on all plans · No card required during trial
          </p>
        )}
      </div>
    </div>
  );
}
