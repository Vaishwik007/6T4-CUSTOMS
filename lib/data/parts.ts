import type { Part, PartCategory } from "./types";
import { MODELS } from "./models";

/** Helpers for compatibility rules */
const all = (brand: string, models: string[], yearStart = 2010, yearEnd: number | null = null) =>
  models.map((model) => ({ brand, model, yearStart, yearEnd }));

const allOfBrand = (brand: string, yearStart = 2010, yearEnd: number | null = null) =>
  MODELS.filter((m) => m.brand === brand).map((m) => ({
    brand,
    model: m.slug,
    yearStart: Math.max(yearStart, m.yearStart),
    yearEnd: m.yearEnd ?? yearEnd
  }));

export const PARTS: Part[] = [
  // ============== EXHAUST ==============
  {
    id: "akra-slipon-carbon-univ",
    name: "Akrapovič Slip-On Carbon",
    brand: "Akrapovič",
    category: "Exhaust",
    description: "Hand-crafted carbon-fibre slip-on. Iconic crackle, +4–6 HP, lighter than stock.",
    price: 89000,
    hpGain: 5,
    soundDb: 102,
    installMinutes: 45,
    compatibility: "universal"
  },
  {
    id: "akra-full-titanium-v4",
    name: "Akrapovič Racing Full System Titanium",
    brand: "Akrapovič",
    category: "Exhaust",
    description: "Race-bred titanium full system. Maximum gain. Track use recommended.",
    price: 285000,
    hpGain: 12,
    soundDb: 108,
    installMinutes: 180,
    compatibility: [
      ...all("ducati", ["panigale-v4", "panigale-v4s", "panigale-v4r", "streetfighter-v4"], 2018),
      ...all("bmw-motorrad", ["s1000rr", "m1000rr"], 2019),
      ...all("kawasaki", ["ninja-zx-10r", "ninja-h2"], 2016),
      ...all("yamaha", ["r1", "r1m"], 2015)
    ]
  },
  {
    id: "sc-project-cr-t",
    name: "SC-Project CR-T Carbon",
    brand: "SC-Project",
    category: "Exhaust",
    description: "MotoGP-derived carbon muffler. Unmistakable raw bark.",
    price: 72000,
    hpGain: 4.5,
    soundDb: 104,
    installMinutes: 40,
    compatibility: [
      ...all("ducati", ["monster-937", "panigale-v2", "streetfighter-v2"], 2020),
      ...all("ktm", ["duke-390", "duke-790", "duke-890", "rc-390"], 2017),
      ...all("aprilia", ["rs-660", "tuono-660"], 2020),
      ...all("triumph", ["street-triple-765", "speed-triple-1200"], 2017)
    ]
  },
  {
    id: "sc-project-s1",
    name: "SC-Project S1 Slip-On",
    brand: "SC-Project",
    category: "Exhaust",
    description: "Aggressive look, performance gain on midweight nakeds.",
    price: 48000,
    hpGain: 3.5,
    soundDb: 100,
    installMinutes: 30,
    compatibility: [
      ...all("yamaha", ["mt-07", "mt-09", "xsr700", "xsr900", "r7", "r3"], 2014),
      ...all("kawasaki", ["z650", "z900", "ninja-650", "ninja-400"], 2017),
      ...all("ktm", ["duke-390", "duke-790", "390-adventure"], 2017)
    ]
  },
  {
    id: "yoshimura-r77",
    name: "Yoshimura R-77 Stainless",
    brand: "Yoshimura",
    category: "Exhaust",
    description: "Classic Yoshimura roar. Stainless body, carbon end-cap.",
    price: 56000,
    hpGain: 4,
    soundDb: 101,
    installMinutes: 35,
    compatibility: [
      ...all("suzuki", ["gsx-r600", "gsx-r750", "gsx-r1000r", "gsx-s1000", "hayabusa", "katana"], 2011),
      ...all("kawasaki", ["ninja-zx-6r", "ninja-zx-10r"], 2011),
      ...all("honda", ["cbr650r", "cbr1000rr-r"], 2019)
    ]
  },
  {
    id: "arrow-pro-race",
    name: "Arrow Pro-Race Nichrom",
    brand: "Arrow",
    category: "Exhaust",
    description: "Italian craftsmanship, dyno-proven gains, road-legal db killer included.",
    price: 64000,
    hpGain: 4.5,
    soundDb: 99,
    installMinutes: 45,
    compatibility: "universal"
  },
  {
    id: "redmoto-shorty",
    name: "RedMoto Shorty Slip-On",
    brand: "RedMoto",
    category: "Exhaust",
    description: "Budget-friendly stainless shorty for Indian-market 150–250cc bikes.",
    price: 12500,
    hpGain: 1.5,
    soundDb: 96,
    installMinutes: 25,
    compatibility: [
      ...all("bajaj", ["pulsar-ns160", "pulsar-ns200", "pulsar-rs200", "pulsar-n250", "pulsar-f250", "dominar-250", "dominar-400"], 2015),
      ...all("ktm", ["duke-125", "duke-200", "duke-250", "rc-125", "rc-200"], 2017),
      ...all("tvs", ["apache-rtr-160-4v", "apache-rtr-200-4v", "apache-rr-310"], 2016),
      ...all("yamaha", ["fz-fi", "fzs-fi", "r15-v4"], 2019),
      ...all("royal-enfield", ["hunter-350", "classic-350", "meteor-350", "bullet-350"], 2020)
    ]
  },
  {
    id: "screamin-eagle-stage1",
    name: "Screamin' Eagle Stage I Slip-On",
    brand: "Harley Genuine",
    category: "Exhaust",
    description: "OEM-backed slip-on with Stage I tune compatibility for Big Twins.",
    price: 78000,
    hpGain: 6,
    soundDb: 103,
    installMinutes: 60,
    compatibility: allOfBrand("harley-davidson", 2017)
  },
  {
    id: "termignoni-conical",
    name: "Termignoni Conical Carbon",
    brand: "Termignoni",
    category: "Exhaust",
    description: "Ducati factory racing partner. The sound of Borgo Panigale.",
    price: 138000,
    hpGain: 7,
    soundDb: 105,
    installMinutes: 60,
    compatibility: allOfBrand("ducati", 2015)
  },

  // ============== ECU TUNING ==============
  {
    id: "powercommander-v",
    name: "Dynojet Power Commander V",
    brand: "Dynojet",
    category: "ECU Tuning",
    description: "Industry-standard fuel/ignition tuner. Custom dyno map included.",
    price: 38000,
    hpGain: 5,
    installMinutes: 90,
    compatibility: "universal"
  },
  {
    id: "rapid-bike-evo",
    name: "Rapid Bike Evo",
    brand: "Rapid Bike",
    category: "ECU Tuning",
    description: "Self-adapting fuel module. Real-time AFR correction.",
    price: 42000,
    hpGain: 6,
    installMinutes: 90,
    compatibility: "universal"
  },
  {
    id: "ecu-flash-stage1",
    name: "6T4 In-House Stage 1 ECU Flash",
    brand: "6T4 Customs",
    category: "ECU Tuning",
    description: "Bench-flashed map by our tuner. Removes restrictions, sharpens throttle.",
    price: 18000,
    hpGain: 4,
    installMinutes: 60,
    compatibility: "universal"
  },
  {
    id: "ecu-flash-stage2",
    name: "6T4 Stage 2 ECU Flash + Slip-On Map",
    brand: "6T4 Customs",
    category: "ECU Tuning",
    description: "Optimised for slip-on + air filter. Required for parts beyond Stage 1.",
    price: 32000,
    hpGain: 7,
    installMinutes: 90,
    compatibility: "universal"
  },
  {
    id: "bazzaz-zfi",
    name: "Bazzaz Z-Fi TC Quickshifter Bundle",
    brand: "Bazzaz",
    category: "ECU Tuning",
    description: "Fuel control + traction + clutchless upshift in one box.",
    price: 64000,
    hpGain: 5,
    installMinutes: 150,
    compatibility: [
      ...all("kawasaki", ["ninja-zx-6r", "ninja-zx-10r", "z900"], 2011),
      ...all("suzuki", ["gsx-r600", "gsx-r750", "gsx-r1000r", "gsx-s1000"], 2011),
      ...all("yamaha", ["r1", "r1m", "r6", "mt-09", "mt-10"], 2015),
      ...all("honda", ["cbr1000rr-r", "cbr650r"], 2019)
    ]
  },
  {
    id: "akra-tuning-cable",
    name: "Akrapovič Tuning Cable",
    brand: "Akrapovič",
    category: "ECU Tuning",
    description: "Unlocks full Akrapovič exhaust map on supported bikes.",
    price: 9500,
    hpGain: 1.5,
    installMinutes: 30,
    compatibility: [
      ...all("ktm", ["duke-690", "duke-790", "duke-890", "1290-super-duke-r", "390-adventure", "890-adventure"], 2017),
      ...all("husqvarna", ["svartpilen-401", "norden-901"], 2018)
    ]
  },

  // ============== AIR FILTER ==============
  {
    id: "kn-replacement",
    name: "K&N High-Flow Air Filter",
    brand: "K&N",
    category: "Air Filter",
    description: "Cotton-gauze, washable, +1–2 HP. Lifetime warranty.",
    price: 4800,
    hpGain: 1.5,
    installMinutes: 15,
    compatibility: "universal"
  },
  {
    id: "bmc-double-air",
    name: "BMC Double Air Filter",
    brand: "BMC",
    category: "Air Filter",
    description: "Italian performance filter. OEM-grade fitment, racetrack performance.",
    price: 6800,
    hpGain: 2,
    installMinutes: 15,
    compatibility: "universal"
  },
  {
    id: "dna-stage2",
    name: "DNA Stage 2 Filter Kit",
    brand: "DNA",
    category: "Air Filter",
    description: "Cone-style + airbox modification kit for serious gains.",
    price: 12500,
    hpGain: 3.5,
    installMinutes: 60,
    compatibility: [
      ...all("ktm", ["duke-390", "duke-790", "duke-890", "rc-390", "390-adventure"], 2017),
      ...all("yamaha", ["mt-07", "mt-09", "r3", "r7"], 2014),
      ...all("kawasaki", ["z650", "z900", "ninja-650"], 2017)
    ]
  },
  {
    id: "sprint-p08-f1",
    name: "Sprint P08 F1-85 Filter",
    brand: "Sprint Filter",
    category: "Air Filter",
    description: "Race-spec polyester filter, used by WSBK teams.",
    price: 8500,
    hpGain: 2.5,
    installMinutes: 15,
    compatibility: "universal"
  },

  // ============== PERFORMANCE KIT ==============
  {
    id: "ohlins-fork-cartridge",
    name: "Öhlins NIX30 Fork Cartridge Kit",
    brand: "Öhlins",
    category: "Performance Kit",
    description: "Drop-in race-grade cartridges. Track-day transformation.",
    price: 145000,
    installMinutes: 240,
    compatibility: [
      ...all("ducati", ["panigale-v4", "panigale-v4s", "panigale-v4r"], 2018),
      ...all("kawasaki", ["ninja-zx-10r", "ninja-zx-6r"], 2016),
      ...all("yamaha", ["r1", "r1m", "r6"], 2015),
      ...all("bmw-motorrad", ["s1000rr", "m1000rr"], 2019),
      ...all("aprilia", ["rsv4"], 2017)
    ]
  },
  {
    id: "ohlins-ttx-shock",
    name: "Öhlins TTX36 Rear Shock",
    brand: "Öhlins",
    category: "Performance Kit",
    description: "TTX twin-tube design. Universally praised damping quality.",
    price: 98000,
    installMinutes: 90,
    compatibility: "universal"
  },
  {
    id: "brembo-stylema",
    name: "Brembo Stylema Front Calipers (Pair)",
    brand: "Brembo",
    category: "Performance Kit",
    description: "Monoblock calipers used in MotoGP. Drop-in for radial-mount bikes.",
    price: 168000,
    installMinutes: 120,
    compatibility: [
      ...all("ducati", ["panigale-v4", "panigale-v4s", "panigale-v4r", "streetfighter-v4", "monster-937"], 2018),
      ...all("kawasaki", ["ninja-zx-10r", "ninja-h2"], 2016),
      ...all("aprilia", ["rsv4", "tuono-v4"], 2017),
      ...all("bmw-motorrad", ["s1000rr", "m1000rr"], 2019),
      ...all("yamaha", ["r1", "r1m"], 2015),
      ...all("ktm", ["1290-super-duke-r"], 2017)
    ]
  },
  {
    id: "ohlins-steering-damper",
    name: "Öhlins Steering Damper",
    brand: "Öhlins",
    category: "Performance Kit",
    description: "Adjustable steering damper for high-speed stability.",
    price: 32000,
    installMinutes: 45,
    compatibility: "universal"
  },
  {
    id: "rotobox-bullet",
    name: "Rotobox Bullet Carbon Wheels (Pair)",
    brand: "Rotobox",
    category: "Performance Kit",
    description: "Carbon wheels. Massive unsprung-mass reduction. Track-day transformation.",
    price: 425000,
    hpGain: 3,
    installMinutes: 120,
    compatibility: [
      ...all("ducati", ["panigale-v4", "panigale-v4s", "panigale-v4r", "streetfighter-v4"], 2018),
      ...all("kawasaki", ["ninja-zx-10r", "ninja-h2"], 2016),
      ...all("yamaha", ["r1", "r1m"], 2015),
      ...all("aprilia", ["rsv4"], 2017),
      ...all("bmw-motorrad", ["s1000rr", "m1000rr"], 2019)
    ]
  },
  {
    id: "ssb-clutch-slipper",
    name: "Suter Slipper Clutch",
    brand: "Suter",
    category: "Performance Kit",
    description: "Race-grade slipper for aggressive downshifts. No more rear-wheel hop.",
    price: 78000,
    installMinutes: 120,
    compatibility: "universal"
  },
  {
    id: "kn-iridium-plug-kit",
    name: "NGK Iridium Plug Set",
    brand: "NGK",
    category: "Performance Kit",
    description: "Iridium plugs for sharper combustion, fewer misfires.",
    price: 3200,
    hpGain: 0.5,
    installMinutes: 30,
    compatibility: "universal"
  },
  {
    id: "scotts-stabilizer",
    name: "Scotts Performance Stabilizer + Mount",
    brand: "Scotts",
    category: "Performance Kit",
    description: "ADV/dirt favourite. Tames high-speed wobble on rough terrain.",
    price: 38000,
    installMinutes: 60,
    compatibility: [
      ...all("ktm", ["390-adventure", "890-adventure", "1290-super-adventure"], 2017),
      ...all("bmw-motorrad", ["g310gs", "f850gs", "f900gs", "r1250gs"], 2017),
      ...all("yamaha", ["tenere-700"], 2019),
      ...all("honda", ["africa-twin", "transalp-750"], 2016),
      ...all("triumph", ["tiger-900", "tiger-1200"], 2020),
      ...all("husqvarna", ["norden-901"], 2022)
    ]
  },

  // ============== COSMETIC ==============
  {
    id: "rizoma-bar-end-mirrors",
    name: "Rizoma Bar-End Mirrors (Pair)",
    brand: "Rizoma",
    category: "Cosmetic",
    description: "Aluminium bar-end mirrors. Café-racer aesthetic, unobstructed view.",
    price: 14500,
    installMinutes: 20,
    compatibility: "universal"
  },
  {
    id: "rizoma-led-indicators",
    name: "Rizoma LED Turn Signals",
    brand: "Rizoma",
    category: "Cosmetic",
    description: "Sleek LED indicators in machined alloy housing.",
    price: 9800,
    installMinutes: 30,
    compatibility: "universal"
  },
  {
    id: "puig-windscreen-touring",
    name: "Puig Touring Windscreen",
    brand: "Puig",
    category: "Cosmetic",
    description: "Tall touring screen. Smoke or clear, fits sport-tourers.",
    price: 7500,
    installMinutes: 20,
    compatibility: "universal"
  },
  {
    id: "puig-windscreen-race",
    name: "Puig Z-Racing Double Bubble Screen",
    brand: "Puig",
    category: "Cosmetic",
    description: "Track-spec double-bubble for tucked-in aero.",
    price: 6800,
    installMinutes: 20,
    compatibility: [
      ...all("yamaha", ["r1", "r1m", "r3", "r7", "r15-v4"], 2015),
      ...all("kawasaki", ["ninja-zx-10r", "ninja-zx-6r", "ninja-650", "ninja-400", "ninja-300"], 2013),
      ...all("honda", ["cbr1000rr-r", "cbr650r", "cbr250r", "cbr150r"], 2014),
      ...all("ducati", ["panigale-v2", "panigale-v4", "panigale-v4s"], 2018),
      ...all("aprilia", ["rsv4", "rs-660", "rs-457"], 2017),
      ...all("ktm", ["rc-125", "rc-200", "rc-390"], 2017)
    ]
  },
  {
    id: "lightech-rearsets",
    name: "LighTech Adjustable Rearsets",
    brand: "LighTech",
    category: "Cosmetic",
    description: "CNC-machined adjustable rearsets. Multiple peg positions.",
    price: 48000,
    installMinutes: 90,
    compatibility: "universal"
  },
  {
    id: "carbon-tank-pad",
    name: "Carbon Fiber Tank Pad",
    brand: "Strauss Carbon",
    category: "Cosmetic",
    description: "Real carbon, gloss finish. Protects tank, looks fast standing still.",
    price: 4500,
    installMinutes: 10,
    compatibility: "universal"
  },
  {
    id: "barkbusters-storm",
    name: "Barkbusters Storm Hand Guards",
    brand: "Barkbusters",
    category: "Cosmetic",
    description: "Aluminium hand guards. ADV-essential.",
    price: 11500,
    installMinutes: 45,
    compatibility: [
      ...all("ktm", ["390-adventure", "890-adventure", "1290-super-adventure"], 2017),
      ...all("bmw-motorrad", ["g310gs", "f850gs", "f900gs", "r1250gs", "f900xr"], 2017),
      ...all("yamaha", ["tenere-700"], 2019),
      ...all("honda", ["africa-twin", "transalp-750", "nx500"], 2016),
      ...all("royal-enfield", ["himalayan-450", "scram-411"], 2018),
      ...all("triumph", ["tiger-900", "tiger-1200", "tiger-sport-660"], 2020),
      ...all("benelli", ["trk-251", "trk-502", "trk-702", "trk-702x"], 2018),
      ...all("hero", ["xpulse-200", "xpulse-200-4v"], 2019)
    ]
  },
  {
    id: "givi-trekker-outback",
    name: "Givi Trekker Outback Aluminum Panniers",
    brand: "Givi",
    category: "Cosmetic",
    description: "Adventure-ready aluminium panniers, 37L pair, monokey mounting.",
    price: 68000,
    installMinutes: 60,
    compatibility: [
      ...all("ktm", ["390-adventure", "890-adventure", "1290-super-adventure"], 2017),
      ...all("bmw-motorrad", ["g310gs", "f850gs", "f900gs", "r1250gs"], 2017),
      ...all("yamaha", ["tenere-700"], 2019),
      ...all("honda", ["africa-twin", "transalp-750"], 2016),
      ...all("royal-enfield", ["himalayan-450"], 2023),
      ...all("triumph", ["tiger-900", "tiger-1200"], 2020),
      ...all("benelli", ["trk-502", "trk-702", "trk-702x"], 2018)
    ]
  },
  {
    id: "led-headlight-conversion",
    name: "Custom LED Projector Headlight",
    brand: "6T4 Customs",
    category: "Cosmetic",
    description: "DOT-compliant projector LED conversion. 3x stock output.",
    price: 8500,
    installMinutes: 60,
    compatibility: "universal"
  },
  {
    id: "carbon-front-fender",
    name: "Carbon Fiber Front Fender",
    brand: "Strauss Carbon",
    category: "Cosmetic",
    description: "OEM-fit carbon fender. Lighter, sharper.",
    price: 12000,
    installMinutes: 30,
    compatibility: "universal"
  },
  {
    id: "frame-sliders",
    name: "Frame Sliders / Crash Protection Set",
    brand: "Womet-Tech",
    category: "Cosmetic",
    description: "Frame sliders + axle sliders + bar-ends. Drop insurance.",
    price: 14500,
    installMinutes: 60,
    compatibility: "universal"
  },

  // ============== SERVICE KIT ==============
  {
    id: "service-major",
    name: "Major Service (15,000 km)",
    brand: "6T4 Customs",
    category: "Service Kit",
    description: "Full service: oil + filter + air filter + plugs + chain + brake fluid + valve check.",
    price: 8500,
    installMinutes: 240,
    compatibility: "universal"
  },
  {
    id: "service-minor",
    name: "Minor Service (5,000 km)",
    brand: "6T4 Customs",
    category: "Service Kit",
    description: "Engine oil + oil filter + visual inspection + brake fluid top-up.",
    price: 3500,
    installMinutes: 90,
    compatibility: "universal"
  },
  {
    id: "chain-sprocket-did",
    name: "DID Gold Chain + JT Sprocket Kit",
    brand: "DID",
    category: "Service Kit",
    description: "DID 525VX3 X-ring chain + JT steel sprockets. 25,000 km lifespan.",
    price: 12500,
    installMinutes: 60,
    compatibility: "universal"
  },
  {
    id: "ebc-brake-pads",
    name: "EBC HH Sintered Brake Pads (Front+Rear)",
    brand: "EBC",
    category: "Service Kit",
    description: "Sintered HH compound. Race-bred bite, road-friendly life.",
    price: 4500,
    installMinutes: 30,
    compatibility: "universal"
  },
  {
    id: "motul-7100-pack",
    name: "Motul 7100 4T 10W-50 (4L) Pack",
    brand: "Motul",
    category: "Service Kit",
    description: "Premium ester-based synthetic. The standard for performance bikes.",
    price: 3800,
    installMinutes: 0,
    compatibility: "universal"
  },
  {
    id: "tyre-pirelli-rosso-iv",
    name: "Pirelli Diablo Rosso IV (Front + Rear Set)",
    brand: "Pirelli",
    category: "Service Kit",
    description: "Latest-gen sport-touring tyres. WSBK-derived compound technology.",
    price: 36500,
    installMinutes: 90,
    compatibility: "universal"
  },
  {
    id: "tyre-michelin-power-6",
    name: "Michelin Power 6 (Front + Rear Set)",
    brand: "Michelin",
    category: "Service Kit",
    description: "Sport-touring with hypersport DNA. Wet/dry confidence.",
    price: 38500,
    installMinutes: 90,
    compatibility: "universal"
  },
  {
    id: "tyre-mrf-zapper",
    name: "MRF Zapper FY1/S1 (Front + Rear)",
    brand: "MRF",
    category: "Service Kit",
    description: "Indian-market sport touring set. Excellent value.",
    price: 11500,
    installMinutes: 90,
    compatibility: [
      ...all("bajaj", ["pulsar-ns160", "pulsar-ns200", "pulsar-rs200", "pulsar-n250", "pulsar-f250", "dominar-250", "dominar-400"], 2015),
      ...all("ktm", ["duke-125", "duke-200", "duke-250", "duke-390", "rc-125", "rc-200", "rc-390"], 2017),
      ...all("tvs", ["apache-rtr-160-4v", "apache-rtr-180", "apache-rtr-200-4v", "apache-rr-310"], 2016),
      ...all("yamaha", ["fz-fi", "fzs-fi", "r15-v4", "mt-03", "r3"], 2016),
      ...all("royal-enfield", ["hunter-350", "classic-350", "meteor-350", "bullet-350", "scram-411", "interceptor-650", "continental-gt-650"], 2018),
      ...all("hero", ["xtreme-160r", "xtreme-200r", "karizma-xmr", "xpulse-200", "xpulse-200-4v"], 2018)
    ]
  },
  {
    id: "coolant-engine-ice",
    name: "Engine Ice Hi-Performance Coolant",
    brand: "Engine Ice",
    category: "Service Kit",
    description: "Race-legal pre-mixed coolant. Lower operating temps.",
    price: 1800,
    installMinutes: 30,
    compatibility: "universal"
  }
];

