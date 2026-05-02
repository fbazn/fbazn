"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInvite = searchParams.get("invite") === "1";
  const linkError = searchParams.get("auth_error") === "email_link_invalid";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    linkError ? "That email link is invalid or has expired. Please request a new one." : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(!linkError);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (linkError) {
      setIsChecking(false);
      return;
    }

    let mounted = true;
    let resolved = false;
    const supabase = createClient();

    const markReady = () => {
      if (!mounted) return;
      resolved = true;
      setReady(true);
      setIsChecking(false);
    };

    const timeout = window.setTimeout(() => {
      if (!mounted || resolved) return;
      setIsChecking(false);
    }, 1500);

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.clearTimeout(timeout);
        markReady();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        window.clearTimeout(timeout);
        markReady();
      }
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [linkError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login?password_updated=1");
  };

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 text-center">
          <p className="text-sm text-[rgb(var(--muted))]">Verifying email link...</p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-indigo-500">FBAZN</p>
          <h1 className="mt-2 text-2xl font-semibold text-[rgb(var(--text))]">
            Email link expired
          </h1>
          <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">
            Password reset and invitation links can only be used once. Please request a fresh link
            from the sign in page.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400"
          >
            Back to sign in
          </button>
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
            {isInvite ? "Create your password" : "Set new password"}
          </h1>
          <p className="text-sm text-[rgb(var(--muted))]">
            {isInvite
              ? "Choose a password to finish setting up your FBAZN account."
              : "Choose a new password for your account."}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-[rgb(var(--text))]">
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="At least 8 characters"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[rgb(var(--text))]">
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="h-11 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirm your password"
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
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
