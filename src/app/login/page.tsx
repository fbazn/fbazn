"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const modeParam = searchParams.get("mode");
    if (emailParam) setEmail(emailParam);
    if (modeParam === "signup") setIsSignUp(true);
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: "https://app.fbazn.com" } })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message ?? "Unable to authenticate. Please try again.");
      setIsSubmitting(false);
      return;
    }

    if (isSignUp) {
      // Trigger welcome email drip — fire and forget
      fetch("https://n8n.fbazn.com/webhook/welcome-drip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { email } }),
      }).catch(() => {});
      // Show verify email screen — user can't log in until confirmed
      setEmailSent(true);
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  if (emailSent) {
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
            We sent a confirmation link to <span className="font-medium text-[rgb(var(--text))]">{email}</span>.<br />
            Click the link to activate your account.
          </p>
          <p className="mt-6 text-xs text-[rgb(var(--muted))]">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
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
              ? "Set up your workspace access in seconds."
              : "Sign in to continue to your sourcing workspace."}
          </p>
        </div>

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

          <label className="flex flex-col gap-2 text-sm font-medium text-[rgb(var(--text))]">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
              required
            />
          </label>

          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
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
                ? "Create account"
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
