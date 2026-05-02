"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ActivePlanId = "starter" | "pro";

const ACTIVE_PLAN_NAMES: Record<ActivePlanId, string> = {
  starter: "Starter",
  pro: "Pro",
};

function getActivePlan(value: string | null): ActivePlanId | null {
  return value === "starter" || value === "pro" ? value : null;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://app.fbazn.com";
}

function buildBillingPath(plan: ActivePlanId | null) {
  if (!plan) return "/";

  const params = new URLSearchParams({
    plan,
    checkout: "1",
  });

  return `/billing?${params.toString()}`;
}

function buildEmailRedirectUrl(plan: ActivePlanId | null) {
  const url = new URL("/auth/callback", getAppUrl());

  if (plan) {
    url.searchParams.set("plan", plan);
    url.searchParams.set("checkout", "1");
  }

  return url.toString();
}

function buildPasswordResetRedirectUrl() {
  const url = new URL("/auth/callback", getAppUrl());
  url.searchParams.set("next", "/auth/reset");
  return url.toString();
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<ActivePlanId | null>(null);
  const [source, setSource] = useState("direct");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const modeParam = searchParams.get("mode");
    const planParam = getActivePlan(searchParams.get("plan"));
    const sourceParam = searchParams.get("source");
    const authErrorParam = searchParams.get("auth_error");

    if (emailParam) setEmail(emailParam);
    if (modeParam === "signup") setIsSignUp(true);
    if (planParam) setSelectedPlan(planParam);
    if (sourceParam) setSource(sourceParam);
    if (authErrorParam === "email_link_invalid") {
      setErrorMessage("That email link is invalid or has expired. Please request a new one.");
    } else if (searchParams.get("password_updated") === "1") {
      setStatusMessage("Password updated. Sign in with your new password.");
    } else if (searchParams.get("email_changed") === "1") {
      setStatusMessage("Email address updated. Please sign in again.");
    }
  }, [searchParams]);

  const billingPath = useMemo(() => buildBillingPath(selectedPlan), [selectedPlan]);

  const handleForgot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: buildPasswordResetRedirectUrl(),
    });
    if (error) {
      setErrorMessage(error.message);
    } else {
      setResetSent(true);
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const result = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildEmailRedirectUrl(selectedPlan),
            data: {
              selected_plan: selectedPlan,
              signup_source: source,
            },
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setErrorMessage(result.error.message ?? "Unable to authenticate. Please try again.");
      setIsSubmitting(false);
      return;
    }

    if (isSignUp) {
      fetch("https://n8n.fbazn.com/webhook/welcome-drip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email },
          plan: selectedPlan,
          source,
        }),
      }).catch(() => {});

      if (result.data.session) {
        router.replace(billingPath);
        router.refresh();
        return;
      }

      setEmailSent(true);
      setIsSubmitting(false);
      return;
    }

    router.replace(billingPath);
    router.refresh();
  };

  if (emailSent) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
            <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text))]">Check your inbox</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            We sent a confirmation link to <span className="font-medium text-[rgb(var(--text))]">{email}</span>.
            <br />
            Confirm your account, then we will take you to checkout for your selected trial.
          </p>
          <p className="mt-6 text-xs text-[rgb(var(--muted))]">
            Did not receive it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setEmailSent(false)}
              className="font-semibold text-indigo-500 hover:text-indigo-400"
            >
              try again
            </button>.
          </p>
        </div>
      </main>
    );
  }

  if (resetSent) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
            <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text))]">Check your inbox</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            We sent a password reset link to <span className="font-medium text-[rgb(var(--text))]">{email}</span>.
          </p>
          <p className="mt-6 text-xs text-[rgb(var(--muted))]">
            Didn&apos;t receive it?{" "}
            <button
              onClick={() => { setResetSent(false); setIsForgot(true); }}
              className="font-semibold text-indigo-500 hover:text-indigo-400"
            >
              Try again
            </button>{" "}or{" "}
            <button
              onClick={() => { setResetSent(false); setIsForgot(false); }}
              className="font-semibold text-indigo-500 hover:text-indigo-400"
            >
              back to sign in
            </button>.
          </p>
        </div>
      </main>
    );
  }

  if (isForgot) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-indigo-500">FBAZN</p>
            <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">Reset your password</h1>
            <p className="text-sm text-[rgb(var(--muted))]">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleForgot}>
            <label className="flex flex-col gap-2 text-sm font-medium text-[rgb(var(--text))]">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@company.com"
                required
              />
            </label>

            {errorMessage && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-indigo-500 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-[rgb(var(--muted))]">
            <button
              type="button"
              onClick={() => { setIsForgot(false); setErrorMessage(null); }}
              className="font-semibold text-indigo-500 hover:text-indigo-400"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-indigo-500">FBAZN</p>
          <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-[rgb(var(--muted))]">
            {isSignUp
              ? "Create your account, confirm your email, then complete secure Stripe checkout."
              : "Sign in to continue to your sourcing workspace."}
          </p>
        </div>

        {selectedPlan && (
          <div className="mt-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
              Selected trial plan
            </p>
            <p className="mt-1 text-sm text-[rgb(var(--text))]">
              {ACTIVE_PLAN_NAMES[selectedPlan]} plan. Card details are entered securely in Stripe Checkout.
            </p>
          </div>
        )}

        {statusMessage && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {statusMessage}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-[rgb(var(--text))]">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@company.com"
              required
            />
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[rgb(var(--text))]">Password</span>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => { setIsForgot(true); setErrorMessage(null); }}
                  className="text-xs text-indigo-500 hover:text-indigo-400"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              required
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-indigo-500 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting
              ? "Working..."
              : isSignUp
                ? "Create account and continue"
                : "Sign in"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[rgb(var(--muted))]">
          {isSignUp ? "Already have an account?" : "New to FBAZN?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp((value) => !value)}
            className="font-semibold text-indigo-500 hover:text-indigo-400"
          >
            {isSignUp ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
