export const metadata = {
  title: "Privacy Policy — FBAZN",
  description: "Privacy policy for FBAZN and the FBAZN Chrome Extension.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">

      {/* Nav bar */}
      <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--card))]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-6 h-14 flex items-center justify-between">
          <a href="/" className="font-black text-lg tracking-tight">
            <span className="text-[rgb(var(--text))]">FB</span>
            <span className="text-indigo-400">AZN</span>
          </a>
          <a
            href="/login"
            className="rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted))] transition hover:bg-[rgb(var(--panel))] hover:text-[rgb(var(--text))]"
          >
            Sign in →
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-14">

        <div className="mb-10">
          <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 mb-4">
            Legal
          </span>
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[rgb(var(--muted))]">Last updated: 23 March 2026</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-[rgb(var(--muted))]">

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">1. Who we are</h2>
            <p>
              FBAZN is an Amazon FBA sourcing and analytics platform operated by Sam Knights.
              This policy covers both the FBAZN web application (<strong className="text-[rgb(var(--text))]">app.fbazn.com</strong>) and the{" "}
              <strong className="text-[rgb(var(--text))]">FBAZN Chrome Extension</strong>.
            </p>
            <p className="mt-2">
              Contact:{" "}
              <a href="mailto:help@fbazn.com" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2">
                help@fbazn.com
              </a>
            </p>
          </section>

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">2. What data we collect</h2>

            <h3 className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))] mt-4 mb-2">Account data</h3>
            <ul className="space-y-1.5">
              {[
                "Email address (used to create and identify your account)",
                "Password (hashed — never stored in plain text)",
                "Subscription plan and billing status (via Stripe)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))] mt-5 mb-2">Product data (Chrome Extension)</h3>
            <p className="mb-2">
              When you click <strong className="text-[rgb(var(--text))]">&quot;+ Add to Queue&quot;</strong> on an Amazon product page, the extension reads and sends to your FBAZN account:
            </p>
            <ul className="space-y-1.5">
              {[
                "ASIN, product title, and main image URL",
                "Buy Box price",
                "Product category and size tier",
                "Calculated FBA fees, net profit, ROI, and margin",
                "Supplier cost price (if you entered one)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-emerald-400 text-xs">
              ✓ Data is only sent when you actively click &quot;Add to Queue&quot;. Browsing Amazon without clicking sends nothing to our servers.
            </p>

            <h3 className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))] mt-5 mb-2">Locally stored data (Chrome Extension)</h3>
            <ul className="space-y-1.5">
              {[
                ["Authentication token", "stored in chrome.storage.local — never transmitted except to authenticate API requests"],
                ["FBA fee table cache", "refreshed every 24 hours — avoids unnecessary network requests"],
                ["UI preference", "whether the calculator bar is collapsed"],
              ].map(([bold, rest]) => (
                <li key={bold} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span><strong className="text-[rgb(var(--text))]">{bold}</strong> — {rest}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">3. How we use your data</h2>
            <ul className="space-y-1.5">
              {[
                "To provide the FBAZN service — your Review Queue, Sourcing List, and analytics",
                "To calculate and display FBA profit figures in the Chrome Extension",
                "To manage your subscription via Stripe",
                "To send transactional emails (account confirmation, billing receipts)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2.5 text-xs font-medium text-[rgb(var(--text))]">
              We do not sell your data. We do not use your data for advertising.
            </p>
          </section>

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">4. Data storage and security</h2>
            <ul className="space-y-2">
              {[
                ["Supabase", "Account and product data stored in PostgreSQL on AWS. All tables have row-level security — users can only access their own data."],
                ["Stripe", "Handles all payment processing. We never store card numbers."],
                ["Vercel", "Application hosting with HTTPS enforced on all endpoints."],
              ].map(([provider, desc]) => (
                <li key={provider} className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2.5">
                  <span className="font-semibold text-[rgb(var(--text))] w-16 flex-shrink-0">{provider}</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">5. Chrome Extension permissions</h2>
            <div className="space-y-2">
              {[
                ["storage", "Stores your auth token, fee cache, and UI preferences locally on your device."],
                ["amazon.co.uk", "Injects the profit calculator bar and reads product data (title, price, category, dimensions) on product pages only."],
                ["app.fbazn.com", "Sends product data to your account when you click \"Add to Queue\"."],
                ["supabase.co", "Fetches up-to-date FBA fee tables and authenticates your session."],
              ].map(([perm, desc]) => (
                <div key={perm} className="flex items-start gap-3 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2.5">
                  <code className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">
                    {perm}
                  </code>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">6. Data retention</h2>
            <p>
              Your data is retained for as long as your account is active. You can request deletion of your account and all associated data at any time by emailing{" "}
              <a href="mailto:help@fbazn.com" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2">
                help@fbazn.com
              </a>.
              Account data will be permanently deleted within 30 days of the request.
            </p>
          </section>

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">7. Third-party services</h2>
            <ul className="space-y-1.5">
              {[
                ["Supabase", "database and authentication"],
                ["Stripe", "payment processing"],
                ["Vercel", "application hosting"],
              ].map(([name, role]) => (
                <li key={name} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                  <span><strong className="text-[rgb(var(--text))]">{name}</strong> — {role}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[rgb(var(--muted))]">
              Each provider has their own privacy policy and data processing agreements in place.
            </p>
          </section>

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">8. Your rights (UK GDPR)</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time.
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:help@fbazn.com" className="text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2">
                help@fbazn.com
              </a>.
            </p>
          </section>

          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
            <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-3">9. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be notified by email.
              Continued use of FBAZN after changes constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>

        <div className="mt-12 border-t border-[rgb(var(--border))] pt-6 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
          <span>© {new Date().getFullYear()} FBAZN. All rights reserved.</span>
          <a href="mailto:help@fbazn.com" className="hover:text-[rgb(var(--text))] transition">
            help@fbazn.com
          </a>
        </div>
      </div>
    </div>
  );
}
