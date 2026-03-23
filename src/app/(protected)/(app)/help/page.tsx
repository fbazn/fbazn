import Link from "next/link";
import { RelaunchTourButton } from "./RelaunchTourButton";

const guides = [
  {
    step: "1",
    title: "Install the Chrome Extension",
    description:
      "The extension is how you add products to FBAZN. While browsing Amazon, click the extension icon to instantly capture an ASIN and send it to your Review Queue.",
    actions: [
      { label: "Get the extension", href: "https://chrome.google.com/webstore", external: true },
    ],
  },
  {
    step: "2",
    title: "Review products in the Review Queue",
    description:
      "Every ASIN you capture lands in your Review Queue. Open each item, check the economics (buy box price, FBA fees, net profit, ROI), add a supplier cost, and decide: convert it to your Sourcing List or reject it.",
    actions: [
      { label: "Go to Review Queue", href: "/review-queue", external: false },
    ],
  },
  {
    step: "3",
    title: "Build your Sourcing List",
    description:
      "Products you convert from the Review Queue appear in your Sourcing List. This is your active pipeline of products you intend to source. You can edit supplier details, add notes, and archive products you no longer want to track.",
    actions: [
      { label: "Go to Sourcing List", href: "/sourcing", external: false },
    ],
  },
  {
    step: "4",
    title: "Use the FBA Calculator",
    description:
      "Not sure if a product is worth sourcing? Use the FBA Calculator to estimate net profit, ROI, and fees before you commit. Works for any ASIN on any marketplace.",
    actions: [
      { label: "Open FBA Calculator", href: "/tools/fba-calculator", external: false },
    ],
  },
  {
    step: "5",
    title: "Manage your Suppliers",
    description:
      "Link suppliers to products in your Review Queue. The Suppliers directory shows all your suppliers and which products you've sourced from each one — great for building relationships and tracking performance per supplier.",
    actions: [
      { label: "Go to Suppliers", href: "/suppliers", external: false },
    ],
  },
  {
    step: "6",
    title: "Configure your defaults",
    description:
      "Set your default marketplace, preferred currency, VAT rate, prep fee, inbound shipping cost, minimum ROI, and target margin. These values are used throughout the app to ensure all calculations match your real costs.",
    actions: [
      { label: "Open Settings", href: "/settings", external: false },
    ],
  },
];

const faqs = [
  {
    q: "How does FBAZN calculate net profit?",
    a: "Net profit = Buy Box price − Supplier cost − Amazon Referral Fee − FBA Fulfilment Fee − your configured prep and inbound shipping costs. VAT is applied based on your selected marketplace and settings.",
  },
  {
    q: "What is the Review Queue?",
    a: "The Review Queue is a staging area for ASINs you've found while browsing Amazon. You review each one, check the economics, then either convert it to your Sourcing List or reject it. Nothing goes to your Sourcing List automatically.",
  },
  {
    q: "What happens when I archive a product?",
    a: "Archiving moves a product off your Sourcing List into Archived Products. It's not deleted — you can restore it at any time. Use archiving when you've decided not to proceed with a product for now but want to keep the data.",
  },
  {
    q: "Can I use FBAZN for multiple marketplaces?",
    a: "Yes. Set your default marketplace in Settings. The FBA Calculator and fee lookups will use the correct fee tables for your marketplace. Support for UK, US, and DE is available.",
  },
  {
    q: "How do I change my subscription or cancel?",
    a: "Go to Billing and click 'Manage billing'. This opens the Stripe Customer Portal where you can change your plan, update your payment method, or cancel. If you cancel, your access continues until the end of the current billing period.",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Help &amp; Tutorials</h2>
          <p className="mt-0.5 text-sm text-[rgb(var(--muted))]">
            Everything you need to get the most out of FBAZN.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <RelaunchTourButton />
        <a
          href="mailto:support@fbazn.com"
          className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-sm text-[rgb(var(--muted))] transition hover:text-[rgb(var(--text))]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Contact support
        </a>
        </div>
      </div>

      {/* Getting started guide */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
          Getting started
        </h3>
        <div className="space-y-3">
          {guides.map((guide) => (
            <div
              key={guide.step}
              className="flex gap-5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5"
            >
              {/* Step number */}
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 text-sm font-bold text-blue-400">
                {guide.step}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="font-semibold text-[rgb(var(--text))]">{guide.title}</h4>
                <p className="mt-1 text-sm text-[rgb(var(--muted))] leading-relaxed">
                  {guide.description}
                </p>
                {guide.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {guide.actions.map((action) =>
                      action.external ? (
                        <a
                          key={action.label}
                          href={action.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text))] transition hover:border-blue-500/40 hover:text-blue-400"
                        >
                          {action.label} ↗
                        </a>
                      ) : (
                        <Link
                          key={action.label}
                          href={action.href}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text))] transition hover:border-blue-500/40 hover:text-blue-400"
                        >
                          {action.label} →
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
          Frequently asked questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5"
            >
              <h4 className="font-semibold text-[rgb(var(--text))]">{faq.q}</h4>
              <p className="mt-2 text-sm text-[rgb(var(--muted))] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
        <h3 className="font-semibold text-[rgb(var(--text))]">Still need help?</h3>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          Email us at{" "}
          <a
            href="mailto:support@fbazn.com"
            className="text-blue-400 hover:text-blue-300 transition"
          >
            support@fbazn.com
          </a>{" "}
          and we&apos;ll get back to you within 24 hours.
        </p>
      </section>
    </div>
  );
}