// Auto-assign default image paths for every part (can be overridden per-part
// later by editing the entry). UI falls back to category icon if file missing.
for (const p of PARTS) {
  if (!p.images) p.images = [`/images/parts/${p.id}.webp`];
}

export const PARTS_BY_ID: Record<string, Part> = Object.fromEntries(PARTS.map((p) => [p.id, p]));

export const PART_CATEGORIES: PartCategory[] = [
  "Exhaust",
  "ECU Tuning",
  "Air Filter",
  "Performance Kit",
  "Cosmetic",
  "Service Kit"
];

/** True if part fits this brand+model+year. */
export function isCompatible(
  part: Part,
  brand: string,
  model: string,
  year: number
): boolean {
  if (part.compatibility === "universal") return true;
  return part.compatibility.some((rule) => {
    if (rule.brand !== brand || rule.model !== model) return false;
    if (year < rule.yearStart) return false;
    if (rule.yearEnd != null && year > rule.yearEnd) return false;
    return true;
  });
}

export function getCompatibleParts(brand: string, model: string, year: number): Part[] {
  return PARTS.filter((p) => isCompatible(p, brand, model, year));
}

export function getCompatiblePartsByCategory(
  brand: string,
  model: string,
  year: number,
  category: PartCategory
): Part[] {
  return getCompatibleParts(brand, model, year).filter((p) => p.category === category);
}

export function getPartById(id: string): Part | undefined {
  return PARTS_BY_ID[id];
}
