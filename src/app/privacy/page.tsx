export const metadata = {
  title: "Privacy Policy — FBAZN",
  description: "Privacy policy for FBAZN and the FBAZN Chrome Extension.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300">
      <div className="mx-auto max-w-2xl px-6 py-16">

        <p className="text-sm font-semibold text-blue-400 mb-2">FBAZN</p>
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: 23 March 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-white mb-2">1. Who we are</h2>
            <p>
              FBAZN is an Amazon FBA sourcing and analytics platform operated by Sam Knights.
              This policy covers both the FBAZN web application (<strong className="text-slate-200">app.fbazn.com</strong>) and the{" "}
              <strong className="text-slate-200">FBAZN Chrome Extension</strong>.
            </p>
            <p className="mt-2">
              Contact: <a href="mailto:help@fbazn.com" className="text-blue-400 hover:underline">help@fbazn.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">2. What data we collect</h2>
            <h3 className="text-sm font-medium text-slate-200 mt-3 mb-1">Account data</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Email address (used to create and identify your account)</li>
              <li>Password (hashed — never stored in plain text)</li>
              <li>Subscription plan and billing status (via Stripe)</li>
            </ul>

            <h3 className="text-sm font-medium text-slate-200 mt-3 mb-1">Product data (Chrome Extension)</h3>
            <p className="text-slate-400">
              When you click <strong className="text-slate-300">&quot;+ Add to Queue&quot;</strong> on an Amazon product page, the extension reads and sends to your FBAZN account:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 mt-1">
              <li>ASIN, product title, and main image URL</li>
              <li>Buy Box price</li>
              <li>Product category and size tier</li>
              <li>Calculated FBA fees, net profit, ROI, and margin</li>
              <li>Supplier cost price (if you entered one)</li>
            </ul>
            <p className="mt-2 text-slate-400">
              This data is only sent when you actively click &quot;Add to Queue&quot;. Browsing Amazon without clicking the button sends nothing to our servers.
            </p>

            <h3 className="text-sm font-medium text-slate-200 mt-3 mb-1">Locally stored data (Chrome Extension)</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Authentication token (stored in <code className="text-xs bg-slate-800 px-1 py-0.5 rounded">chrome.storage.local</code> — never transmitted except to authenticate API requests)</li>
              <li>FBA fee table cache (refreshed every 24 hours — avoids unnecessary network requests)</li>
              <li>UI preference: whether the calculator bar is collapsed</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">3. How we use your data</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>To provide the FBAZN service — your Review Queue, Sourcing List, and analytics</li>
              <li>To calculate and display FBA profit figures in the Chrome Extension</li>
              <li>To manage your subscription via Stripe</li>
              <li>To send transactional emails (account confirmation, billing receipts)</li>
            </ul>
            <p className="mt-2">We do not sell your data. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">4. Data storage and security</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Account and product data is stored in <strong className="text-slate-200">Supabase</strong> (PostgreSQL), hosted on AWS infrastructure. All tables have row-level security — users can only access their own data.</li>
              <li>Payment data is handled by <strong className="text-slate-200">Stripe</strong>. We never store card numbers.</li>
              <li>The application is hosted on <strong className="text-slate-200">Vercel</strong> with HTTPS enforced on all endpoints.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">5. Chrome Extension permissions</h2>
            <div className="space-y-2 text-slate-400">
              <div>
                <span className="font-mono text-xs text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">storage</span>
                <span className="ml-2">— stores your auth token, fee cache, and UI preferences locally on your device.</span>
              </div>
              <div>
                <span className="font-mono text-xs text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">amazon.co.uk</span>
                <span className="ml-2">— injects the profit calculator bar and reads product data (title, price, category, dimensions) on product pages only.</span>
              </div>
              <div>
                <span className="font-mono text-xs text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">app.fbazn.com</span>
                <span className="ml-2">— sends product data to your account when you click &quot;Add to Queue&quot;.</span>
              </div>
              <div>
                <span className="font-mono text-xs text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">supabase.co</span>
                <span className="ml-2">— fetches up-to-date FBA fee tables and authenticates your session.</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">6. Data retention</h2>
            <p className="text-slate-400">
              Your data is retained for as long as your account is active. You can request deletion of your account and all associated data at any time by emailing{" "}
              <a href="mailto:help@fbazn.com" className="text-blue-400 hover:underline">help@fbazn.com</a>.
              Account data will be permanently deleted within 30 days of the request.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">7. Third-party services</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-slate-200">Supabase</strong> — database and authentication</li>
              <li><strong className="text-slate-200">Stripe</strong> — payment processing</li>
              <li><strong className="text-slate-200">Vercel</strong> — application hosting</li>
            </ul>
            <p className="mt-2 text-slate-400">
              Each provider has their own privacy policy and data processing agreements in place.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">8. Your rights</h2>
            <p className="text-slate-400">
              Under UK GDPR you have the right to access, correct, or delete your personal data.
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:help@fbazn.com" className="text-blue-400 hover:underline">help@fbazn.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-2">9. Changes to this policy</h2>
            <p className="text-slate-400">
              We may update this policy from time to time. Material changes will be notified by email.
              Continued use of FBAZN after changes constitutes acceptance of the updated policy.
            </p>
          </section>

        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-600">
          © {new Date().getFullYear()} FBAZN. All rights reserved.
        </div>
      </div>
    </div>
  );
}
