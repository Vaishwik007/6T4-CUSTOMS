/**
 * Service catalog — static for now, source of truth for /services UI + JSON-LD.
 * Migrate to Supabase `services` table when /book calendar lands.
 */

export type ServiceCategory = "tuning" | "service" | "dyno" | "fabrication" | "installation" | "diagnostic";

export interface Service {
  slug: string;
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  longDescription: string;
  basePrice: number;          // 0 = quote-required
  priceLabel?: string;        // e.g. "From ₹12,000" if not flat
  durationMinutes: number;
  requiresQuote: boolean;
  bayRequired: number;
  includes: string[];
  prerequisites: string[];
  faqs: { q: string; a: string }[];
  tier?: 1 | 2 | 3;           // stage tier
}

export const SERVICES: Service[] = [
  {
    slug: "stage-1-flash",
    name: "Stage 1 ECU Flash",
    category: "tuning",
    shortDescription: "Hand-mapped fuel + ignition for a stock airbox and exhaust. Drop the lean spots, sharpen the throttle.",
    longDescription:
      "We pull your stock map, log it on the dyno, and rewrite the fuel and ignition tables for the fuel quality you actually run. Stage 1 is the cleanest gain a stock bike will see — no new parts required.",
    basePrice: 9500,
    durationMinutes: 180,
    requiresQuote: false,
    bayRequired: 1,
    tier: 1,
    includes: ["Pre-tune dyno run", "Custom fuel + ignition map", "Post-tune dyno run", "PDF run sheet", "1-year remap warranty"],
    prerequisites: [],
    faqs: [
      { q: "Will this void my warranty?", a: "It's reversible — we keep your stock map and can flash it back before service visits." },
      { q: "What HP gain should I expect?", a: "Typical Stage 1 gains: 4–8 HP on most singles, 6–12 HP on parallel twins and triples. Specific gain depends on the bike and fuel grade." }
    ]
  },
  {
    slug: "stage-2-flash",
    name: "Stage 2 Tune (with exhaust + intake)",
    category: "tuning",
    shortDescription: "Stage 2 map for a slip-on or full system + high-flow filter. Where most of the real-world gains live.",
    longDescription:
      "Stage 2 maps assume an aftermarket exhaust (slip-on or full) and a high-flow filter. We dyno before/after, log AFR across the rev range, and dial in a map that's safe at your altitude on your fuel.",
    basePrice: 14500,
    durationMinutes: 240,
    requiresQuote: false,
    bayRequired: 1,
    tier: 2,
    includes: ["Hardware install check", "Pre-tune dyno run", "Stage 2 custom map", "Post-tune dyno run + AFR log", "PDF run sheet", "1-year remap warranty"],
    prerequisites: ["Aftermarket exhaust (slip-on or full)", "High-flow air filter"],
    faqs: [
      { q: "Can I supply my own parts?", a: "Yes — we'll inspect them, install, and tune. Or buy parts through us for a discount on labour." },
      { q: "How long does the bike stay?", a: "One bay day if parts are with us. Two if they ship to the shop separately." }
    ]
  },
  {
    slug: "stage-3-custom",
    name: "Stage 3 Custom Build",
    category: "tuning",
    shortDescription: "Full custom map for substantially modified bikes — cams, big-bore, forced induction, race fuel.",
    longDescription:
      "Stage 3 is for bikes outside the standard envelope: high-comp pistons, cams, larger throttle bodies, forced induction. We dyno extensively, log multiple sessions, and build a map specific to your build, your fuel, and your intended use (street, trackday, race).",
    basePrice: 32000,
    priceLabel: "From ₹32,000",
    durationMinutes: 480,
    requiresQuote: true,
    bayRequired: 1,
    tier: 3,
    includes: [
      "Initial consult + bike teardown inspection",
      "Multiple dyno sessions across maps",
      "Custom fuel + ignition tables",
      "AFR log across all conditions",
      "PDF performance report",
      "1-year remap warranty",
      "Re-tune included if hardware changes within 90 days"
    ],
    prerequisites: ["Significantly modified bike", "Discussion with Arjun first"],
    faqs: [
      { q: "How long does Stage 3 take?", a: "Typically 2–4 bay days, depending on how clean the build is when it arrives." },
      { q: "Can you build for race-only use?", a: "Yes. We've mapped bikes for the Indian Track Schools and a couple of national series." }
    ]
  },
  {
    slug: "dyno-run",
    name: "Dyno Run + Report",
    category: "dyno",
    shortDescription: "Three-pull dyno session with a printed run sheet. No tuning — just numbers, honest ones.",
    longDescription:
      "Bring your bike, ride it through three full-throttle pulls, leave with a PDF showing HP, torque, AFR, and run conditions. Useful for verifying a third-party tune, baselining before mods, or just bragging rights.",
    basePrice: 3500,
    durationMinutes: 90,
    requiresQuote: false,
    bayRequired: 1,
    includes: ["3 full pulls", "HP + torque curves", "AFR overlay", "Environmental correction", "Printed + PDF run sheet"],
    prerequisites: [],
    faqs: [
      { q: "Can you tune off this session?", a: "Not on a single dyno run — proper tuning needs more sessions. Book a Stage 1/2 if that's your goal." }
    ]
  },
  {
    slug: "major-service",
    name: "Major Service",
    category: "service",
    shortDescription: "Full schedule service — fluids, filters, valve check, brake bleed, chain. Photo-receipts.",
    longDescription:
      "Manufacturer-spec major service. Engine oil + filter, brake fluid, coolant, air filter, spark plugs, valve clearance check, chain clean + adjust, brake pad inspection. Photo receipts of work done, before you collect.",
    basePrice: 6500,
    priceLabel: "From ₹6,500 (parts billed at cost)",
    durationMinutes: 360,
    requiresQuote: false,
    bayRequired: 1,
    includes: [
      "Engine oil + filter change (your oil or ours)",
      "Brake fluid + coolant refresh",
      "Air filter inspection / clean",
      "Spark plug inspection",
      "Valve clearance check",
      "Chain clean + adjust",
      "Brake pad inspection",
      "Photo log of work done"
    ],
    prerequisites: [],
    faqs: [
      { q: "How long does it take?", a: "One bay day for most bikes. Sport bikes with fairings off can take a second day." }
    ]
  },
  {
    slug: "fabrication",
    name: "Custom Fabrication",
    category: "fabrication",
    shortDescription: "TIG-welded subframes, sliders, brackets, exhaust mods. Quote-based, one-off work.",
    longDescription:
      "Hand-welded steel and aluminium fabrication. Subframes for café racers, frame sliders, custom brackets, exhaust mods, rear-set hardware. We start with a sketch on paper, build a jig, and weld it.",
    basePrice: 0,
    priceLabel: "Quote",
    durationMinutes: 720,
    requiresQuote: true,
    bayRequired: 1,
    includes: ["Free consult + sketch", "Material sourcing", "TIG welded build", "Powder coat (if required)", "Bench-fit check"],
    prerequisites: ["Initial WhatsApp consult with Arjun"],
    faqs: [
      { q: "How long is the lead time?", a: "Depends on complexity. A frame slider bracket is a few days; a full subframe is a few weeks. We confirm before starting." }
    ]
  }
];

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getServicesByCategory(): Record<ServiceCategory, Service[]> {
  const out = {} as Record<ServiceCategory, Service[]>;
  for (const s of SERVICES) {
    if (!out[s.category]) out[s.category] = [];
    out[s.category].push(s);
  }
  return out;
}
