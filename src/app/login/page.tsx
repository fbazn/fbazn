"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message ?? "Unable to authenticate. Please try again.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

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
