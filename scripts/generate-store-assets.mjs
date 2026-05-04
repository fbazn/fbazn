import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../store-assets");
mkdirSync(OUT, { recursive: true });

// ── Design tokens ──────────────────────────────────────────────────────────
const BG       = "#080C18";
const CARD     = "#0D1528";
const BORDER   = "#1E2A48";
const INDIGO   = "#6366f1";
const INDIGO_L = "#818cf8";
const AMBER    = "#f59e0b";
const WHITE    = "#E8EAF6";
const MUTED    = "#6B7CB3";

// ── Helpers ────────────────────────────────────────────────────────────────
async function svgToPng(svg, outFile, width, height) {
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(outFile);
  console.log(`✓  ${outFile}`);
}

// ══════════════════════════════════════════════════════════════════════════
// 1. STORE ICON — 128 × 128
// ══════════════════════════════════════════════════════════════════════════
const icon128 = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D1528"/>
      <stop offset="100%" stop-color="#080C18"/>
    </linearGradient>
    <linearGradient id="markGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="100%" stop-color="${INDIGO}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${INDIGO}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${INDIGO}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="128" height="128" rx="18" fill="url(#bgGrad)"/>
  <rect width="128" height="128" rx="18" fill="url(#glow)"/>

  <!-- Parallelogram mark (matches sidebar FZ shape) -->
  <polygon points="22,38 106,38 103,90 19,90" fill="url(#markGrad)" opacity="1"/>

  <!-- FZ text -->
  <text x="64" y="75"
    font-family="Arial Black, Arial, sans-serif"
    font-size="30"
    font-weight="900"
    fill="${WHITE}"
    text-anchor="middle"
    letter-spacing="2">FZ</text>

  <!-- Bottom wordmark -->
  <text x="64" y="112"
    font-family="Arial, sans-serif"
    font-size="10"
    font-weight="700"
    fill="${MUTED}"
    text-anchor="middle"
    letter-spacing="3">FBAZN</text>
