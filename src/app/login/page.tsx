"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Mail } from "lucide-react";
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

function AuthCard({
  eyebrow = "FBAZN",
  title,
  description,
  centered = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: ReactNode;
  centered?: boolean;
  children: ReactNode;
}) {
  return (
    <main className="auth-shell">
      <div className={`auth-card p-6 pt-10 ${centered ? "text-center" : ""}`}>
        <div className="relative space-y-2">
          <p className="section-label">{eyebrow}</p>
          <h1 className="font-barlow-condensed text-4xl font-black uppercase leading-none tracking-normal text-[rgb(var(--text))]">
            {title}
          </h1>
          <p className="text-sm leading-6 text-[rgb(var(--muted))]">
            {description}
          </p>
        </div>
        <div className="relative mt-6">{children}</div>
      </div>
    </main>
  );
}

function MailMarker() {
  return (
    <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-amber-500/40 bg-amber-500/10 text-amber-300">
      <Mail className="h-5 w-5" />
    </div>
  );
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

  const handleForgot = async (event: FormEvent<HTMLFormElement>) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
      <AuthCard
        title="Check your inbox"
        centered
        description={
          <>
            We sent a confirmation link to{" "}
            <span className="font-medium text-[rgb(var(--text))]">{email}</span>.
            Confirm your account, then we will take you to checkout for your selected trial.
          </>
        }
      >
        <MailMarker />
        <p className="text-xs text-[rgb(var(--muted))]">
          Did not receive it? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="font-semibold text-amber-300 hover:text-amber-200"
          >
            try again
          </button>.
        </p>
      </AuthCard>
    );
  }

  if (resetSent) {
    return (
      <AuthCard
        title="Check your inbox"
        centered
        description={
          <>
            We sent a password reset link to{" "}
            <span className="font-medium text-[rgb(var(--text))]">{email}</span>.
          </>
        }
      >
        <MailMarker />
        <p className="text-xs text-[rgb(var(--muted))]">
          Did not receive it?{" "}
          <button
            onClick={() => {
              setResetSent(false);
              setIsForgot(true);
            }}
            className="font-semibold text-amber-300 hover:text-amber-200"
          >
            Try again
          </button>{" "}
          or{" "}
          <button
            onClick={() => {
              setResetSent(false);
              setIsForgot(false);
            }}
            className="font-semibold text-amber-300 hover:text-amber-200"
          >
            back to sign in
          </button>.
        </p>
      </AuthCard>
    );
  }

  if (isForgot) {
    return (
      <AuthCard
        title="Reset password"
        description="Enter your email and we will send you a reset link."
      >
        <form className="space-y-4" onSubmit={handleForgot}>
          <label className="flex flex-col gap-2 text-sm font-medium text-[rgb(var(--text))]">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="app-input h-11"
              placeholder="you@company.com"
              required
            />
          </label>

          {errorMessage && (
            <div className="border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary h-11 w-full disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-[rgb(var(--muted))]">
          <button
            type="button"
            onClick={() => {
              setIsForgot(false);
              setErrorMessage(null);
            }}
            className="font-semibold text-amber-300 hover:text-amber-200"
          >
            Back to sign in
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={isSignUp ? "Create account" : "Welcome back"}
      description={
        isSignUp
          ? "Create your account, confirm your email, then complete secure Stripe checkout."
          : "Sign in to continue to your sourcing workspace."
      }
    >
      {selectedPlan && (
        <div className="mb-5 border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="field-label text-amber-300">Selected trial plan</p>
          <p className="mt-1 text-sm text-[rgb(var(--text))]">
            {ACTIVE_PLAN_NAMES[selectedPlan]} plan. Card details are entered securely in Stripe Checkout.
          </p>
        </div>
      )}

      {statusMessage && (
        <div className="mb-5 border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {statusMessage}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm font-medium text-[rgb(var(--text))]">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="app-input h-11"
            placeholder="you@company.com"
            required
          />
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="field-label">Password</span>
            {!isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setIsForgot(true);
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                Forgot password?
              </button>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="app-input h-11"
            placeholder="Password"
            required
          />
        </div>

        {errorMessage && (
          <div className="border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary h-11 w-full disabled:cursor-not-allowed disabled:opacity-70"
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
          className="font-semibold text-amber-300 hover:text-amber-200"
        >
          {isSignUp ? "Sign in" : "Create account"}
        </button>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
