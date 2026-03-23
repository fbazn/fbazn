"use client";

export function RelaunchTourButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("fbazn:relaunch-tour"))}
      className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      Relaunch tour
    </button>
  );
}
