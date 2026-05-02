"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMessage("Passwords don't match.");
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
    } else {
      await supabase.auth.signOut();
      router.replace("/login");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-indigo-500">FBAZN</p>
          <h1 className="text-2xl font-semibold text-[rgb(var(--text))]">Set new password</h1>
          <p className="text-sm text-[rgb(var(--muted))]">Choose a new password for your account.</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-[rgb(var(--text))]">
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] px-3 text-sm text-[rgb(var(--text))] shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
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
            {isSubmitting ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
