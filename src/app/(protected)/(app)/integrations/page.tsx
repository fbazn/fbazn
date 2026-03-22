const comingSoon = [
  {
    name: "Amazon SP-API",
    description:
      "Auto-sync your Amazon inventory, inbound shipments, and order data. No CSV needed — live data on demand.",
    eta: "Coming soon",
  },
  {
    name: "Keepa",
    description:
      "Pull BSR history, price history, and estimated monthly sales directly into your Review Queue and Sourcing List.",
    eta: "Coming soon",
  },
  {
    name: "Amazon Seller Central",
    description:
      "View your live inventory levels, FBA fees, and account health alongside your sourcing pipeline.",
    eta: "Coming soon",
  },
  {
    name: "Supplier feeds",
    description:
      "Connect wholesale supplier catalogues via CSV or API to automatically surface profitable products.",
    eta: "Coming soon",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--text))]">Integrations</h2>
        <p className="mt-0.5 text-sm text-[rgb(var(--muted))]">
          Connect FBAZN to Amazon and your data sources.
        </p>
      </div>

      {/* Chrome Extension — live */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
          Active
        </h3>
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6">
          <div className="flex items-start gap-4">
            {/* Chrome logo placeholder */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[rgb(var(--text))]">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="20.5" y1="16.5" x2="15.2" y2="13.5" stroke="currentColor" strokeWidth="1.5" />
                <line x1="3.5" y1="16.5" x2="8.8" y2="13.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-[rgb(var(--text))]">FBAZN Chrome Extension</h4>
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Active
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[rgb(var(--muted))] leading-relaxed max-w-lg">
                Browse Amazon and click the extension icon to instantly capture an ASIN and send it
                to your Review Queue — with buy box price, category, image, and size tier pre-filled.
              </p>

              {/* Install steps */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
                  How to set up
                </p>
                {[
                  "Install the FBAZN extension from the Chrome Web Store",
                  "Click the extension icon and sign in with your FBAZN account",
                  "Browse Amazon — click the extension on any product page to capture it",
                  "The product will appear instantly in your Review Queue",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 text-[10px] font-bold text-blue-400">
                      {i + 1}
                    </div>
                    <p className="text-sm text-[rgb(var(--muted))]">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Get extension from Chrome Web Store ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming soon */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--muted))]">
          Coming soon
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {comingSoon.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--card))] p-5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-[rgb(var(--text))]">{item.name}</h4>
                <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2 py-0.5 text-[10px] font-medium text-[rgb(var(--muted))]">
                  {item.eta}
                </span>
              </div>
              <p className="mt-2 text-sm text-[rgb(var(--muted))] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