</svg>`;

// ══════════════════════════════════════════════════════════════════════════
// 2. SMALL PROMO TILE — 440 × 280
// ══════════════════════════════════════════════════════════════════════════
const promo440 = `<svg width="440" height="280" viewBox="0 0 440 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg440" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0F1E"/>
      <stop offset="100%" stop-color="${BG}"/>
    </linearGradient>
    <linearGradient id="markGrad440" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="100%" stop-color="${INDIGO}"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${INDIGO}" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="${INDIGO}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow440" cx="75%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${INDIGO}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${INDIGO}" stop-opacity="0"/>
    </radialGradient>
    <!-- Chart bar gradient -->
    <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${INDIGO_L}"/>
      <stop offset="100%" stop-color="${INDIGO}" stop-opacity="0.3"/>
    </linearGradient>
    <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0.3"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="440" height="280" fill="url(#bg440)"/>
  <rect width="440" height="280" fill="url(#glow440)"/>

  <!-- Subtle grid lines -->
  <line x1="0" y1="70" x2="440" y2="70" stroke="${BORDER}" stroke-width="0.5" opacity="0.5"/>
  <line x1="0" y1="140" x2="440" y2="140" stroke="${BORDER}" stroke-width="0.5" opacity="0.5"/>
  <line x1="0" y1="210" x2="440" y2="210" stroke="${BORDER}" stroke-width="0.5" opacity="0.5"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="440" height="3" fill="url(#markGrad440)"/>

  <!-- Left side content -->

  <!-- Parallelogram logo mark -->
  <polygon points="36,38 76,38 74,58 34,58" fill="url(#markGrad440)"/>
  <text x="55" y="53"
    font-family="Arial Black, Arial, sans-serif"
    font-size="12" font-weight="900" fill="${WHITE}" text-anchor="middle">FZ</text>

  <!-- Wordmark -->
  <text x="88" y="50"
    font-family="Arial Black, Arial, sans-serif"
    font-size="18" font-weight="900" fill="${WHITE}">FB</text>
  <text x="112" y="50"
    font-family="Arial Black, Arial, sans-serif"
    font-size="18" font-weight="900" fill="${INDIGO_L}">AZN</text>

  <!-- Tagline -->
  <text x="36" y="88"
    font-family="Arial, sans-serif"
    font-size="20" font-weight="700" fill="${WHITE}">Amazon FBA</text>
  <text x="36" y="114"
    font-family="Arial, sans-serif"
    font-size="20" font-weight="700" fill="${WHITE}">Profit Calculator</text>

  <!-- Divider -->
  <rect x="36" y="128" width="40" height="2" fill="${INDIGO}" rx="1"/>

  <!-- Feature bullets -->
  <circle cx="44" cy="154" r="3" fill="${INDIGO_L}"/>
  <text x="56" y="158" font-family="Arial, sans-serif" font-size="11" fill="${MUTED}">Live profit figures on every product page</text>

  <circle cx="44" cy="174" r="3" fill="${INDIGO_L}"/>
  <text x="56" y="178" font-family="Arial, sans-serif" font-size="11" fill="${MUTED}">One-click add to sourcing queue</text>

  <circle cx="44" cy="194" r="3" fill="${INDIGO_L}"/>
  <text x="56" y="198" font-family="Arial, sans-serif" font-size="11" fill="${MUTED}">BSR, sales data &amp; price history (Pro)</text>

  <!-- Right side — abstract chart bars -->
  <rect x="290" y="160" width="22" height="80" fill="url(#bar1)" rx="3" opacity="0.7"/>
  <rect x="320" y="130" width="22" height="110" fill="url(#bar1)" rx="3" opacity="0.9"/>
  <rect x="350" y="145" width="22" height="95" fill="url(#bar2)" rx="3" opacity="0.7"/>
  <rect x="380" y="110" width="22" height="130" fill="url(#bar1)" rx="3" opacity="1"/>

  <!-- Chart line overlay -->
  <polyline points="301,160 331,132 361,145 391,112"
    fill="none" stroke="${INDIGO_L}" stroke-width="2" opacity="0.6" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Chart dots -->
  <circle cx="301" cy="160" r="3" fill="${INDIGO_L}"/>
  <circle cx="331" cy="132" r="3" fill="${INDIGO_L}"/>
  <circle cx="361" cy="145" r="3" fill="${AMBER}"/>
  <circle cx="391" cy="112" r="3" fill="${INDIGO_L}"/>

  <!-- Bottom label -->
  <text x="220" y="262"
    font-family="Arial, sans-serif"
    font-size="9" fill="${MUTED}" text-anchor="middle" letter-spacing="2">APP.FBAZN.COM</text>
</svg>`;

// ══════════════════════════════════════════════════════════════════════════
// 3. MARQUEE PROMO TILE — 1400 × 560
// ══════════════════════════════════════════════════════════════════════════
const marquee1400 = `<svg width="1400" height="560" viewBox="0 0 1400 560" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgM" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0F1E"/>
      <stop offset="100%" stop-color="${BG}"/>
    </linearGradient>
    <linearGradient id="markGradM" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="100%" stop-color="${INDIGO}"/>
    </linearGradient>
    <radialGradient id="glowLeft" cx="30%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${INDIGO}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${INDIGO}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowRight" cx="80%" cy="50%" r="45%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="barM1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${INDIGO_L}"/>
      <stop offset="100%" stop-color="${INDIGO}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="barM2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#0D1528"/>
    </linearGradient>
    <filter id="cardShadow">
      <feDropShadow dx="0" dy="8" stdDeviation="20" flood-color="${INDIGO}" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1400" height="560" fill="url(#bgM)"/>
  <rect width="1400" height="560" fill="url(#glowLeft)"/>
  <rect width="1400" height="560" fill="url(#glowRight)"/>

  <!-- Subtle grid -->
  <line x1="0" y1="140" x2="1400" y2="140" stroke="${BORDER}" stroke-width="0.5" opacity="0.4"/>
  <line x1="0" y1="280" x2="1400" y2="280" stroke="${BORDER}" stroke-width="0.5" opacity="0.4"/>
  <line x1="0" y1="420" x2="1400" y2="420" stroke="${BORDER}" stroke-width="0.5" opacity="0.4"/>
  <line x1="350" y1="0" x2="350" y2="560" stroke="${BORDER}" stroke-width="0.5" opacity="0.3"/>
  <line x1="700" y1="0" x2="700" y2="560" stroke="${BORDER}" stroke-width="0.5" opacity="0.3"/>
  <line x1="1050" y1="0" x2="1050" y2="560" stroke="${BORDER}" stroke-width="0.5" opacity="0.3"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="1400" height="4" fill="url(#markGradM)"/>

  <!-- ── LEFT SIDE — Branding ── -->

  <!-- Logo mark (large parallelogram) -->
  <polygon points="80,100 190,100 186,148 76,148" fill="url(#markGradM)"/>
  <text x="133" y="135"
    font-family="Arial Black, Arial, sans-serif"
    font-size="28" font-weight="900" fill="${WHITE}" text-anchor="middle" letter-spacing="3">FZ</text>

  <!-- Wordmark -->
  <text x="210" y="138"
    font-family="Arial Black, Arial, sans-serif"
    font-size="40" font-weight="900" fill="${WHITE}">FB</text>
  <text x="270" y="138"
    font-family="Arial Black, Arial, sans-serif"
    font-size="40" font-weight="900" fill="${INDIGO_L}">AZN</text>

  <!-- Tagline -->
  <text x="80" y="200"
    font-family="Arial, sans-serif"
    font-size="36" font-weight="700" fill="${WHITE}">Amazon FBA Profit Calculator</text>

  <text x="80" y="244"
    font-family="Arial, sans-serif"
    font-size="18" fill="${MUTED}">Instant profit figures on every Amazon product page.</text>
  <text x="80" y="268"
    font-family="Arial, sans-serif"
    font-size="18" fill="${MUTED}">Add to your sourcing queue in one click.</text>

  <!-- Accent rule -->
  <rect x="80" y="292" width="60" height="3" fill="${INDIGO}" rx="1.5"/>

  <!-- Feature pills -->
  <rect x="80" y="316" width="178" height="34" rx="17" fill="${INDIGO}" fill-opacity="0.15" stroke="${INDIGO}" stroke-opacity="0.35" stroke-width="1"/>
  <text x="169" y="338" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="${INDIGO_L}" text-anchor="middle">📊 Live FBA Fees</text>

  <rect x="272" y="316" width="162" height="34" rx="17" fill="${INDIGO}" fill-opacity="0.15" stroke="${INDIGO}" stroke-opacity="0.35" stroke-width="1"/>
  <text x="353" y="338" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="${INDIGO_L}" text-anchor="middle">📈 BSR &amp; Sales Data</text>

  <rect x="448" y="316" width="174" height="34" rx="17" fill="${INDIGO}" fill-opacity="0.15" stroke="${INDIGO}" stroke-opacity="0.35" stroke-width="1"/>
  <text x="535" y="338" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="${INDIGO_L}" text-anchor="middle">⚡ Price Volatility</text>

  <rect x="80" y="364" width="184" height="34" rx="17" fill="${AMBER}" fill-opacity="0.12" stroke="${AMBER}" stroke-opacity="0.35" stroke-width="1"/>
  <text x="172" y="386" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="${AMBER}" text-anchor="middle">✓ One-Click Queue</text>

  <rect x="278" y="364" width="200" height="34" rx="17" fill="${AMBER}" fill-opacity="0.12" stroke="${AMBER}" stroke-opacity="0.35" stroke-width="1"/>
  <text x="378" y="386" font-family="Arial, sans-serif" font-size="13" font-weight="600" fill="${AMBER}" text-anchor="middle">🔗 Supplier Tracking</text>

  <!-- URL -->
  <text x="80" y="480"
    font-family="Arial, sans-serif"
    font-size="14" fill="${MUTED}" letter-spacing="2">APP.FBAZN.COM</text>

  <!-- ── RIGHT SIDE — Abstract UI mockup ── -->

  <!-- Card background -->
  <rect x="820" y="60" width="520" height="440" rx="16"
    fill="url(#cardGrad)" stroke="${BORDER}" stroke-width="1" filter="url(#cardShadow)"/>

  <!-- Card top bar -->
  <rect x="820" y="60" width="520" height="44" rx="16" fill="#111827"/>
  <rect x="820" y="88" width="520" height="16" fill="#111827"/>
  <circle cx="850" cy="82" r="5" fill="#ff5f57"/>
  <circle cx="870" cy="82" r="5" fill="#ffbd2e"/>
  <circle cx="890" cy="82" r="5" fill="#28c840"/>
  <text x="1080" y="87" font-family="Arial, sans-serif" font-size="11" fill="${MUTED}" text-anchor="middle">app.fbazn.com/review-queue</text>

  <!-- Stat row 1 -->
  <rect x="844" y="124" width="108" height="52" rx="8" fill="#0D1528" stroke="${BORDER}" stroke-width="1"/>
  <text x="898" y="144" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}" text-anchor="middle">SALES / MO</text>
  <text x="898" y="163" font-family="Arial Black, Arial, sans-serif" font-size="16" font-weight="900" fill="${INDIGO_L}" text-anchor="middle">~847</text>

  <rect x="960" y="124" width="108" height="52" rx="8" fill="#0D1528" stroke="${BORDER}" stroke-width="1"/>
  <text x="1014" y="144" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}" text-anchor="middle">BSR NOW</text>
  <text x="1014" y="163" font-family="Arial Black, Arial, sans-serif" font-size="16" font-weight="900" fill="${WHITE}" text-anchor="middle">4,231</text>

  <rect x="1076" y="124" width="108" height="52" rx="8" fill="#0D1528" stroke="${BORDER}" stroke-width="1"/>
  <text x="1130" y="144" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}" text-anchor="middle">90D AVG</text>
  <text x="1130" y="163" font-family="Arial Black, Arial, sans-serif" font-size="16" font-weight="900" fill="${WHITE}" text-anchor="middle">3,890</text>

  <!-- Stat row 2 -->
  <rect x="844" y="186" width="108" height="52" rx="8" fill="#0D1528" stroke="${BORDER}" stroke-width="1"/>
  <text x="898" y="206" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}" text-anchor="middle">BB LOW</text>
  <text x="898" y="225" font-family="Arial Black, Arial, sans-serif" font-size="15" font-weight="900" fill="#34d399" text-anchor="middle">£18.99</text>

  <rect x="960" y="186" width="108" height="52" rx="8" fill="#0D1528" stroke="${BORDER}" stroke-width="1"/>
  <text x="1014" y="206" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}" text-anchor="middle">BB HIGH</text>
  <text x="1014" y="225" font-family="Arial Black, Arial, sans-serif" font-size="15" font-weight="900" fill="#f87171" text-anchor="middle">£24.99</text>

  <rect x="1076" y="186" width="108" height="52" rx="8" fill="#0D1528" stroke="${BORDER}" stroke-width="1"/>
  <rect x="1088" y="198" width="84" height="28" rx="14"
    fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.4" stroke-width="1"/>
  <text x="1130" y="217" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="#34d399" text-anchor="middle">✓ STABLE</text>

  <!-- Chart area -->
  <rect x="844" y="252" width="452" height="160" rx="8" fill="#0A0F1E" stroke="${BORDER}" stroke-width="1"/>

  <!-- Chart grid lines -->
  <line x1="844" y1="292" x2="1296" y2="292" stroke="${BORDER}" stroke-width="0.5"/>
  <line x1="844" y1="332" x2="1296" y2="332" stroke="${BORDER}" stroke-width="0.5"/>
  <line x1="844" y1="372" x2="1296" y2="372" stroke="${BORDER}" stroke-width="0.5"/>

  <!-- BSR line -->
  <polyline
    points="860,380 900,350 940,362 980,320 1020,310 1060,295 1100,308 1140,280 1180,295 1220,270 1260,262 1280,268"
    fill="none" stroke="${INDIGO_L}" stroke-width="2.5" opacity="0.9" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- BSR area fill -->
  <polygon
    points="860,380 900,350 940,362 980,320 1020,310 1060,295 1100,308 1140,280 1180,295 1220,270 1260,262 1280,268 1280,412 860,412"
    fill="${INDIGO}" fill-opacity="0.08"/>

  <!-- BB line -->
  <polyline
    points="860,370 900,365 940,372 980,355 1020,342 1060,350 1100,338 1140,345 1180,330 1220,340 1260,328 1280,335"
    fill="none" stroke="#4ade80" stroke-width="2" opacity="0.7" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Chart legend -->
  <rect x="858" y="258" width="8" height="8" rx="2" fill="${INDIGO_L}"/>
  <text x="872" y="266" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}">BSR</text>
  <rect x="902" y="258" width="8" height="8" rx="2" fill="#4ade80"/>
  <text x="916" y="266" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}">Buy Box</text>

  <!-- Range buttons -->
  <rect x="1210" y="254" width="30" height="16" rx="4" fill="${INDIGO}" fill-opacity="0.3" stroke="${INDIGO}" stroke-opacity="0.5" stroke-width="1"/>
  <text x="1225" y="266" font-family="Arial, sans-serif" font-size="9" fill="${INDIGO_L}" text-anchor="middle">90D</text>
  <rect x="1246" y="254" width="30" height="16" rx="4" fill="transparent" stroke="${BORDER}" stroke-width="1"/>
  <text x="1261" y="266" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}" text-anchor="middle">180D</text>

  <!-- Profit bar at bottom of card -->
  <rect x="844" y="428" width="520" height="52" rx="8" fill="#0D1528" stroke="${BORDER}" stroke-width="1"/>
  <text x="866" y="448" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}">NET PROFIT</text>
  <text x="866" y="468" font-family="Arial Black, Arial, sans-serif" font-size="17" font-weight="900" fill="#34d399">£4.82</text>
  <text x="966" y="448" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}">ROI</text>
  <text x="966" y="468" font-family="Arial Black, Arial, sans-serif" font-size="17" font-weight="900" fill="#34d399">24.1%</text>
  <text x="1046" y="448" font-family="Arial, sans-serif" font-size="9" fill="${MUTED}">MARGIN</text>
  <text x="1046" y="468" font-family="Arial Black, Arial, sans-serif" font-size="17" font-weight="900" fill="#34d399">19.3%</text>

  <!-- Add to queue button suggestion -->
  <rect x="1160" y="434" width="176" height="38" rx="8" fill="${INDIGO}" fill-opacity="0.9"/>
  <text x="1248" y="458" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="${WHITE}" text-anchor="middle">+ Add to Queue</text>
</svg>`;

// ── Convert all three ──────────────────────────────────────────────────────
await svgToPng(icon128,    join(OUT, "icon-128.png"),    128, 128);
await svgToPng(promo440,   join(OUT, "promo-440x280.png"), 440, 280);
await svgToPng(marquee1400, join(OUT, "marquee-1400x560.png"), 1400, 560);

console.log(`\nAll assets saved to: ${OUT}`);
