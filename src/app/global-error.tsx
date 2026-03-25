"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f1e] text-white">
        <div className="text-center space-y-4 max-w-md px-6">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-slate-400 text-sm">
            An unexpected error occurred. It has been reported and we&apos;ll look into it.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
