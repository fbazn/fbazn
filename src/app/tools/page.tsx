import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools – FBAZN",
  description: "Free Amazon FBA tools to help you find profitable products and calculate your margins.",
};

const tools = [
  {
    href: "/tools/fba-calculator",
    title: "FBA Profit Calculator",
    description:
      "Enter a buy box price and supplier cost to instantly calculate your referral fee, fulfilment fee, net profit, ROI, and margin.",
    badge: "UK",
  },
];

export default function FreeToolsPage() {
  return (
    <main className="min-h-screen bg-[rgb(var(--bg))] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-indigo-500">FBAZN</p>
        <h1 className="mt-2 text-3xl font-bold text-[rgb(var(--text))]">Tools</h1>
        <p className="mt-2 text-[rgb(var(--muted))]">
          Practical calculators and utilities for Amazon FBA sellers — no account required.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-elevated))] p-6 shadow-sm transition hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-base font-semibold text-[rgb(var(--text))] group-hover:text-indigo-500">
                  {tool.title}
                </h2>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {tool.badge}
                </span>
              </div>
              <p className="text-sm text-[rgb(var(--muted))]">{tool.description}</p>
              <span className="mt-auto text-sm font-medium text-indigo-500 group-hover:underline">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
