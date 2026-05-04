import sharp from "sharp";
import toIco from "to-ico";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const AMBER  = "#f59e0b";
const INDIGO = "#6366f1";
const WHITE  = "#E8EAF6";
const MUTED  = "#6B7CB3";

function makeSvg(size) {
  if (size <= 16) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D1528"/>
      <stop offset="100%" stop-color="#080C18"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="100%" stop-color="${INDIGO}"/>
    </linearGradient>
  </defs>
  <rect width="16" height="16" rx="3" fill="url(#bg)"/>
  <polygon points="2,4 14,4 13,12 1,12" fill="url(#mark)"/>
  <text x="7.5" y="11" font-family="Arial Black, Arial, sans-serif"
    font-size="6" font-weight="900" fill="${WHITE}" text-anchor="middle">FZ</text>
</svg>`;
  }

  if (size === 32) {
    return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D1528"/>
      <stop offset="100%" stop-color="#080C18"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="100%" stop-color="${INDIGO}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${INDIGO}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${INDIGO}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="32" height="32" rx="5" fill="url(#bg)"/>
  <rect width="32" height="32" rx="5" fill="url(#glow)"/>
  <polygon points="5,9 27,9 26,23 4,23" fill="url(#mark)"/>
  <text x="15.5" y="20" font-family="Arial Black, Arial, sans-serif"
    font-size="9" font-weight="900" fill="${WHITE}" text-anchor="middle" letter-spacing="1">FZ</text>
</svg>`;
  }

  // 180px (apple-touch-icon) and 192/512 (PWA)
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D1528"/>
      <stop offset="100%" stop-color="#080C18"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${AMBER}"/>
      <stop offset="100%" stop-color="${INDIGO}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${INDIGO}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${INDIGO}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.14)}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.14)}" fill="url(#glow)"/>
  <polygon points="${Math.round(size*0.17)},${Math.round(size*0.30)} ${Math.round(size*0.83)},${Math.round(size*0.30)} ${Math.round(size*0.80)},${Math.round(size*0.70)} ${Math.round(size*0.15)},${Math.round(size*0.70)}" fill="url(#mark)"/>
  <text x="${size/2}" y="${Math.round(size*0.585)}"
    font-family="Arial Black, Arial, sans-serif"
    font-size="${Math.round(size*0.235)}" font-weight="900"
    fill="${WHITE}" text-anchor="middle" letter-spacing="${Math.round(size*0.016)}">FZ</text>
  <text x="${size/2}" y="${Math.round(size*0.875)}"
    font-family="Arial, sans-serif"
    font-size="${Math.round(size*0.078)}" font-weight="700"
    fill="${MUTED}" text-anchor="middle" letter-spacing="${Math.round(size*0.023)}">FBAZN</text>
</svg>`;
}

async function svgToPngBuffer(svg, size) {
  return await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

// ── Generate all favicon assets ────────────────────────────────────────────

// favicon.ico: 16 + 32 embedded
const buf16 = await svgToPngBuffer(makeSvg(16), 16);
const buf32 = await svgToPngBuffer(makeSvg(32), 32);
const icoBuffer = await toIco([buf16, buf32]);
writeFileSync(join(__dirname, "../src/app/favicon.ico"), icoBuffer);
console.log("✓  src/app/favicon.ico (16+32)");

// apple-touch-icon.png — 180×180 in public/
const buf180 = await svgToPngBuffer(makeSvg(180), 180);
writeFileSync(join(__dirname, "../public/apple-touch-icon.png"), buf180);
console.log("✓  public/apple-touch-icon.png (180)");

// icon.png — 192×192 for PWA / Next.js metadata (replaces favicon.ico in modern browsers)
const buf192 = await svgToPngBuffer(makeSvg(192), 192);
writeFileSync(join(__dirname, "../public/icon.png"), buf192);
console.log("✓  public/icon.png (192)");

// 512 for PWA manifest
const buf512 = await svgToPngBuffer(makeSvg(512), 512);
writeFileSync(join(__dirname, "../public/icon-512.png"), buf512);
console.log("✓  public/icon-512.png (512)");

console.log("\nAll favicons generated.");
