import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/product-image?brand=Akrapovič&name=Slip-On+Carbon&category=Exhaust
 *
 * Returns a 800×800 SVG product-catalog placeholder with:
 *  - Pure white background
 *  - Category-specific icon (exhaust pipe, ECU chip, air filter, disc brake, mirror, wrench)
 *  - Brand name + shortened product name
 *  - Category label
 *  - 6T4 CUSTOMS watermark
 *
 * No image files needed — generated entirely in-process.
 * Cache-Control: 1 year (content is deterministic).
 */

export const runtime = "edge";

// ─── Category Icons (SVG path strings) ───────────────────────────────────────

const ICONS: Record<string, string> = {
  Exhaust: `
    <!-- Exhaust muffler side-view -->
    <g transform="translate(400,360)">
      <!-- Inlet pipe -->
      <rect x="-220" y="-18" width="110" height="36" rx="18" fill="#d8d8d8"/>
      <!-- Main canister body -->
      <rect x="-125" y="-52" width="240" height="104" rx="28" fill="#e2e2e2"/>
      <!-- End cap ring -->
      <ellipse cx="115" cy="0" rx="28" ry="52" fill="#c8c8c8" stroke="#bbb" stroke-width="2"/>
      <!-- Outlet bore -->
      <ellipse cx="115" cy="0" rx="14" ry="26" fill="#aaaaaa"/>
      <!-- Mounting bracket -->
      <rect x="-50" y="-70" width="14" height="28" rx="4" fill="#c8c8c8"/>
      <circle cx="-43" cy="-72" r="6" fill="#b8b8b8"/>
      <!-- Carbon weave lines on can -->
      <line x1="-120" y1="-30" x2="108" y2="-30" stroke="#ccc" stroke-width="1.5" stroke-dasharray="8,6"/>
      <line x1="-120" y1="0"   x2="108" y2="0"   stroke="#ccc" stroke-width="1.5" stroke-dasharray="8,6"/>
      <line x1="-120" y1="30"  x2="108" y2="30"  stroke="#ccc" stroke-width="1.5" stroke-dasharray="8,6"/>
    </g>`,

  "ECU Tuning": `
    <!-- ECU module with connector strip -->
    <g transform="translate(400,360)">
      <!-- Shadow -->
      <rect x="-155" y="-75" width="310" height="150" rx="14" fill="#d8d8d8" transform="translate(4,4)"/>
      <!-- Main body -->
      <rect x="-155" y="-75" width="310" height="150" rx="14" fill="#e4e4e4"/>
      <!-- Inner recess -->
      <rect x="-140" y="-60" width="280" height="120" rx="8" fill="#d8d8d8"/>
      <!-- Model label -->
      <text x="0" y="-10" text-anchor="middle" font-family="monospace,Courier New" font-size="22" font-weight="700" fill="#999" letter-spacing="3">PC-V</text>
      <text x="0" y="18" text-anchor="middle" font-family="monospace,Courier New" font-size="13" fill="#b0b0b0" letter-spacing="2">FUEL CTRL</text>
      <!-- Status LEDs -->
      <circle cx="-120" cy="-48" r="5" fill="#4ade80"/>
      <circle cx="-104" cy="-48" r="5" fill="#f87171"/>
      <circle cx="-88"  cy="-48" r="5" fill="#facc15"/>
      <!-- Connector strip at bottom -->
      <rect x="-130" y="75" width="260" height="22" rx="5" fill="#c0c0c0"/>
      <!-- Pins -->
      ${Array.from({ length: 13 }, (_, i) => `<rect x="${-120 + i * 20}" y="70" width="10" height="28" rx="2" fill="#a8a8a8"/>`).join("")}
    </g>`,

  "Air Filter": `
    <!-- Cylindrical air filter -->
    <g transform="translate(400,360)">
      <!-- Top ellipse -->
      <ellipse cx="0" cy="-70" rx="140" ry="45" fill="#e8e8e8"/>
      <!-- Side body -->
      <rect x="-140" y="-70" width="280" height="140" fill="#e2e2e2"/>
      <!-- Filter media lines -->
      ${Array.from({ length: 11 }, (_, i) => `<line x1="${-135 + i * 27}" y1="-68" x2="${-135 + i * 27}" y2="68" stroke="#ccc" stroke-width="2"/>`).join("")}
      <!-- Bottom ellipse -->
      <ellipse cx="0" cy="70" rx="140" ry="45" fill="#d8d8d8"/>
      <!-- Centre neck (inlet) -->
      <ellipse cx="0" cy="-70" rx="55" ry="20" fill="#d0d0d0"/>
      <rect x="-55" y="-90" width="110" height="22" fill="#cccccc"/>
      <ellipse cx="0" cy="-90" rx="55" ry="20" fill="#c8c8c8"/>
      <!-- K&N style red foam ring hint -->
      <ellipse cx="0" cy="-70" rx="140" ry="10" fill="none" stroke="#e05050" stroke-width="5" opacity="0.6"/>
    </g>`,

  "Performance Kit": `
    <!-- Brake disc rotor -->
    <g transform="translate(400,360)">
      <!-- Outer ring (swept surface) -->
      <circle cx="0" cy="0" r="165" fill="#d0d0d0" stroke="#c8c8c8" stroke-width="2"/>
      <circle cx="0" cy="0" r="125" fill="#e8e8e8"/>
      <!-- Drilling holes - 6 × 6 holes evenly spaced -->
      ${Array.from({ length: 6 }, (_, seg) => {
        const angle = (seg * 60 * Math.PI) / 180;
        const r1 = 148, r2 = 135;
        const holes = [0, 22, 42].map((dA) => {
          const a = angle + (dA * Math.PI) / 180;
          const r = dA === 0 ? r1 : dA === 22 ? 140 : r2;
          const x = Math.round(r * Math.cos(a));
          const y = Math.round(r * Math.sin(a));
          return `<circle cx="${x}" cy="${y}" r="8" fill="#c0c0c0"/>`;
        });
        return holes.join("");
      }).join("")}
      <!-- Hat (inner hub) -->
      <circle cx="0" cy="0" r="60" fill="#d8d8d8"/>
      <circle cx="0" cy="0" r="42" fill="#cccccc"/>
      <!-- Bolt holes -->
      ${Array.from({ length: 5 }, (_, i) => {
        const a = (i * 72 * Math.PI) / 180;
        return `<circle cx="${Math.round(52 * Math.cos(a))}" cy="${Math.round(52 * Math.sin(a))}" r="6" fill="#b8b8b8"/>`;
      }).join("")}
      <!-- Radial slots on swept surface -->
      ${Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = Math.round(128 * Math.cos(a)), y1 = Math.round(128 * Math.sin(a));
        const x2 = Math.round(162 * Math.cos(a)), y2 = Math.round(162 * Math.sin(a));
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#bbb" stroke-width="4" stroke-linecap="round"/>`;
      }).join("")}
    </g>`,

  Cosmetic: `
    <!-- Bar-end mirror -->
    <g transform="translate(400,360)">
      <!-- Handlebar end section -->
      <rect x="-210" y="-18" width="90" height="36" rx="18" fill="#d8d8d8"/>
      <!-- Bar end adapter -->
      <rect x="-128" y="-22" width="38" height="44" rx="8" fill="#c8c8c8"/>
      <!-- Arm/stalk -->
      <rect x="-100" y="-10" width="85" height="20" rx="8" fill="#d0d0d0"/>
      <!-- Mirror housing (round) -->
      <circle cx="75" cy="0" r="90" fill="#e0e0e0" stroke="#d0d0d0" stroke-width="3"/>
      <!-- Mirror glass -->
      <circle cx="75" cy="0" r="76" fill="#dce8f0"/>
      <!-- Glass reflection highlight -->
      <ellipse cx="45" cy="-28" rx="28" ry="22" fill="rgba(255,255,255,0.55)" transform="rotate(-25,45,-28)"/>
      <!-- Pivot bolt -->
      <circle cx="-90" cy="0" r="10" fill="#b8b8b8"/>
      <circle cx="-90" cy="0" r="4"  fill="#a0a0a0"/>
    </g>`,

  "Service Kit": `
    <!-- Wrench over oil bottle -->
    <g transform="translate(400,360)">
      <!-- Oil bottle body -->
      <rect x="60" y="-85" width="110" height="165" rx="10" fill="#e2e2e2"/>
      <!-- Bottle cap -->
      <rect x="85" y="-105" width="60" height="26" rx="7" fill="#c8c8c8"/>
      <!-- Red cap accent -->
      <rect x="85" y="-105" width="60" height="12" rx="5" fill="#e05050"/>
      <!-- Label -->
      <rect x="70" y="-45" width="90" height="70" rx="4" fill="#d5d5d5"/>
      <text x="115" y="-15" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#888">10W-50</text>
      <text x="115" y="8"  text-anchor="middle" font-family="monospace" font-size="10" fill="#aaa">FULL SYN</text>

      <!-- Combination wrench (left side) -->
      <!-- Handle -->
      <rect x="-200" y="-12" width="200" height="24" rx="6" fill="#d8d8d8"/>
      <!-- Open end (ring at right of handle) -->
      <circle cx="20" cy="0" r="38" fill="none" stroke="#d0d0d0" stroke-width="24"/>
      <circle cx="20" cy="0" r="18" fill="#f5f5f5"/>
      <!-- Box end (left, simplified as circle) -->
      <circle cx="-195" cy="0" r="34" fill="none" stroke="#d0d0d0" stroke-width="22"/>
      <circle cx="-195" cy="0" r="16" fill="#f5f5f5"/>
      <!-- Hex in box end -->
      ${Array.from({ length: 6 }, (_, i) => {
        const a = (i * 60 * Math.PI) / 180;
        const nx = (i + 1) % 6;
        const na = (nx * 60 * Math.PI) / 180;
        return `<line x1="${Math.round(-195 + 13 * Math.cos(a))}" y1="${Math.round(13 * Math.sin(a))}" x2="${Math.round(-195 + 13 * Math.cos(na))}" y2="${Math.round(13 * Math.sin(na))}" stroke="#bbb" stroke-width="2"/>`;
      }).join("")}
    </g>`
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Shorten text to fit a given pixel budget (rough heuristic). */
function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + "…";
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brand    = esc(truncate(searchParams.get("brand")    ?? "6T4 Customs", 30));
  const name     = esc(truncate(searchParams.get("name")     ?? "Part",        52));
  const category = searchParams.get("category") ?? "Service Kit";

  const icon = ICONS[category] ?? ICONS["Service Kit"];
  const catLabel = esc(category.toUpperCase());

  // Split name into two lines if long
  const words  = name.split(" ");
  let line1 = "", line2 = "";
  let count = 0;
  for (const w of words) {
    if (count === 0 || (line1 + " " + w).length <= 28) {
      line1 = line1 ? line1 + " " + w : w;
      count++;
    } else {
      line2 = line2 ? line2 + " " + w : w;
    }
  }

  const nameY1 = line2 ? 618 : 628;
  const nameY2 = 648;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 800 800" width="800" height="800" xmlns="http://www.w3.org/2000/svg">
  <!-- White product background -->
  <rect width="800" height="800" fill="#ffffff"/>

  <!-- Top red accent bar -->
  <rect width="800" height="5" fill="#dc2626"/>

  <!-- Category icon -->
  ${icon}

  <!-- Hairline divider -->
  <line x1="80" y1="540" x2="720" y2="540" stroke="#ebebeb" stroke-width="1.5"/>

  <!-- Brand name -->
  <text
    x="400" y="582"
    text-anchor="middle"
    font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    font-size="30" font-weight="700" fill="#111111" letter-spacing="1.5"
  >${brand}</text>

  <!-- Product name line 1 -->
  <text
    x="400" y="${nameY1}"
    text-anchor="middle"
    font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    font-size="20" fill="#555555"
  >${line1}</text>

  ${line2 ? `<text
    x="400" y="${nameY2}"
    text-anchor="middle"
    font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    font-size="20" fill="#555555"
  >${line2}</text>` : ""}

  <!-- Category badge -->
  <rect x="220" y="${line2 ? 670 : 660}" width="360" height="36" rx="5" fill="#f5f5f5"/>
  <text
    x="400" y="${line2 ? 693 : 683}"
    text-anchor="middle"
    font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    font-size="12" fill="#999999" letter-spacing="4" font-weight="600"
  >${catLabel}</text>

  <!-- 6T4 watermark -->
  <text
    x="400" y="770"
    text-anchor="middle"
    font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    font-size="11" fill="#cccccc" letter-spacing="3"
  >6T4 CUSTOMS · BACHUPALLY · HYDERABAD</text>

  <!-- Bottom red accent -->
  <rect y="795" width="800" height="5" fill="#dc2626"/>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type":  "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    }
  });
}
